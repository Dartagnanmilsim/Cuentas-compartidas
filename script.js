import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
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

const params = new URLSearchParams(window.location.search);
const budgetId = params.get("id") || "default";

let data = {
  people: [],
  transactions: []
};

function ref() {
  return doc(db, "budgets", budgetId);
}

async function save() {
  await setDoc(ref(), data);
}

function listen() {
  onSnapshot(ref(), (snapshot) => {
    if (snapshot.exists()) {
      data = snapshot.data();
      updateUI();
    } else {
      save();
    }
  });
}

window.login = function () {
  const pass = document.getElementById("adminPass").value;

  if (pass === ADMIN_PASSWORD) {
    role = "admin";
    document.getElementById("roleLabel").textContent = "Modo: 👑 Admin";
    document.querySelectorAll(".admin").forEach(e => e.classList.remove("hidden"));
  }
};

window.addPerson = function () {
  if (role !== "admin") return;

  const name = document.getElementById("personName").value.trim();
  if (!name) return;

  data.people.push(name);
  save();
};

window.addTransaction = function (type) {
  if (role !== "admin") return;

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
  if (role !== "admin") return;

  data.transactions.splice(index, 1);
  save();
};

function formatMoney(n) {
  return n.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function updateUI() {

  document.getElementById("shareLink").value = window.location.href;

  const peopleList = document.getElementById("peopleList");
  const incomeSelect = document.getElementById("incomePerson");
  const expenseSelect = document.getElementById("expensePerson");

  if (!peopleList) return;

  peopleList.innerHTML = "";
  incomeSelect.innerHTML = "";
  expenseSelect.innerHTML = "";

  data.people.forEach((p) => {
    peopleList.innerHTML += `<li>🤙 ${p}</li>`;
    incomeSelect.innerHTML += `<option>${p}</option>`;
    expenseSelect.innerHTML += `<option>${p}</option>`;
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
        ${role === "admin"
          ? `<button class="btn-delete" onclick="deleteTransaction(${i})">✖</button>`
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

listen();
