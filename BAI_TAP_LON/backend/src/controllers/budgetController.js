const db = require("../config/db");

// ✅ GET budgets
exports.getBudgets = async (req, res) => {
  try {
    const [budgets] = await db.query(
      `SELECT B.*, C.category_name
      FROM Budgets B
      JOIN Categories C
      ON B.category_id = C.category_id
      WHERE B.user_id = ?
      `,
      [req.user.user_id]
    );

    const result = [];

    for (const budget of budgets) {
      const [spentRows] = await db.query(
        `SELECT SUM(amount) AS spent
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

      result.push({...budget, spent, remaining: Math.max(limit - spent, 0), overspent: Math.max(spent - limit, 0), status: spent > limit ? "EXCEEDED" : spent === limit ? "FULL" : "SAFE"});

    }
    res.json({data: result});

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to get budgets"
    });
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

    const [category] = await db.query(
      `SELECT type FROM Categories WHERE category_id = ? AND user_id = ?`,
      [category_id, req.user.user_id]
    );

    if (
      category.length === 0
    ) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    if (
      category[0].type !== "Expense"
    ) {
      return res.status(400).json({
        message:
          "Only Expense categories can have budgets"
      });
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