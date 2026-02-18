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

function ref(){
  return doc(db,"budgets",currentProject);
}

async function save(){
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
    document.querySelector(".admin").classList.remove("hidden");
  }
};

window.createProject=async function(){

  if(role!=="admin") return;

  let name=document.getElementById("newProject").value;

  currentProject=name;

  await setDoc(doc(db,"budgets",name),{
    people:[],
    transactions:[]
  });

  loadProjects();
  connect();
};

window.addPerson=function(){

  if(role!=="admin") return;

  let name=document.getElementById("personName").value;

  data.people.push(name);

  save();
};

window.addTransaction=function(type){

  if(role!=="admin") return;

  let person=document.getElementById(
    type==="income"?"incomePerson":"expensePerson"
  ).value;

  let amount=parseFloat(
    document.getElementById(
      type==="income"?"incomeAmount":"expenseAmount"
    ).value
  );

  data.transactions.push({person,amount,type});

  save();
};

window.shareWhatsApp=function(){

  let text="🍻 Gastos del Parche\n";

  data.people.forEach(p=>{
    let total=data.transactions
      .filter(t=>t.person===p && t.type==="income")
      .reduce((a,b)=>a+b.amount,0);

    text+=`${p}: $${total}\n`;
  });

  let url=`https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url);
};

function updateUI(){

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

  document.getElementById("totalIncome").innerText=totalIncome;
  document.getElementById("totalExpense").innerText=totalExpense;

  document.getElementById("balance").innerText=
    totalIncome-totalExpense;

  updateRanking(ranking);
}

function updateRanking(ranking){

  let div=document.getElementById("ranking");

  div.innerHTML="";

  Object.entries(ranking)
    .sort((a,b)=>b[1]-a[1])
    .forEach(r=>{

      div.innerHTML+=`
        <div class="item">
          ${r[0]} — $${r[1]}
        </div>
      `;
    });
}

loadProjects();
