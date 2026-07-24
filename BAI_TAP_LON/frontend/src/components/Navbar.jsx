import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ searchText = "" }) {
  const role = localStorage.getItem("role");

  const items = [
    { label: "Dashboard", to: "/dashboard", emoji: "📊" },
    { label: "Ví", to: "/wallets", emoji: "👛" },
    { label: "Giao dịch", to: "/transactions", emoji: "💸" },
    { label: "Chuyển tiền", to: "/transfers", emoji: "🔄" },
    { label: "Mục tiêu", to: "/goals", emoji: "🎯" },
    { label: "Ngân sách", to: "/budgets", emoji: "📈" },
    { label: "Danh mục", to: "/categories", emoji: "📂" }
  ];

  if (role === "ADMIN") {
    items.push({ label: "Admin", to: "/admin", emoji: "👑" });
  }

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchText.trim().toLowerCase())
  );

  return (
    <aside className="sidebar">
      <h2 className="logo">💰 Money Manager</h2>

      <nav className="menu">
        {filteredItems.map((item) => (
          <Link key={item.to} to={item.to}>
            {item.emoji} {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Navbar;