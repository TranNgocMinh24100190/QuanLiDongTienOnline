import React, { useEffect, useState, useRef } from "react";
import { getMe, logout } from "../api/auth";
import "./Header.css";

function Header({ onSearch }) {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value);
  };

  return (
    <header className="app-header">
      <div className="header-search">
        <input
          type="text"
          placeholder="Tìm kiếm chức năng..."
          value={query}
          onChange={handleSearchChange}
        />
      </div>

      <div className="header-user" ref={dropdownRef}>
        <button
          className="user-button"
          type="button"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span>{user?.full_name || user?.email || "Người dùng"}</span>
          <span className="user-arrow">▾</span>
        </button>

        {open && (
          <div className="user-dropdown">
            <div className="user-info">
              <strong>{user?.full_name || "-"}</strong>
              <span>{user?.email || "-"}</span>
            </div>
            <button className="logout-button" type="button" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;