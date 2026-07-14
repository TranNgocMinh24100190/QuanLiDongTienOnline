import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={styles.navbar}>
      <h2 style={styles.logo}>Quản Lý Dòng Tiền</h2>
      <ul style={styles.menu}>
        <li><Link to="/dashboard">Ví</Link></li>
        <li><Link to="/transactions">Giao dịch</Link></li>
        <li><Link to="/budgets">Ngân sách</Link></li>
        <li><Link to="/goals">Mục tiêu</Link></li>
        <li><Link to="/transfers">Chuyển tiền</Link></li>
        <li><Link to="/categories">Danh mục</Link></li>
      </ul>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#282c34",
    padding: "10px 20px",
    color: "white",
  },
  logo: {
    margin: 0,
  },
  menu: {
    listStyle: "none",
    display: "flex",
    gap: "15px",
  }
};

export default Navbar;
