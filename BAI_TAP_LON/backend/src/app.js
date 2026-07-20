const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); 
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit"); 
const errorMiddleware = require("./middleware/errorMiddleware");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    message:
      "Too many requests. Please try again later."
  },

  standardHeaders: true,

  legacyHeaders: false
});
const app = express();
app.use(helmet());

// middleware
app.use(cors({
  origin: [
    "http://localhost:3000"
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
app.use("/auth", authLimiter, require("./routes/authRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/wallets", require("./routes/walletRoutes"));
app.use("/transactions", require("./routes/transactionRoutes"));
app.use("/budgets", require("./routes/budgetRoutes"));
app.use("/goals", require("./routes/goalRoutes"));
app.use("/transfers", require("./routes/transferRoutes"));
app.use("/categories", require("./routes/categoryRoutes"));

app.use(errorMiddleware);

module.exports = app;