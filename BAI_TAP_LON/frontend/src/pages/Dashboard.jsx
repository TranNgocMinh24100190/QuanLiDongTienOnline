import React, { useEffect, useState } from "react";
import { getWallets } from "../api/wallets";

import "../styles/Layouts.css";
import "../styles/Cards.css";

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

  const totalBalance = wallets.reduce(
    (sum, wallet) => sum + Number(wallet.balance || 0),
    0
  );

  return (
    <div className="main-content">

      <div className="page-header">
        <h1 className="page-title">
          Dashboard
        </h1>

        <p className="page-subtitle">
          Tổng quan tài chính cá nhân
        </p>
      </div>

      {/* Statistics */}

      <div className="grid-3">

        <div className="stat-card">
          <div className="stat-title">
            Tổng số dư
          </div>

          <div className="stat-value balance">
            {totalBalance.toLocaleString()} VNĐ
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            Tổng số ví
          </div>

          <div className="stat-value">
            {wallets.length}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            Ví đang hoạt động
          </div>

          <div className="stat-value">
            {
              wallets.filter(
                (w) => w.status === "ACTIVE"
              ).length
            }
          </div>
        </div>

      </div>

      {/* Wallet List */}

      <div className="card">

        <h2 className="card-title">
          Danh sách ví
        </h2>

        <div className="grid-3">

          {wallets.map((wallet) => (

            <div
              key={wallet.wallet_id}
              className="stat-card"
            >
              <div className="stat-title">
                {wallet.wallet_type}
              </div>

              <h3>
                {wallet.wallet_name}
              </h3>

              <div
                className="stat-value balance"
                style={{
                  fontSize: "22px"
                }}
              >
                {Number(
                  wallet.balance || 0
                ).toLocaleString()} VNĐ
              </div>

              <p>
                Trạng thái: {wallet.status}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;