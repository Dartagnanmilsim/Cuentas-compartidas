import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfMEoJ0yuS9EE1UC8cWH",
  authDomain: "gastos-parche.firebaseapp.com",
  projectId: "gastos-parche",
  storageBucket: "gastos-parche.appspot.com",
  messagingSenderId: "558910304272",
  appId: "1:558910304272:web:e9ae826d1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_PASSWORD = "1234";

let role = "viewer";
let currentProject = null;
let unsubscribe = null;

let data = { people: [], transactions: [] };

const colors = ["#ff6b6b","#6bc5ff","#6bff95","#d96bff","#ffb36b","#6b83ff"];

function getColor(name){
  let index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function ref(){ return doc(db,"budgets",currentProject); }

async function save(){
  if(!currentProject) return;
  await setDoc(ref(),data);
}

async function loadProjects(){

  const querySnapshot = await getDocs(collection(db,"budgets"));
  const select = document.getElementById("projectSelect");

  select.innerHTML = '<option value="">Seleccionar proyecto...</option>';

  querySnapshot.forEach(docSnap=>{
    let opt = document.createElement("option");
    opt.value = docSnap.id;
    opt.textContent = docSnap.id;
    select.appendChild(opt);
  });
}

function connectProject(){

  if(!currentProject) return;

  if(unsubscribe) unsubscribe();

  unsubscribe = onSnapshot(ref(), snap=>{

    if(snap.exists()) data = snap.data();
    else data = { people:[], transactions:[] };

    updateUI();
  });
}

window.login = function(){

  let pass = document.getElementById("adminPass").value;

  if(pass === ADMIN_PASSWORD){

    role="admin";
    document.getElementById("roleLabel").textContent="Modo: 👑 Admin";

    document.querySelectorAll(".admin")
      .forEach(e=>e.classList.remove("hidden"));
  }
};

function isAdmin(){ return role==="admin"; }

window.createProject = async function(){

  if(!isAdmin()) return;

  let name = document.getElementById("newProject").value.trim();
  if(!name) return;

  currentProject=name;

  await setDoc(doc(db,"budgets",name),{
    people:[],
    transactions:[]
  });

  await loadProjects();

  document.getElementById("projectSelect").value=name;

  connectProject();
};

window.deleteProject = async function(){

  if(!isAdmin()) return;
  if(!currentProject) return;

  await deleteDoc(doc(db,"budgets",currentProject));

  currentProject=null;

  if(unsubscribe) unsubscribe();

  await loadProjects();

  alert("Proyecto eliminado");
};

document.getElementById("projectSelect").addEventListener("change",e=>{
  currentProject=e.target.value;
  connectProject();
});

window.addPerson=function(){

  if(!isAdmin()) return;

  let name=document.getElementById("personName").value.trim();
  if(!name) return;

  data.people.push(name);

  save();
};

window.deletePerson=function(i){

  if(!isAdmin()) return;

  let name=data.people[i];

  data.people.splice(i,1);

  data.transactions=data.transactions.filter(t=>t.person!==name);

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

  if(!person||!amount) return;

  data.transactions.push({person,amount,type});

  save();

  partyMode();   // 🎉 ahora sí funciona
};

window.deleteTransaction=function(i){

  if(!isAdmin()) return;

  data.transactions.splice(i,1);

  save();
};

function partyMode(){

  const emojis=["🍻","🎉","🔥","💸","🕺"];

  for(let i=0;i<10;i++){

    let el=document.createElement("div");

    el.className="party-emoji";
    el.innerText=emojis[Math.floor(Math.random()*emojis.length)];

    el.style.left=Math.random()*100+"%";
    el.style.top="0px";

    document.body.appendChild(el);

    setTimeout(()=>el.remove(),1500);
  }
}

function formatMoney(n){
  return n.toLocaleString("es-CO",{minimumFractionDigits:2});
}

function funText(balance){

  if(balance>500000) return "🔥 Este parche está poderoso";
  if(balance>0) return "🍻 Vamos bien";
  if(balance<0) return "💀 Se están quebrando";
  return "😎 Todo bajo control";
}

window.shareWhatsApp = function(){

  if(!currentProject) return;

  let text=`🍻 *${currentProject}*\n\n`;

  data.people.forEach(p=>{

    let total=data.transactions
      .filter(t=>t.person===p && t.type==="income")
      .reduce((a,b)=>a+b.amount,0);

    text+=`${p}: $${formatMoney(total)}\n`;
  });

  let url=`https://wa.me/?text=${encodeURIComponent(text)}`;

  window.open(url,"_blank");
};

function updateUI(){

  if(!currentProject) return;

  let peopleList=document.getElementById("peopleList");
  let incomeSelect=document.getElementById("incomePerson");
  let expenseSelect=document.getElementById("expensePerson");

  peopleList.innerHTML="";
  incomeSelect.innerHTML="";
  expenseSelect.innerHTML="";

  data.people.forEach((p,i)=>{

    let color=getColor(p);

    peopleList.innerHTML+=`
      <div class="people-item">
        <div class="people-left">
          <div class="avatar" style="background:${color}">
            ${p[0].toUpperCase()}
          </div>
          ${p}
        </div>
        ${isAdmin()?`<button class="btn-delete" onclick="deletePerson(${i})">✕</button>`:""}
      </div>
    `;

    let opt=document.createElement("option");
    opt.value=p;
    opt.textContent=p;

    incomeSelect.appendChild(opt.cloneNode(true));
    expenseSelect.appendChild(opt.cloneNode(true));
  });

  let totalIncome=0;
  let totalExpense=0;

  let incomeList=document.getElementById("incomeList");
  let expenseList=document.getElementById("expenseList");

  incomeList.innerHTML="";
  expenseList.innerHTML="";

  let ranking={};

  data.transactions.forEach((t,i)=>{

    if(!ranking[t.person]) ranking[t.person]=0;
    if(t.type==="income") ranking[t.person]+=t.amount;

    let html=`
      <div class="item">
        <span>${t.person} - $${formatMoney(t.amount)}</span>
        ${isAdmin()?`<button class="btn-delete" onclick="deleteTransaction(${i})">✕</button>`:""}
      </div>
    `;

    if(t.type==="income"){
      totalIncome+=t.amount;
      incomeList.innerHTML+=html;
    }else{
      totalExpense+=t.amount;
      expenseList.innerHTML+=html;
    }
  });

  document.getElementById("totalIncome").textContent=formatMoney(totalIncome);
  document.getElementById("totalExpense").textContent=formatMoney(totalExpense);

  let balance=totalIncome-totalExpense;

  document.getElementById("balance").textContent="$ "+formatMoney(balance);

  document.getElementById("funMessage").textContent=funText(balance);

  updateRanking(ranking);
}

function updateRanking(ranking){

  let div=document.getElementById("ranking");

  let sorted=Object.entries(ranking)
    .sort((a,b)=>b[1]-a[1]);

  div.innerHTML="";

  sorted.forEach((r,i)=>{

    let medal=["🥇","🥈","🥉"][i] || "🎖️";

    div.innerHTML+=`
      <div class="item">
        <span>${medal} ${r[0]}</span>
        <strong>$${formatMoney(r[1])}</strong>
      </div>
    `;
  });
}

loadProjects();
