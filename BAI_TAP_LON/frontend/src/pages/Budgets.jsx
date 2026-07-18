import React, { useEffect, useState } from "react";

import {
  getBudgets,
  createBudget,
  deleteBudget,
} from "../api/budgets";

import {
  getCategories,
} from "../api/categories";

import "../styles/Layouts.css";
import "../styles/Cards.css";
import "../styles/Forms.css";
import "../styles/Tables.css";

function Budgets() {

  const [budgets, setBudgets] =
    useState([]);

  const [categories,
    setCategories] =
    useState([]);

  const [form, setForm] =
    useState({
      category_id: "",
      amount_limit: "",
      month: "",
      year: "",
    });

  const loadData = async () => {
    try {

      const budgetRes =
        await getBudgets();

      const categoryRes =
        await getCategories();

      setBudgets(budgetRes.data.data);

      setCategories(categoryRes.data.data);

    } catch {
      alert(
        "Không tải được ngân sách!"
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    try {
        await createBudget({
          category_id: Number(form.category_id),
          amount_limit: Number(form.amount_limit),
          month: Number(form.month),
          year: Number(form.year),
        });

        loadData();

      } catch (err) {

        alert(err?.response?.data?.message || "Không thể tạo ngân sách");
      }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      loadData();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
        "Không thể xóa ngân sách"
      );
    }
  };  

  return (
    <div className="main-content">

      <div className="page-header">
        <h1 className="page-title">
          Ngân sách
        </h1>
      </div>

      <div className="card">

        <div className="budget-form">

          <select className="form-select"
            value={form.category_id}
            onChange={(e) =>
              setForm({
                ...form,
                category_id:
                  e.target.value,
              })
            }
          >
            <option value="">
              Chọn danh mục
            </option>

            {Array.isArray(categories) && categories.filter((c) => !c.is_system && c.type === "Expense").map((c) => (
              <option
                key={c.category_id}
                value={c.category_id}
              >
                {c.category_name}
              </option>
            ))}
          </select>

          <br />
          <br />

          <input className="form-input"
            type="number"
            placeholder="Giới hạn"
            onChange={(e) =>
              setForm({
                ...form,
                amount_limit:
                  e.target.value,
              })
            }
          />

          <br />
          <br />

          <input className="form-input"
            type="number"
            placeholder="Tháng"
            onChange={(e) =>
              setForm({
                ...form,
                month:
                  e.target.value,
              })
            }
          />

          <br />
          <br />

          <input className="form-input"
            type="number"
            placeholder="Năm"
            onChange={(e) =>
              setForm({
                ...form,
                year:
                  e.target.value,
              })
            }
          />

          <br />
          <br />

          <button className="form-button"
            onClick={handleCreate}
          >
            Tạo ngân sách
          </button>

        </div>

      </div>

      <div className="grid-3">

        {budgets.map((b) => {

          const progress = Math.min(
            (
              Number(b.spent || 0) /
              Number(b.amount_limit || 1)
            ) * 100,
            100
          );

          return (

            <div
              key={b.budget_id}
              className={
                b.status === "EXCEEDED"
                  ? "goal-card budget-danger"
                  : b.status === "FULL"
                    ? "goal-card budget-warning"
                    : "goal-card"
              }
            >

              <h3>
                📊 {b.category_name}
              </h3>

              <p>
                📅 Tháng {b.month}/{b.year}
              </p>

              <p>
                Giới hạn:{" "}
                {Number(
                  b.amount_limit || 0
                ).toLocaleString()} VNĐ
              </p>

              <p>
                Đã chi:{" "}
                {Number(
                  b.spent || 0
                ).toLocaleString()} VNĐ
              </p>

              {b.status === "EXCEEDED" ? (

                <p
                  style={{
                    color: "#dc2626",
                    fontWeight: "bold"
                  }}
                >
                  Vượt:{" "}
                  {Number(
                    b.overspent || 0
                  ).toLocaleString()} VNĐ
                </p>

              ) : (

                <p>
                  Còn lại:{" "}
                  {Number(
                    b.remaining || 0
                  ).toLocaleString()} VNĐ
                </p>

              )}

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progress}%`, background: progress >= 100 ? "#dc2626" : progress >= 80 ? "#f97316" : progress >= 50 ? "#eab308" : "#22c55e"
                  }}
                />
              </div>

              <p>
                {progress.toFixed(0)}%
              </p>

              {b.status === "EXCEEDED" ? (

                <div
                  className="goal-pending"
                  style={{
                    color: "#dc2626"
                  }}
                >
                  🚨 Đã vượt ngân sách
                </div>

              ) : b.status === "FULL" ? (

                <div
                  style={{
                    color: "#f59e0b",
                    fontWeight: "bold"
                  }}
                >
                  🟡 Đã dùng hết ngân sách
                </div>

              ) : (

                <div className="goal-success">
                  ✅ Trong ngân sách
                </div>

              )}

              <button
                className="btn btn-danger"
                onClick={() =>
                  handleDelete(
                    b.budget_id
                  )
                }
                style={{
                  marginTop: "12px"
                }}
              >
                Xóa
              </button>

            </div>

          );

        })}

      </div>

    </div>
  );
}

export default Budgets;