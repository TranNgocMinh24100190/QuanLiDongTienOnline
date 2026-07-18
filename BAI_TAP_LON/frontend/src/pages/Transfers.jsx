import React, { useEffect, useState } from "react";

import { getWallets } from "../api/wallets";
import { createTransfer } from "../api/transfers";

import "../styles/Layouts.css";
import "../styles/Forms.css";

function Transfers() {
  const [wallets, setWallets] = useState([]);

  const [form, setForm] = useState({
    from_wallet_id: "",
    to_wallet_id: "",
    amount: "",
  });

  useEffect(() => {
    const loadWallets = async () => {
      try {
        const res = await getWallets();
        setWallets(res.data);
      } catch {
        alert("Không tải được danh sách ví");
      }
    };

    loadWallets();
  }, []);

  const handleTransfer = async () => {
    try {
      await createTransfer(form);

      alert("Chuyển tiền thành công");

      setForm({
        from_wallet_id: "",
        to_wallet_id: "",
        amount: "",
      });

    } catch (err) {
      alert(
        err?.response?.data?.message ||
        "Không thể chuyển tiền"
      );
    }
  };

  return (
    <div className="main-content">

      <div className="page-header">
        <h1 className="page-title">
          Chuyển tiền
        </h1>

        <p className="page-subtitle">
          Chuyển tiền giữa các ví
        </p>
      </div>

      <div className="card">

        <h2 className="card-title">
          Tạo giao dịch chuyển tiền
        </h2>

        <div className="transfer-form">

          <div
            style={{
              display: "grid",
              gap: "15px",
              maxWidth: "600px"
            }}
          >

            <select className="form-select"
              value={form.from_wallet_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  from_wallet_id: e.target.value
                })
              }
            >
              <option value="">
                Chọn ví nguồn
              </option>

              {wallets.map((wallet) => (
                <option
                  key={wallet.wallet_id}
                  value={wallet.wallet_id}
                >
                  {wallet.wallet_name}
                </option>
              ))}
            </select>

            <select className="form-select"
              value={form.to_wallet_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  to_wallet_id: e.target.value
                })
              }
            >
              <option value="">
                Chọn ví đích
              </option>

              {wallets.map((wallet) => (
                <option
                  key={wallet.wallet_id}
                  value={wallet.wallet_id}
                >
                  {wallet.wallet_name}
                </option>
              ))}
            </select>

            <input className="form-input"
              type="number"
              placeholder="Số tiền"
              value={form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: e.target.value
                })
              }
            />

            <button
              className="btn btn-primary"
              onClick={handleTransfer}
            >
              Chuyển tiền
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Transfers;