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

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMAIN",
  projectId: "TU_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentProjectId = null;
let isAdmin = false;
const ADMIN_PASS = "1234";

const formatMoney = n =>
  "$" + Number(n || 0).toLocaleString("es-CO");

loginBtn.onclick = () => {
  if(adminPass.value === ADMIN_PASS){
    isAdmin = true;
    modeText.innerText = "Modo 👑 Admin";
  }
};

createProjectBtn.onclick = async () => {
  if(!isAdmin) return alert("Solo admin");

  const name = newProjectName.value;
  if(!name) return;

  const docRef = await addDoc(collection(db,"projects"),{
    name
  });

  currentProjectId = docRef.id;
};

onSnapshot(collection(db,"projects"), snap=>{
  projectSelect.innerHTML="";
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

function loadProject(){

  const peopleRef = collection(db,"projects",currentProjectId,"people");
  const incomeRef = collection(db,"projects",currentProjectId,"ingresos");
  const expenseRef = collection(db,"projects",currentProjectId,"egresos");
  const debtsRef = collection(db,"projects",currentProjectId,"debts");

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
          () => deleteDoc(docu.ref);
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

  onSnapshot(incomeRef, snap=>{
    let total=0;
    incomeList.innerHTML="";

    snap.forEach(docu=>{
      const d = docu.data();
      total+=Number(d.amount);

      const div=document.createElement("div");
      div.className="item";

      const date = d.date?.toDate?.().toLocaleDateString() || "";

      div.innerHTML=`
        <span>🍻 ${d.person} - ${formatMoney(d.amount)} (${date})</span>
        ${isAdmin?`<button class="btn-delete">✕</button>`:""}
      `;

      if(isAdmin){
        div.querySelector("button").onclick=
          ()=>deleteDoc(docu.ref);
      }

      incomeList.appendChild(div);
    });

    incomeTotal.innerText=formatMoney(total);
    updateBalance();
    updateRanking();
  });

  onSnapshot(expenseRef, snap=>{
    let total=0;
    expenseList.innerHTML="";

    snap.forEach(docu=>{
      const d = docu.data();
      total+=Number(d.amount);

      const div=document.createElement("div");
      div.className="item";

      const date = d.date?.toDate?.().toLocaleDateString() || "";

      div.innerHTML=`
        <span>💩 ${d.person} - ${formatMoney(d.amount)} (${date})</span>
        ${isAdmin?`<button class="btn-delete">✕</button>`:""}
      `;

      if(isAdmin){
        div.querySelector("button").onclick=
          ()=>deleteDoc(docu.ref);
      }

      expenseList.appendChild(div);
    });

    expenseTotal.innerText=formatMoney(total);
    updateBalance();
  });

  onSnapshot(debtsRef, snap=>{
    debtsList.innerHTML="";

    snap.forEach(docu=>{
      const d = docu.data();

      const div=document.createElement("div");
      div.className="debt-item";

      div.innerHTML=`
        <span>💸 ${d.from} debe ${formatMoney(d.amount)} a ${d.to}</span>
        ${isAdmin?`<button class="btn-delete">✕</button>`:""}
      `;

      if(isAdmin){
        div.querySelector("button").onclick=
          ()=>deleteDoc(docu.ref);
      }

      debtsList.appendChild(div);
    });
  });
}

addPersonBtn.onclick = async ()=>{
  if(!isAdmin) return;
  const name=personName.value;
  if(!name) return;

  await addDoc(collection(db,"projects",currentProjectId,"people"),{
    name
  });

  personName.value="";
};

addIncomeBtn.onclick = async ()=>{
  if(!isAdmin) return;

  await addDoc(collection(db,"projects",currentProjectId,"ingresos"),{
    person:incomePerson.value,
    amount:Number(incomeAmount.value),
    date:serverTimestamp()
  });

  incomeAmount.value="";
};

addExpenseBtn.onclick = async ()=>{
  if(!isAdmin) return;

  await addDoc(collection(db,"projects",currentProjectId,"egresos"),{
    person:expensePerson.value,
    amount:Number(expenseAmount.value),
    date:serverTimestamp()
  });

  expenseAmount.value="";
};

addDebtBtn.onclick = async ()=>{
  if(!isAdmin) return;

  await addDoc(collection(db,"projects",currentProjectId,"debts"),{
    from:debtFrom.value,
    to:debtTo.value,
    amount:Number(debtAmount.value),
    date:serverTimestamp()
  });

  debtAmount.value="";
};

function updateBalance(){
  const inc = Number(incomeTotal.innerText.replace(/\D/g,'')) || 0;
  const exp = Number(expenseTotal.innerText.replace(/\D/g,'')) || 0;
  balanceTotal.innerText=formatMoney(inc-exp);
}

function updateRanking(){
  ranking.innerHTML="🏆 Próximamente ranking dinámico";
}

shareBtn.onclick=()=>{
  const text = `Balance actual ${balanceTotal.innerText}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
};
