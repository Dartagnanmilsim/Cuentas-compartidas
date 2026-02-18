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

let data = {
  people: [],
  transactions: []
};

function ref() {
  return doc(db, "budgets", currentProject);
}

async function save() {
  if (!currentProject) return;
  await setDoc(ref(), data);
}

async function loadProjects() {

  const querySnapshot = await getDocs(collection(db, "budgets"));

  const select = document.getElementById("projectSelect");
  select.innerHTML = '<option value="">Seleccionar proyecto...</option>';

  querySnapshot.forEach((docSnap) => {
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = docSnap.id;
    select.appendChild(option);
  });
}

function connectProject() {

  if (!currentProject) return;

  if (unsubscribe) unsubscribe();

  unsubscribe = onSnapshot(ref(), (snapshot) => {

    if (snapshot.exists()) {
      data = snapshot.data();
    } else {
      data = { people: [], transactions: [] };
      save();
    }

    updateUI();
  });
}

window.login = function () {

  const pass = document.getElementById("adminPass").value;

  if (pass === ADMIN_PASSWORD) {
    role = "admin";
    document.getElementById("roleLabel").textContent = "Modo: 👑 Admin";
    document.querySelectorAll(".admin").forEach(e => e.classList.remove("hidden"));
  } else {
    alert("Clave incorrecta");
  }
};

function isAdmin() {
  return role === "admin";
}

window.createProject = async function () {

  if (!isAdmin()) {
    alert("Solo admin");
    return;
  }

  const name = document.getElementById("newProject").value.trim();
  if (!name) return;

  currentProject = name;

  await setDoc(doc(db, "budgets", name), {
    people: [],
    transactions: []
  });

  await loadProjects();

  document.getElementById("projectSelect").value = name;

  connectProject();
};

window.deleteProject = async function () {

  if (!isAdmin()) return;
  if (!currentProject) return;

  if (!confirm("¿Eliminar proyecto?")) return;

  await deleteDoc(doc(db, "budgets", currentProject));

  currentProject = null;

  if (unsubscribe) unsubscribe();

  await loadProjects();
  clearUI();
};

document.getElementById("projectSelect").addEventListener("change", (e) => {

  currentProject = e.target.value;
  if (!currentProject) return;

  connectProject();
});

window.addPerson = function () {

  if (!isAdmin()) return;

  const name = document.getElementById("personName").value.trim();
  if (!name) return;

  data.people.push(name);
  save();
};

window.deletePerson = function (index) {

  if (!isAdmin()) return;

  const name = data.people[index];

  data.people.splice(index, 1);
  data.transactions = data.transactions.filter(t => t.person !== name);

  save();
};

window.addTransaction = function (type) {

  if (!isAdmin()) return;

  const person = document.getElementById(
    type === "income" ? "incomePerson" : "expensePerson"
  ).value;

  const amount = parseFloat(
    document.getElementById(
      type === "income" ? "incomeAmount" : "expenseAmount"
    ).value
  );

  if (!person || !amount) return;

  data.transactions.push({ person, amount, type });
  save();
};

window.deleteTransaction = function (index) {

  if (!isAdmin()) return;

  data.transactions.splice(index, 1);
  save();
};

function formatMoney(n) {
  return n.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function clearUI() {

  document.getElementById("peopleList").innerHTML = "";
  document.getElementById("incomeList").innerHTML = "";
  document.getElementById("expenseList").innerHTML = "";

  document.getElementById("totalIncome").textContent = "0";
  document.getElementById("totalExpense").textContent = "0";
  document.getElementById("balance").textContent = "$0";
}

function updateUI() {

  if (!currentProject) return;

  const peopleList = document.getElementById("peopleList");
  const incomeSelect = document.getElementById("incomePerson");
  const expenseSelect = document.getElementById("expensePerson");

  peopleList.innerHTML = "";
  incomeSelect.innerHTML = "";
  expenseSelect.innerHTML = "";

  data.people.forEach((p, i) => {

    peopleList.innerHTML += `
      <div class="people-item">
        <div class="people-left">🤙 ${p}</div>
        ${isAdmin()
          ? `<button class="btn-delete" onclick="deletePerson(${i})">✕</button>`
          : ""
        }
      </div>
    `;

    const opt1 = document.createElement("option");
    opt1.value = p;
    opt1.textContent = p;
    incomeSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = p;
    opt2.textContent = p;
    expenseSelect.appendChild(opt2);
  });

  let totalIncome = 0;
  let totalExpense = 0;

  const incomeList = document.getElementById("incomeList");
  const expenseList = document.getElementById("expenseList");

  incomeList.innerHTML = "";
  expenseList.innerHTML = "";

  data.transactions.forEach((t, i) => {

    const html = `
      <div class="item">
        <span>${t.type === "income" ? "🍻" : "💩"} ${t.person} - $${formatMoney(t.amount)}</span>
        ${isAdmin()
          ? `<button class="btn-delete" onclick="deleteTransaction(${i})">✕</button>`
          : ""
        }
      </div>
    `;

    if (t.type === "income") {
      totalIncome += t.amount;
      incomeList.innerHTML += html;
    } else {
      totalExpense += t.amount;
      expenseList.innerHTML += html;
    }
  });

  document.getElementById("totalIncome").textContent = formatMoney(totalIncome);
  document.getElementById("totalExpense").textContent = formatMoney(totalExpense);

  document.getElementById("balance").textContent =
    "$ " + formatMoney(totalIncome - totalExpense);
}

loadProjects();
