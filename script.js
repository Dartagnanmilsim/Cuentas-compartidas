let people = JSON.parse(localStorage.getItem("people")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function save() {
  localStorage.setItem("people", JSON.stringify(people));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function formatMoney(num) {
  return num.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function addPerson() {
  const name = document.getElementById("personName").value.trim();
  if (!name) return;

  people.push(name);
  save();
  document.getElementById("personName").value = "";
  updateUI();
}

function addTransaction(type) {
  const person = document.getElementById(
    type === "income" ? "incomePerson" : "expensePerson"
  ).value;

  const amount = parseFloat(
    document.getElementById(
      type === "income" ? "incomeAmount" : "expenseAmount"
    ).value
  );

  if (!person || !amount) return;

  transactions.push({ person, amount, type });
  save();
  updateUI();
}

function editTransaction(index) {
  const newAmount = prompt("Nuevo valor:");
  if (!newAmount) return;

  transactions[index].amount = parseFloat(newAmount);
  save();
  updateUI();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  save();
  updateUI();
}

function updateUI() {
  const incomeList = document.getElementById("incomeList");
  const expenseList = document.getElementById("expenseList");
  const incomeSelect = document.getElementById("incomePerson");
  const expenseSelect = document.getElementById("expensePerson");
  const peopleList = document.getElementById("peopleList");

  incomeList.innerHTML = "";
  expenseList.innerHTML = "";
  incomeSelect.innerHTML = "";
  expenseSelect.innerHTML = "";
  peopleList.innerHTML = "";

  people.forEach(p => {
    incomeSelect.innerHTML += `<option>${p}</option>`;
    expenseSelect.innerHTML += `<option>${p}</option>`;
    peopleList.innerHTML += `<li>${p}</li>`;
  });

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((t, i) => {
    const html = `
      <div class="item">
        <span>${t.person} - $${formatMoney(t.amount)}</span>
        <div class="actions">
          <button onclick="editTransaction(${i})">✏️</button>
          <button onclick="deleteTransaction(${i})">❌</button>
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

  const balance = totalIncome - totalExpense;
  document.getElementById("balance").textContent =
    "$ " + formatMoney(balance);
}

updateUI();
