import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// 🔥 PEGA AQUÍ TU CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMAIN",
  projectId: "TU_PROJECT_ID"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// =========================
// VARIABLES
// =========================

let currentProjectId = null;
let isAdmin = false;
const ADMIN_PASS = "1234";

const formatMoney = n =>
  "$" + Number(n || 0).toLocaleString("es-CO");


// =========================
// LOGIN ADMIN
// =========================

loginBtn.onclick = () => {

  if(adminPass.value === ADMIN_PASS){

    isAdmin = true;

    modeText.innerText = "Modo 👑 Admin";

    alert("Admin activado");

  }else{

    alert("Clave incorrecta");

  }

};



// =========================
// CREAR PROYECTO
// =========================

createProjectBtn.onclick = async () => {

  if(!isAdmin) return alert("Solo admin");

  const name = newProjectName.value.trim();

  if(!name) return;

  const ref = await addDoc(collection(db,"projects"),{
    name
  });

  currentProjectId = ref.id;

  newProjectName.value="";

  loadProject();

};



// =========================
// LISTAR PROYECTOS
// =========================

onSnapshot(collection(db,"projects"), snap => {

  projectSelect.innerHTML = "";

  snap.forEach(docu=>{

    const opt = document.createElement("option");

    opt.value = docu.id;
    opt.innerText = docu.data().name;

    projectSelect.appendChild(opt);

  });

});



projectSelect.onchange = () => {

  currentProjectId = projectSelect.value;

  loadProject();

};



// =========================
// CARGAR PROYECTO
// =========================

function loadProject(){

  if(!currentProjectId) return;


  const peopleRef = collection(db,"projects",currentProjectId,"people");
  const incomeRef = collection(db,"projects",currentProjectId,"ingresos");
  const expenseRef = collection(db,"projects",currentProjectId,"egresos");
  const debtRef = collection(db,"projects",currentProjectId,"debts");


  // PERSONAS
  onSnapshot(peopleRef, snap=>{

    peopleList.innerHTML="";
    incomePerson.innerHTML="";
    expensePerson.innerHTML="";
    debtFrom.innerHTML="";
    debtTo.innerHTML="";


    snap.forEach(docu=>{

      const name = docu.data().name;

      const div = document.createElement("div");
      div.className="item";

      div.innerHTML = `
        <span>🤙 ${name}</span>
        ${isAdmin ? `<button class="btn-delete">✕</button>`:""}
      `;

      if(isAdmin){
        div.querySelector("button").onclick =
          ()=>deleteDoc(docu.ref);
      }

      peopleList.appendChild(div);


      [incomePerson,expensePerson,debtFrom,debtTo]
      .forEach(sel=>{

        const opt=document.createElement("option");
        opt.value=name;
        opt.innerText=name;

        sel.appendChild(opt);

      });

    });

  });



  // INGRESOS
  onSnapshot(incomeRef, snap=>{

    incomeList.innerHTML="";
    let total=0;

    snap.forEach(docu=>{

      const d=docu.data();
      total+=Number(d.amount);


      const date =
        d.date?.toDate?.().toLocaleDateString() || "";


      const div=document.createElement("div");
      div.className="item";

      div.innerHTML=`
        <span>🍻 ${d.person} - ${formatMoney(d.amount)} (${date})</span>
        ${isAdmin ? `<button class="btn-delete">✕</button>`:""}
      `;

      if(isAdmin){
        div.querySelector("button").onclick =
          ()=>deleteDoc(docu.ref);
      }

      incomeList.appendChild(div);

    });

    incomeTotal.innerText = formatMoney(total);

    updateBalance();

  });



  // EGRESOS
  onSnapshot(expenseRef, snap=>{

    expenseList.innerHTML="";
    let total=0;

    snap.forEach(docu=>{

      const d=docu.data();
      total+=Number(d.amount);

      const date =
        d.date?.toDate?.().toLocaleDateString() || "";


      const div=document.createElement("div");
      div.className="item";

      div.innerHTML=`
        <span>💩 ${d.person} - ${formatMoney(d.amount)} (${date})</span>
        ${isAdmin ? `<button class="btn-delete">✕</button>`:""}
      `;

      if(isAdmin){
        div.querySelector("button").onclick =
          ()=>deleteDoc(docu.ref);
      }

      expenseList.appendChild(div);

    });

    expenseTotal.innerText = formatMoney(total);

    updateBalance();

  });



  // DEUDAS
  onSnapshot(debtRef, snap=>{

    debtsList.innerHTML="";

    snap.forEach(docu=>{

      const d = docu.data();

      const div=document.createElement("div");
      div.className="item";

      div.innerHTML=`
        <span>💸 ${d.from} debe ${formatMoney(d.amount)} a ${d.to}</span>
        ${isAdmin ? `<button class="btn-delete">✕</button>`:""}
      `;

      if(isAdmin){
        div.querySelector("button").onclick =
          ()=>deleteDoc(docu.ref);
      }

      debtsList.appendChild(div);

    });

  });

}



// =========================
// AGREGAR PERSONA
// =========================

addPersonBtn.onclick = async ()=>{

  if(!isAdmin) return alert("Solo admin");

  if(!currentProjectId) return alert("Selecciona proyecto");

  const name = personName.value.trim();

  if(!name) return;

  await addDoc(
    collection(db,"projects",currentProjectId,"people"),
    {name}
  );

  personName.value="";

};



// =========================
// INGRESOS
// =========================

addIncomeBtn.onclick = async ()=>{

  if(!isAdmin) return;

  await addDoc(
    collection(db,"projects",currentProjectId,"ingresos"),
    {
      person:incomePerson.value,
      amount:Number(incomeAmount.value),
      date:serverTimestamp()
    }
  );

  incomeAmount.value="";

};



// =========================
// EGRESOS
// =========================

addExpenseBtn.onclick = async ()=>{

  if(!isAdmin) return;

  await addDoc(
    collection(db,"projects",currentProjectId,"egresos"),
    {
      person:expensePerson.value,
      amount:Number(expenseAmount.value),
      date:serverTimestamp()
    }
  );

  expenseAmount.value="";

};



// =========================
// DEUDAS
// =========================

addDebtBtn.onclick = async ()=>{

  if(!isAdmin) return;

  await addDoc(
    collection(db,"projects",currentProjectId,"debts"),
    {
      from:debtFrom.value,
      to:debtTo.value,
      amount:Number(debtAmount.value),
      date:serverTimestamp()
    }
  );

  debtAmount.value="";

};



// =========================
// BALANCE
// =========================

function updateBalance(){

  const inc = Number(incomeTotal.innerText.replace(/\D/g,'')) || 0;
  const exp = Number(expenseTotal.innerText.replace(/\D/g,'')) || 0;

  balanceTotal.innerText = formatMoney(inc-exp);

}



// =========================
// WHATSAPP
// =========================

shareBtn.onclick = ()=>{

  const text = `Balance actual ${balanceTotal.innerText}`;

  window.open(
    `https://wa.me/?text=${encodeURIComponent(text)}`
  );

};
