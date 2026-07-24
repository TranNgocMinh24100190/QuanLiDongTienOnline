const db = require("../config/db");
const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const [rows] = await db.query(
      `SELECT user_id, full_name, email, role, created_at
       FROM Users`
    );

    const users = rows.map((row) => new User(row));

    res.json({
      data: users.map((u) => u.toJSON())
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to get users" });
  }
};