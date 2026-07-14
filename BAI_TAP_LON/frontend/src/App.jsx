import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import các trang
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import Categories from "./pages/Categories";
import Goals from "./pages/Goals";
import Transactions from "./pages/Transactions";
import Transfers from "./pages/Transfers";

// Import Navbar
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transfers" element={<Transfers />} />
      </Routes>
    </Router>
  );
}

export default App;
