import React, { useEffect, useState } from "react";

import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../api/goals";

import "../styles/Layouts.css";
import "../styles/Cards.css";
import "../styles/Forms.css";

function Goals() {

  const [goals, setGoals] = useState([]);
  const [goal_name, setGoalName] = useState("");
  const [target_amount, setTargetAmount] = useState("");

  const [editingGoal, setEditingGoal] = useState(null);
  const [editGoalName, setEditGoalName] = useState("");
  const [editTargetAmount, setEditTargetAmount] = useState("");

  const loadGoals = async () => {
    try {
      const res = await getGoals();
      setGoals(res.data.data);
    } catch {
      alert("Không tải được mục tiêu!");
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreate = async () => {
    try {

      await createGoal({
        goal_name,
        target_amount,
      });

      setGoalName("");
      setTargetAmount("");

      loadGoals();

    } catch (err) {
      alert(
        err?.response?.data?.message
      );
    }
  };

  const handleUpdate = async () => {
    try {
      await updateGoal(editingGoal.goal_id, {
        goal_name: editGoalName,
        target_amount: Number(editTargetAmount)
      });
      setEditingGoal(null);
      setEditGoalName("");
      setEditTargetAmount("");
      loadGoals();
    } catch (err) {
      alert(
        err?.response?.data?.message || "Không thể cập nhật mục tiêu"
      );
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      loadGoals();
    } catch (err) {
      alert(
        err?.response?.data?.message
      );
    }
  };

  return (
    <div className="main-content">

      <div className="page-header">
        <h1 className="page-title">
          Mục tiêu tài chính
        </h1>
      </div>

      <div className="card">

        <div className="goal-form">

          <input className="form-input"
            type="text"
            placeholder="Tên mục tiêu"
            value={goal_name}
            onChange={(e) =>
              setGoalName(
                e.target.value
              )
            }
          />

          <br />
          <br />

          <input className="form-input"
            type="number"
            placeholder="Mục tiêu"
            value={target_amount}
            onChange={(e) =>
              setTargetAmount(
                e.target.value
              )
            }
          />

          <br />
          <br />

          <button className="form-button"
            onClick={handleCreate}
          >
            Tạo mục tiêu
          </button>

        </div>

      </div>

      <div className="grid-3">

        {goals.map((g) => {

          const current =
            Number(g.current_amount || 0);

          const target =
            Number(g.target_amount || 0);

          const progress =
            Math.min(
              (current / target) * 100,
              100
            );

          const completed =
            current >= target;

          return (

            <div
              key={g.goal_id}
              className={
                completed
                  ? "goal-card completed"
                  : "goal-card"
              }
            >

              <h3>
                {completed ? "🏆" : "🎯"}{" "}
                {g.goal_name}
              </h3>

              <p>
                Hiện tại:{" "}
                {current.toLocaleString()} VNĐ
              </p>

              <p>
                Mục tiêu:{" "}
                {target.toLocaleString()} VNĐ
              </p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progress}%`
                  }}
                />
              </div>

              <p
                style={{
                  marginTop: "10px"
                }}
              >
                {progress.toFixed(0)}%
              </p>

              {completed ? (

                <div className="goal-success">
                  🎉 Đã hoàn thành mục tiêu!
                </div>

              ) : (

                <div className="goal-pending">
                  Còn thiếu{" "}
                  {(
                    target - current
                  ).toLocaleString()} VNĐ
                </div>

              )}
              <div style={{ marginTop: "15px", display: "flex", gap: "50px" }}>
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    handleDelete(
                      g.goal_id
                    )
                  }
                >
                  Xóa
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingGoal(g);
                    setEditGoalName(g.goal_name);
                    setEditTargetAmount(g.target_amount);
                  }}
                >
                  Sửa
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {editingGoal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Sửa Mục Tiêu</h2>
            <input
              className="form-input"
              type="text"
              placeholder="Tên mục tiêu"
              value={editGoalName}
              onChange={(e) => setEditGoalName(e.target.value)}
            />
            <input
              className="form-input"
              type="number"
              placeholder="Mục tiêu"
              value={editTargetAmount}
              onChange={(e) => setEditTargetAmount(e.target.value)}
              style={{ marginTop: "10px" }}
            />
            <div className="modal-actions">
              <button className="btn btn-danger"
                onClick={() => {
                  setEditingGoal(null);
                }}
              >
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleUpdate}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;