import React, { useEffect, useState } from "react";
import { getBudgets } from "../api/budgets";
import Navbar from "../components/Navbar";

function Budgets() {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await getBudgets();
        setBudgets(res.data);
      } catch {
        alert("Không tải được ngân sách!");
      }
    };
    fetchBudgets();
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Ngân sách</h2>
      <ul>
        {budgets.map((b) => (
          <li key={b.id}>{b.name} - {b.limit} VND</li>
        ))}
      </ul>
    </div>
  );
}

export default Budgets;
