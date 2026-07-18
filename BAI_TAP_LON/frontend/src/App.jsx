import React from "react";
import {BrowserRouter as Router, Routes, Route, useLocation} from "react-router-dom";

import Navbar from "./components/Navbar";

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

function AppRoutes() {
  const location = useLocation();

  const authPages = [
    "/",
    "/login",
    "/register",
  ];

  const hideNavbar = authPages.includes(
    location.pathname
  );

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Auth */}
        <Route
          path="/"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Main Pages */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/wallets"
          element={<Wallets />}
        />

        <Route
          path="/transactions"
          element={<Transactions />}
        />

        <Route
          path="/transfers"
          element={<Transfers />}
        />

        <Route
          path="/goals"
          element={<Goals />}
        />

        <Route
          path="/budgets"
          element={<Budgets />}
        />

        <Route
          path="/categories"
          element={<Categories />}
        />
      </Routes>
    </>
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