import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">💰 Money Manager</h2>

      <nav className="menu">
        <Link to="/dashboard">📊 Dashboard</Link>
        <Link to="/wallets">👛 Ví</Link>
        <Link to="/transactions">💸 Giao dịch</Link>
        <Link to="/transfers">🔄 Chuyển tiền</Link>
        <Link to="/goals">🎯 Mục tiêu</Link>
        <Link to="/budgets">📈 Ngân sách</Link>
        <Link to="/categories">📂 Danh mục</Link>
      </nav>

      <button
        className="logout-btn"
        onClick={() => {
          window.location.href = "/login";
        }}
      >
        🚪 Đăng xuất
      </button>
    </aside>
  );
}

export default Navbar;