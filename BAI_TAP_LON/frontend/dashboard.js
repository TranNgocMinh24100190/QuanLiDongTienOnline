window.onload = function () {

    loadDashboard();

}

async function loadDashboard() {

    try {

        const summary = await getData("/dashboard");

        document.getElementById("balance").innerHTML =
            Number(summary.balance).toLocaleString() + " VNĐ";

        document.getElementById("income").innerHTML =
            Number(summary.income).toLocaleString() + " VNĐ";

        document.getElementById("expense").innerHTML =
            Number(summary.expense).toLocaleString() + " VNĐ";

        document.getElementById("wallet").innerHTML =
            summary.wallets;

    } catch {

        console.log("Không lấy được Dashboard");

    }

    loadTransactions();

}

async function loadTransactions() {

    try {

        const data = await getData("/transaction");

        let html = "";

        data.slice(0,5).forEach(item=>{

            html += `
            <tr>

                <td>${item.date}</td>

                <td>${item.type}</td>

                <td>${item.category}</td>

                <td>${Number(item.amount).toLocaleString()} VNĐ</td>

            </tr>
            `;

        });

        document.getElementById("transactionTable").innerHTML=html;

    } catch {

        console.log("Không lấy được giao dịch");

    }

}