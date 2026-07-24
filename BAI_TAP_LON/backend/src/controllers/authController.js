const db = require("../config/db");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ✅ generate token
const generateAccessToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};


// ✅ REGISTER
exports.register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hash = await bcrypt.hash(password, 10);

    const [existingUser] = await db.query(
      "SELECT * FROM Users WHERE email=?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const [result] = await db.query(
      "INSERT INTO Users(full_name,email,password_hash) VALUES (?,?,?)",
      [full_name, email, hash]
    );

    const user_id = result.insertId;

    const user = new User({
      user_id,
      full_name,
      email,
      password_hash: hash,
      role: "USER",
      created_at: new Date(),
      updated_at: new Date()
    });

    // ✅ AUTO CREATE SYSTEM CATEGORY
    await db.query(
      `INSERT INTO Categories (user_id, category_name, type, is_system)
       VALUES 
       (?, 'Transfer Out', 'Expense', 1),
       (?, 'Transfer In', 'Income', 1)`,
      [user_id, user_id]
    );

    res.json({ message: "Register success" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Register failed" });
  }
};


// ✅ LOGIN (SET COOKIE)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [rows] = await db.query(
      "SELECT * FROM Users WHERE email=?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = new User(rows[0]);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // ✅ tạo token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // ✅ set cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Login success",
      role: user.role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};


// ✅ REFRESH TOKEN
exports.refreshToken = (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );

    const newAccessToken = jwt.sign(
      { user_id: decoded.user_id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000
    });

    res.json({ message: "Token refreshed" });

  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};
// ✅ PROFILE
exports.me = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [rows] = await db.query(
      "SELECT user_id, full_name, email, role FROM Users WHERE user_id = ?",
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get user profile" });
  }
}; 

// ✅ LOGOUT
exports.logout = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  res.json({
    message: "Logged out"
  });
};