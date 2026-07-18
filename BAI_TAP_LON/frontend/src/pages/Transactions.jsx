import React, { useEffect, useState } from "react";

import {getTransactions, createTransaction, reverseTransaction} from "../api/transactions";
import { reverseTransfer } from "../api/transfers";

import { getWallets } from "../api/wallets";
import { getCategories } from "../api/categories";

import "../styles/Layouts.css";
import "../styles/Tables.css";
import "../styles/Forms.css";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    wallet_id: "",
    category_id: "",
    amount: "",
    transaction_type: "Expense",
    description: "",
  });

  const loadData = async () => {
    try {
      const [txRes, walletRes, categoryRes] =
        await Promise.all([
          getTransactions(),
          getWallets(),
          getCategories(),
        ]);

      setTransactions(txRes.data.data);
      setWallets(walletRes.data);
      setCategories(categoryRes.data.data);
    } catch {
      alert("Không tải được dữ liệu");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await createTransaction(form);

      console.log("RES", res);
      console.log("DATA", res?.data);

      if(res?.data?.budgetWarning) {
        alert(res?.data?.budgetWarning);
      }

      if(Array.isArray(res?.data?.goalMessage) && res?.data?.goalMessage.length > 0) {
        alert(res?.data?.goalMessage.join("\n"));
      }

      setForm({
        wallet_id: "",
        category_id: "",
        amount: "",
        transaction_type: "Expense",
        description: "",
      });

      await loadData();
    } catch (err) {
      console.log("FULL ERROR:", err);
      alert(
        err?.response?.data?.message ||
          "Không thể tạo giao dịch"
      );
    }
  };

  const handleReverse = async (transaction) => {
    try {
      if (transaction.is_transfer) {
        await reverseTransfer(transaction.transaction_id);
      } else {
        await reverseTransaction(transaction.transaction_id);
      }
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Reverse thất bại");
    }
  };

  return (
    <div className="main-content">

      <div className="page-header">
        <h1 className="page-title">
          Giao dịch
        </h1>

        <p className="page-subtitle">
          Quản lý thu chi cá nhân
        </p>
      </div>

      {/* FORM */}

      <div className="card">
        <h2 className="card-title">
          Thêm giao dịch
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "12px",
          }}
        >
          <select
            value={form.wallet_id}
            onChange={(e) =>
              setForm({
                ...form,
                wallet_id: e.target.value,
              })
            }
          >
            <option value="">
              Chọn ví
            </option>

            {Array.isArray(wallets) && wallets.map((w) => (
              <option
                key={w.wallet_id}
                value={w.wallet_id}
              >
                {w.wallet_name}
              </option>
            ))}
          </select>

          <select
            value={form.category_id}
            onChange={(e) =>
              setForm({
                ...form,
                category_id: e.target.value,
              })
            }
          >
            <option value="">
              Chọn danh mục
            </option>

            {categories.filter((c) => !c.is_system).map((c) => (
              <option
                key={c.category_id}
                value={c.category_id}
              >
                {c.category_name}
              </option>
            ))}

          </select>

          <select
            value={form.transaction_type}
            onChange={(e) =>
              setForm({
                ...form,
                transaction_type:
                  e.target.value,
              })
            }
          >
            <option value="Expense">
              Expense
            </option>

            <option value="Income">
              Income
            </option>
          </select>

          <input
            type="number"
            placeholder="Số tiền"
            value={form.amount}
            onChange={(e) =>
              setForm({
                ...form,
                amount: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          <button
            className="btn btn-primary"
            onClick={handleCreate}
          >
            Thêm giao dịch
          </button>
        </div>
      </div>

      {/* LIST */}

      <div className="card">
        <h2 className="card-title">
          Danh sách giao dịch
        </h2>

        <div className="table-container">

          <table className="table">

            <thead>
              <tr>
                <th>Mô tả</th>
                <th>Loại</th>
                <th>Số tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>

              {Array.isArray(transactions) && [...transactions].sort(
                (a, b) =>
                  b.transaction_id -
                  a.transaction_id
              ).map((t) => (

                <tr
                  key={t.transaction_id}
                >

                  <td>
                    {t.description?.trim() || (
                      <span
                        style={{
                          color: "#64748b",
                          fontStyle: "italic",
                        }}
                      >
                        Không có mô tả
                      </span>
                    )}
                  </td>

                  <td>
                    <span
                      className={
                        t.transaction_type ===
                          "Income"
                          ? "income"
                          : "expense"
                      }
                    >
                      {t.transaction_type}
                    </span>
                  </td>

                  <td>
                    {Number(
                      t.amount || 0
                    ).toLocaleString()}
                    {" "}VNĐ
                  </td>

                  <td>
                    {t.is_reversed ||
                      String(t.description || "").startsWith("[REVERSED]") ? (

                      <span
                        style={{
                          color: "#16a34a",
                          fontWeight: "bold",
                        }}
                      >
                        ✓ Đã đảo
                      </span>

                    ) : (

                      <button
                        className="btn btn-danger"
                        onClick={() => handleReverse(t)}
                      >
                        Reverse
                      </button>

                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transactions;