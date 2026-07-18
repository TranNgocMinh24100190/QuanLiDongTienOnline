const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); 
const session = require("express-session"); 
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001"
  ],  // Thay đổi thành URL của frontend
  credentials: true  // QUAN TRỌNG cho cookie
}));

app.use(express.json());
app.use(cookieParser()); 

app.use(session({
  secret: "secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 1000
  }
}));

// test API
app.get("/", (req, res) => {
  res.send("🚀 Backend QuanLyDongTien đang chạy");
});

// routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/wallets", require("./routes/walletRoutes"));
app.use("/transactions", require("./routes/transactionRoutes"));
app.use("/budgets", require("./routes/budgetRoutes"));
app.use("/goals", require("./routes/goalRoutes"));
app.use("/transfers", require("./routes/transferRoutes"));
app.use("/categories", require("./routes/categoryRoutes"));

app.use(errorMiddleware);

module.exports = app;