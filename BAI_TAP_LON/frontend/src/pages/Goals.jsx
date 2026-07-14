import React, { useEffect, useState } from "react";
import { getGoals } from "../api/goals";
import Navbar from "../components/Navbar";

function Goals() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await getGoals();
        setGoals(res.data);
      } catch {
        alert("Không tải được mục tiêu!");
      }
    };
    fetchGoals();
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Mục tiêu tài chính</h2>
      <ul>
        {goals.map((g) => (
          <li key={g.id}>{g.title} - {g.targetAmount} VND</li>
        ))}
      </ul>
    </div>
  );
}

export default Goals;
