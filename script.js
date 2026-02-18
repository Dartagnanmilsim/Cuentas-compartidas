import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfMEoJ0yuS9EE1UC8cWH",
  authDomain: "gastos-parche.firebaseapp.com",
  projectId: "gastos-parche",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_PASSWORD = "1234";

let role = "viewer";
let currentProject = null;
let data = { people: [], transactions: [] };

function ref(){ return doc(db,"budgets",currentProject); }

async function save(){
  if(!currentProject) return;
  await setDoc(ref(),data);
}

async function loadProjects(){

  const querySnapshot = await getDocs(collection(db,"budgets"));
  const select = document.getElementById("projectSelect");

  select.innerHTML = '<option value="">Seleccionar proyecto</option>';

  querySnapshot.forEach(docSnap=>{
    let opt=document.createElement("option");
    opt.value=docSnap.id;
    opt.textContent=docSnap.id;
    select.appendChild(opt);
  });
}

function connect(){

  if(!currentProject) return;

  onSnapshot(ref(), snap=>{
    if(snap.exists()) data=snap.data();
    updateUI();
  });
}

document.getElementById("projectSelect").addEventListener("change",e=>{
  currentProject=e.target.value;
  connect();
});

window.login=function(){

  let pass=document.getElementById("adminPass").value;

  if(pass===ADMIN_PASSWORD){

    role="admin";
    document.getElementById("roleLabel").innerText="Modo 👑 Admin";

    document.querySelectorAll(".admin")
      .forEach(e=>e.classList.remove("hidden"));
  }
};

function isAdmin(){ return role==="admin"; }

window.createProject=async function(){

  if(!isAdmin()) return;

  let name=document.getElementById("newProject").value.trim();
  if(!name) return;

  currentProject=name;

  await setDoc(doc(db,"budgets",name),{
    people:[],
    transactions:[]
  });

  await loadProjects();

  document.getElementById("projectSelect").value=name;

  connect();
};

window.addPerson=function(){

  if(!isAdmin()) return;

  let name=document.getElementById("personName").value.trim();
  if(!name) return;

  data.people.push(name);
  save();
};

window.addTransaction=function(type){

  if(!isAdmin()) return;

  let person=document.getElementById(
    type==="income"?"incomePerson":"expensePerson"
  ).value;

  let amount=parseFloat(
    document.getElementById(
      type==="income"?"incomeAmount":"expenseAmount"
    ).value
  );

  if(!person || !amount) return;

  data.transactions.push({
    person,
    amount,
    type,
    date: new Date().toISOString()
  });

  save();
};

function formatMoney(n){
  return n.toLocaleString("es-CO",{minimumFractionDigits:2});
}

function calculateBalances(){

  let balances={};

  data.people.forEach(p=>balances[p]=0);

  data.transactions.forEach(t=>{
    if(t.type==="income") balances[t.person]+=t.amount;
    else balances[t.person]-=t.amount;
  });

  return balances;
}

function calculateDebts(balances){

  let result=[];

  let creditors=[];
  let debtors=[];

  Object.entries(balances).forEach(([p,v])=>{
    if(v>0) creditors.push({p,v});
    if(v<0) debtors.push({p,v});
  });

  debtors.forEach(d=>{
    creditors.forEach(c=>{
      if(d.v===0) return;

      let pay=Math.min(c.v,Math.abs(d.v));

      if(pay>0){
        result.push(`${d.p} debe $${formatMoney(pay)} a ${c.p}`);
        c.v-=pay;
        d.v+=pay;
      }
    });
  });

  return result;
}

function showDetail(person,type){

  let list=data.transactions
    .filter(t=>t.person===person && t.type===type);

  let html="";

  list.forEach(t=>{
    html+=`
      <div>
        $${formatMoney(t.amount)} — ${new Date(t.date).toLocaleDateString()}
      </div>
    `;
  });

  document.getElementById("modalTitle").innerText=`Detalle ${person}`;
  document.getElementById("modalBody").innerHTML=html;

  document.getElementById("modal").classList.remove("hidden");
}

window.closeModal=function(){
  document.getElementById("modal").classList.add("hidden");
};

function updateUI(){

  if(!currentProject) return;

  let peopleList=document.getElementById("peopleList");
  let incomeSelect=document.getElementById("incomePerson");
  let expenseSelect=document.getElementById("expensePerson");

  peopleList.innerHTML="";
  incomeSelect.innerHTML="";
  expenseSelect.innerHTML="";

  data.people.forEach(p=>{

    peopleList.innerHTML+=`<div class="people-item">${p}</div>`;

    let opt=document.createElement("option");
    opt.value=p;
    opt.textContent=p;

    incomeSelect.appendChild(opt.cloneNode(true));
    expenseSelect.appendChild(opt.cloneNode(true));
  });

  let totalIncome=0;
  let totalExpense=0;

  let ranking={};

  data.transactions.forEach(t=>{

    if(!ranking[t.person]) ranking[t.person]=0;
    if(t.type==="income") ranking[t.person]+=t.amount;

    if(t.type==="income") totalIncome+=t.amount;
    else totalExpense+=t.amount;
  });

  document.getElementById("totalIncome").innerText=formatMoney(totalIncome);
  document.getElementById("totalExpense").innerText=formatMoney(totalExpense);

  let balance=totalIncome-totalExpense;
  document.getElementById("balance").innerText="$ "+formatMoney(balance);

  updateRanking(ranking);

  let balances=calculateBalances();
  let debts=calculateDebts(balances);

  let debtsDiv=document.getElementById("debts");
  debtsDiv.innerHTML="";

  debts.forEach(d=>{
    debtsDiv.innerHTML+=`<div class="item">${d}</div>`;
  });
}

function updateRanking(ranking){

  let div=document.getElementById("ranking");

  div.innerHTML="";

  let sorted=Object.entries(ranking)
    .sort((a,b)=>b[1]-a[1]);

  sorted.forEach((r,i)=>{

    let medal=["🥇","🥈","🥉"][i] || "🎖️";

    div.innerHTML+=`
      <div class="item">
        ${medal} ${r[0]} — $${formatMoney(r[1])}
      </div>
    `;
  });
}

window.shareWhatsApp=function(){

  let text="🍻 Gastos del Parche\n";

  data.people.forEach(p=>{
    let total=data.transactions
      .filter(t=>t.person===p && t.type==="income")
      .reduce((a,b)=>a+b.amount,0);

    text+=`${p}: $${formatMoney(total)}\n`;
  });

  let url=`https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url);
};

loadProjects();
