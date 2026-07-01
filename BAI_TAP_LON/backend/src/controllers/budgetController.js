const db = require("../config/db");

// ✅ GET budgets
exports.getBudgets = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Budgets WHERE user_id=?",
      [req.user.user_id]
    );

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to get budgets" });
  }
};

// ✅ CREATE budget
exports.createBudget = async (req, res) => {
  try {
    const { category_id, amount_limit, month, year } = req.body;

    if (!category_id || !amount_limit || !month || !year) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (amount_limit <= 0) {
      return res.status(400).json({ message: "Invalid amount limit" });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid month" });
    }

    await db.query(
      "INSERT INTO Budgets(user_id, category_id, amount_limit, month, year) VALUES (?,?,?,?,?)",
      [req.user.user_id, category_id, amount_limit, month, year]
    );

    res.status(201).json({ message: "Budget created" });
  } catch (err) {
    res.status(500).json({ message: "Failed to create budget" });
  }
};

// ✅ UPDATE
exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount_limit } = req.body;

    if (!amount_limit) {
      return res.status(400).json({ message: "Amount limit is required" });
    }

    if (amount_limit <= 0) {
      return res.status(400).json({ message: "Invalid amount limit" });
    }

    const [result] = await db.query(
      "UPDATE Budgets SET amount_limit=? WHERE budget_id=? AND user_id=?",
      [amount_limit, id, req.user.user_id]
    );

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({ message: "Budget updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update budget" });
  }
};

// ✅ DELETE
exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM Budgets WHERE budget_id=? AND user_id=?",
      [id, req.user.user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({ message: "Budget deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete budget" });
  }
};