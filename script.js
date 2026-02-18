const ADMIN_PASSWORD = "1234";

let role = "viewer";
let budgets = JSON.parse(localStorage.getItem("budgets")) || {};
let currentBudget = localStorage.getItem("currentBudget") || null;

function save() {
  localStorage.setItem("budgets", JSON.stringify(budgets));
  localStorage.setItem("currentBudget", currentBudget);
}

function login() {
  const pass = document.getElementById("adminPass").value;

  if (pass === ADMIN_PASSWORD) {
    role = "admin";
    document.getElementById("roleLabel").textContent = "Modo: 👑 Admin";
    document.querySelectorAll(".admin").forEach(e => e.classList.remove("hidden"));
    updateUI();
  } else {
    alert("Clave incorrecta");
  }
}

function addBudget() {
  if (role !== "admin") return alert("Solo admin");

  const name = document.getElementById("budgetName").value.trim();
  if (!name) return;

  budgets[name] = { people: [], transactions: [] };
  currentBudget = name;

  save();
  updateBudgetSelect();
  updateUI();
}

function changeBudget() {
  currentBudget = document.getElementById("budgetSelect").value;
  save();
  updateUI();
}

function addPerson() {
  if (role !== "admin") return;

  const name = document.getElementById("personName").value.trim();
  if (!name) return;

  budgets[currentBudget].people.push(name);
  save();
  updateUI();
}

function deletePerson(index) {
  if (role !== "admin") return;

  const personName = budgets[currentBudget].people[index];

  budgets[currentBudget].people.splice(index, 1);

  budgets[currentBudget].transactions =
    budgets[currentBudget].transactions.filter(
      t => t.person !== personName
    );

  save();
  updateUI();
}

function addTransaction(type) {
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

  budgets[currentBudget].transactions.push({ person, amount, type });
  save();
  updateUI();
}

function deleteTransaction(index) {
  if (role !== "admin") return;

  budgets[currentBudget].transactions.splice(index, 1);
  save();
  updateUI();
}

function formatMoney(n) {
  return n.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function updateBudgetSelect() {
  const select = document.getElementById("budgetSelect");
  select.innerHTML = "";

  Object.keys(budgets).forEach(name => {
    select.innerHTML += `<option>${name}</option>`;
  });

  if (currentBudget) select.value = currentBudget;
}

function updateUI() {
  if (!currentBudget || !budgets[currentBudget]) return;

  const data = budgets[currentBudget];

  const peopleList = document.getElementById("peopleList");
  const incomeSelect = document.getElementById("incomePerson");
  const expenseSelect = document.getElementById("expensePerson");

  peopleList.innerHTML = "";
  incomeSelect.innerHTML = "";
  expenseSelect.innerHTML = "";

  data.people.forEach((p, i) => {

    peopleList.innerHTML += `
      <li>🤙 ${p}
        <button class="btn-delete" onclick="deletePerson(${i})">✖</button>
      </li>
    `;

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
        <div class="actions">
          <button class="btn-delete" onclick="deleteTransaction(${i})">✖</button>
        </div>
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

updateBudgetSelect();
updateUI();
