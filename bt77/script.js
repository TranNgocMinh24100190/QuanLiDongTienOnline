function loadWallets() {
  fetch("http://localhost:5000/api/wallets")
    .then(res => res.json())
    .then(data => {
      const walletDiv = document.getElementById("walletTable");
      let table = "<table><tr><th>ID</th><th>Name</th><th>Balance</th></tr>";
      data.forEach(w => {
        table += `<tr><td>${w.id}</td><td>${w.name}</td><td>${w.balance}</td></tr>`;
      });
      table += "</table>";
      walletDiv.innerHTML = table;
    });
}

function loadTransactions() {
  fetch("http://localhost:5000/api/transactions")
    .then(res => res.json())
    .then(data => {
      const transactionDiv = document.getElementById("transactionTable");
      let table = "<table><tr><th>ID</th><th>Description</th><th>Amount</th><th>Type</th></tr>";
      data.forEach(t => {
        table += `<tr><td>${t.id}</td><td>${t.description}</td><td>${t.amount}</td><td>${t.type}</td></tr>`;
      });
      table += "</table>";
      transactionDiv.innerHTML = table;
    });
}

// Thêm ví
document.getElementById("walletForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("walletName").value;
  const balance = document.getElementById("walletBalance").value;

  fetch("http://localhost:5000/api/wallets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, balance })
  }).then(() => loadWallets());
});

// Thêm giao dịch
document.getElementById("transactionForm").addEventListener("submit", e => {
  e.preventDefault();
  const wallet_id = document.getElementById("walletId").value;
  const description = document.getElementById("description").value;
  const amount = document.getElementById("amount").value;
  const type = document.getElementById("type").value;

  fetch("http://localhost:5000/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet_id, description, amount, type })
  }).then(() => loadTransactions());
});

// Load ban đầu
loadWallets();
loadTransactions();
