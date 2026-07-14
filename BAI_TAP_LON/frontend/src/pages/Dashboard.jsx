import React, { useEffect, useState } from "react";
import { getWallets } from "../api/wallets";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await getWallets();
        setWallets(res.data);
      } catch {
        alert("Không tải được ví!");
      }
    };
    fetchWallets();
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Danh sách ví</h2>
      <ul>
        {wallets.map((w) => (
          <li key={w.id}>{w.name} - {w.balance} VND</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
