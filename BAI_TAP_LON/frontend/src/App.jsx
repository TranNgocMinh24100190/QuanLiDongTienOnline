import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Header from "./components/Header";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Wallets from "./pages/Wallets";
import Transactions from "./pages/Transactions";
import Transfers from "./pages/Transfers";
import Goals from "./pages/Goals";
import Budgets from "./pages/Budgets";
import Categories from "./pages/Categories";
import Admin from "./pages/Admin";

function AppRoutes() {
  const location = useLocation();
  const authPages = ["/", "/login", "/register"];
  const hideNavbar = authPages.includes(location.pathname);

  const [searchText, setSearchText] = useState("");

  return (
    <div style={{ display: "flex" }}>
      {!hideNavbar && <Navbar searchText={searchText} />}

      <div
        style={{
          flex: 1,
          minHeight: "100vh",
          background: "#f8fafc"
        }}
      >
        {!hideNavbar && <Header onSearch={setSearchText} />}

        <div style={{ padding: "24px" }}>
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallets" element={<Wallets />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;