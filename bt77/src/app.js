const express = require("express");
const cors = require("cors");

const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const transferRoutes = require("./routes/transferRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const goalRoutes = require("./routes/goalRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/wallets", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);

module.exports = app;
