import React, { useEffect, useState } from "react";
import { getTransactions } from "../api/transactions";
import Navbar from "../components/Navbar";

function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await getTransactions();
        setTransactions(res.data);
      } catch {
        alert("Không tải được giao dịch!");
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Danh sách giao dịch</h2>
      <ul>
        {transactions.map((t) => (
          <li key={t.id}>{t.description} - {t.amount} VND</li>
        ))}
      </ul>
    </div>
  );
}

export default Transactions;

