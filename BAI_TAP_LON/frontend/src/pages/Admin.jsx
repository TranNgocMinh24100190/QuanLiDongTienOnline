import React, { useEffect, useState } from "react";
import { getUsers } from "../api/admin";

import "../styles/Layouts.css";
import "../styles/Cards.css";
import "../styles/Tables.css";

function Admin() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.data);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
        "Không tải được danh sách người dùng"
      );
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const totalAdmins =
    users.filter(
      (u) => u.role === "ADMIN"
    ).length;

  const totalUsers =
    users.filter(
      (u) => u.role === "USER"
    ).length;

  return (
    <div className="main-content">

      <div className="page-header">
        <h1 className="page-title">
          👑 Admin Dashboard
        </h1>

        <p className="page-subtitle">
          Quản lý tài khoản người dùng trong hệ thống
        </p>
      </div>

      <div className="grid-3">

        <div className="stat-card">
          <div className="stat-title">
            Tổng tài khoản
          </div>

          <div className="stat-value">
            {users.length}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            Admin
          </div>

          <div className="stat-value">
            {totalAdmins}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            User
          </div>

          <div className="stat-value">
            {totalUsers}
          </div>
        </div>

      </div>

      <div className="card">

        <h3 className="card-title">
          Danh sách người dùng
        </h3>

        <div className="table-container">

          <table className="table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Role</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>

            <tbody>

              {users.map((u) => (

                <tr key={u.user_id}>

                  <td>
                    {u.user_id}
                  </td>

                  <td>
                    {u.full_name}
                  </td>

                  <td>
                    {u.email}
                  </td>

                  <td>
                    {u.role === "ADMIN"
                      ? "👑 ADMIN"
                      : "👤 USER"}
                  </td>

                  <td>
                    {new Date(
                      u.created_at
                    ).toLocaleDateString()}
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

export default Admin;