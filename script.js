let people = JSON.parse(localStorage.getItem("people")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function save() {
  localStorage.setItem("people", JSON.stringify(people));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function addPerson() {
  const name = document.getElementById("personName").value.trim();
  if (!name) return;

  people.push({ name });
  save();
  document.getElementById("personName").value = "";
  updateUI();
}

function addTransaction() {
  const person = document.getElementById("personSelect").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;

  if (!person || !amount) return;

  transactions.push({
    person,
    amount,
    type
  });

  save();
  document.getElementById("amount").value = "";
  updateUI();
}

function updateUI() {
  const select = document.getElementById("personSelect");
  select.innerHTML = "";

  people.forEach(p => {
    const option = document.createElement("option");
    option.value = p.name;
    option.textContent = p.name;
    select.appendChild(option);
  });

  renderSummary();
}

function renderSummary() {
  let summary = "";

  let totals = {};

  people.forEach(p => {
    totals[p.name] = 0;
  });

  transactions.forEach(t => {
    if (t.type === "deposit") {
      totals[t.person] += t.amount;
    } else {
      totals[t.person] -= t.amount;
    }
  });

  let groupTotal = 0;

  for (let name in totals) {
    groupTotal += totals[name];
    summary += `<p><strong>${name}:</strong> $${totals[name].toFixed(2)}</p>`;
  }

  summary += `<hr><h3>Total Grupo: $${groupTotal.toFixed(2)}</h3>`;

  document.getElementById("summary").innerHTML = summary;
}

updateUI();
