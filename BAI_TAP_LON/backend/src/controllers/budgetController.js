const db = require("../config/db");
const Budget = require("../models/Budget");

// ✅ GET budgets
exports.getBudgets = async (req, res) => {
  try {
    const [budgets] = await db.query(
      `
      SELECT B.*, C.category_name
      FROM Budgets B
      JOIN Categories C ON B.category_id = C.category_id
      WHERE B.user_id = ?
      `,
      [req.user.user_id]
    );

    const result = [];

    for (const budget of budgets) {
      const [spentRows] = await db.query(
        `
        SELECT SUM(amount) AS spent
        FROM Transactions
        WHERE category_id = ?
        AND transaction_type = 'Expense'
        AND is_transfer = 0
        AND is_reversed = 0
        AND MONTH(transaction_date) = ?
        AND YEAR(transaction_date) = ?
        `,
        [budget.category_id, budget.month, budget.year]
      );

      const spent = Number(spentRows[0].spent || 0);
      const limit = Number(budget.amount_limit);

      const budgetModel = new Budget({
        ...budget,
        spent,
        remaining: Math.max(limit - spent, 0),
        overspent: Math.max(spent - limit, 0)
      });

      budgetModel.status =
        budgetModel.overspent > 0
          ? "EXCEEDED"
          : budgetModel.remaining === 0
          ? "FULL"
          : "SAFE";

      result.push(budgetModel);
    }

    res.json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get budgets" });
  }
};

// ✅ CREATE budget
exports.createBudget = async (req, res) => {
  try {
    const { category_id, amount_limit, month, year } = req.body;

    const amountLimit = Number(amount_limit);
    const monthNum = Number(month);
    const yearNum = Number(year);

    if (!category_id || Number.isNaN(amountLimit) || Number.isNaN(monthNum) || Number.isNaN(yearNum)) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (amountLimit <= 0) {
      return res.status(400).json({ message: "Invalid amount limit" });
    }

    if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: "Invalid month" });
    }

    if (!Number.isInteger(yearNum) || yearNum < 2000) {
      return res.status(400).json({ message: "Invalid year" });
    }

    const [category] = await db.query(
      `SELECT type FROM Categories WHERE category_id = ? AND user_id = ?`,
      [category_id, req.user.user_id]
    );

    if (category.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category[0].type !== "Expense") {
      return res.status(400).json({ message: "Only Expense categories can have budgets" });
    }

    await db.query(
      "INSERT INTO Budgets(user_id, category_id, amount_limit, month, year) VALUES (?,?,?,?,?)",
      [req.user.user_id, category_id, amountLimit, monthNum, yearNum]
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
    const { amount_limit, month, year } = req.body;

    const amountLimit = Number(amount_limit);
    const monthNum = Number(month);
    const yearNum = Number(year);

    if (Number.isNaN(amountLimit)) {
      return res.status(400).json({ message: "Amount limit is required" });
    }

    if (amountLimit <= 0) {
      return res.status(400).json({ message: "Invalid amount limit" });
    }

    if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: "Invalid month" });
    }

    if (!Number.isInteger(yearNum) || yearNum < 2000) {
      return res.status(400).json({ message: "Invalid year" });
    }

    const [result] = await db.query(
      "UPDATE Budgets SET amount_limit=?, month=?, year=? WHERE budget_id=? AND user_id=?",
      [amountLimit, monthNum, yearNum, id, req.user.user_id]
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