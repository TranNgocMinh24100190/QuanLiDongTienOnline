import React, { useEffect, useState } from "react";
import { getTransfers } from "../api/transfers";
import Navbar from "../components/Navbar";

function Transfers() {
  const [transfers, setTransfers] = useState([]);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const res = await getTransfers();
        setTransfers(res.data);
      } catch {
        alert("Không tải được chuyển tiền!");
      }
    };
    fetchTransfers();
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Lịch sử chuyển tiền</h2>
      <ul>
        {transfers.map((tr) => (
          <li key={tr.id}>{tr.fromWallet} → {tr.toWallet} : {tr.amount} VND</li>
        ))}
      </ul>
    </div>
  );
}

export default Transfers;
