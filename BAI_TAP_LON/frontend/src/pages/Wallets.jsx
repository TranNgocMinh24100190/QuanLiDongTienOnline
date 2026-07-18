import React, { useEffect, useState } from "react";

import {
  getWallets,
  createWallet,
  closeWallet,
  openWallet,
} from "../api/wallets";

import "../styles/Layouts.css";
import "../styles/Cards.css";
import "../styles/Forms.css";

function Wallets() {
  const [wallets, setWallets] = useState([]);

  const [walletName, setWalletName] = useState("");
  const [walletType, setWalletType] = useState("Cash");

  const loadWallets = async () => {
    try {
      const res = await getWallets();
      setWallets(res.data);
    } catch (err) {
      console.error(err);
      alert("Không tải được danh sách ví");
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const handleCreateWallet = async () => {
    try {
      await createWallet({
        wallet_name: walletName,
        wallet_type: walletType,
      });

      setWalletName("");
      setWalletType("Cash");

      loadWallets();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Không thể tạo ví"
      );
    }
  };

  const handleCloseWallet = async (id) => {
    try {
      await closeWallet(id);
      loadWallets();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Không thể đóng ví"
      );
    }
  };

  const handleOpenWallet = async (id) => {
    try {
      await openWallet(id);
      loadWallets();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Không thể mở ví"
      );
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">
          Quản lý ví
        </h1>

        <p className="page-subtitle">
          Theo dõi và quản lý các ví của bạn
        </p>
      </div>

      {/* CREATE WALLET */}

      <div className="card">
        <h2 className="card-title">
          Tạo ví mới
        </h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Tên ví"
            value={walletName}
            onChange={(e) =>
              setWalletName(e.target.value)
            }
            style={{
              padding: "10px",
              flex: 1,
              minWidth: "200px",
            }}
          />

          <select
            value={walletType}
            onChange={(e) =>
              setWalletType(e.target.value)
            }
            style={{
              padding: "10px",
            }}
          >
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
            <option value="E-Wallet">
              E-Wallet
            </option>
            <option value="Credit Card">
              Credit Card
            </option>
            <option value="Crypto Currency">
              Crypto Currency
            </option>
            <option value="Other">Other</option>
          </select>

          <button
            className="btn btn-primary"
            onClick={handleCreateWallet}
          >
            Tạo ví
          </button>
        </div>
      </div>

      {/* WALLET LIST */}

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
              <div
                className="stat-title"
                style={{
                  marginBottom: "10px",
                }}
              >
                {wallet.wallet_type}
              </div>

              <h3>
                {wallet.wallet_name}
              </h3>

              <div
                className="stat-value balance"
                style={{
                  fontSize: "20px",
                }}
              >
                {Number(
                  wallet.balance || 0
                ).toLocaleString()}
                {" "}VNĐ
              </div>

              <p
                style={{
                  marginTop: "10px",
                }}
              >
                Trạng thái:
                {" "}
                <strong>
                  {wallet.status}
                </strong>
              </p>

              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  gap: "10px",
                }}
              >
                {wallet.status ===
                "ACTIVE" ? (
                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      handleCloseWallet(
                        wallet.wallet_id
                      )
                    }
                  >
                    Đóng ví
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={() =>
                      handleOpenWallet(
                        wallet.wallet_id
                      )
                    }
                  >
                    Mở ví
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Wallets;