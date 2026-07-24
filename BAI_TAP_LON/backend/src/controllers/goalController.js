const db = require("../config/db");
const Goal = require("../models/Goal");

const mapRowsToGoal = (rows) => rows.map((row) => new Goal(row));

const serializeGoal = (goal) => ({
  ...goal,
  is_completed: goal.isCompleted(),
  progress_percent: goal.getProgressPercent()
});

// ✅ GET goals
exports.getGoals = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Savings_Goals WHERE user_id=?",
      [req.user.user_id]
    );

    const goals = mapRowsToGoal(rows).map(serializeGoal);

    res.json({ data: goals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get goals" });
  }
};

// ✅ CREATE goal
exports.createGoal = async (req, res) => {
  try {
    const { goal_name, target_amount, target_date } = req.body;

    if (!goal_name || goal_name.trim() === ""|| target_amount == null) {
      return res.status(400).json({
        message: "Goal name and target amount are required"
      });
    }

    if (target_amount <= 0) {
      return res.status(400).json({
        message: "Invalid target amount"
      });
    }

    let query = `
      INSERT INTO Savings_Goals 
      (user_id, goal_name, target_amount, current_amount
    `;

    let values = [
      req.user.user_id,
      goal_name,
      target_amount,
      0
    ];

    if (target_date) {
      query += ", target_date) VALUES (?,?,?,?,?)";
      values.push(target_date);
    } else {
      query += ") VALUES (?,?,?,?)";
    }

    const [result] = await db.query(query, values);

    const newGoal = serializeGoal(
      new Goal({
        goal_id: result.insertId,
        user_id: req.user.user_id,
        goal_name,
        target_amount,
        current_amount: 0,
        target_date: target_date || null
      })
    );

    res.status(201).json({
      message: "Goal created",
      data: newGoal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to create goal"
    });
  }
};

// ✅ UPDATE goal
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { goal_name, target_amount, target_date } = req.body;

    const [existingRows] = await db.query(
      "SELECT * FROM Savings_Goals WHERE goal_id=? AND user_id=?",
      [id, req.user.user_id]
    );

    if (!existingRows || existingRows.length === 0) {
      return res.status(404).json({
        message: "Goal not found"
      });
    }

    let query = "UPDATE Savings_Goals SET ";
    let updates = [];
    let params = [];

    if (goal_name !== undefined) {
      updates.push("goal_name=?");
      params.push(goal_name);
    }

    if (target_amount !== undefined) {
      updates.push("target_amount=?");
      params.push(target_amount);
    }

    if (target_date !== undefined) {
      updates.push("target_date=?");
      params.push(target_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message: "No fields to update"
      });
    }

    query += updates.join(", ");
    query += " WHERE goal_id=? AND user_id=?";
    params.push(id, req.user.user_id);

    const [result] = await db.query(query, params);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({
        message: "Goal not found"
      });
    }

    const [updatedRows] = await db.query(
      "SELECT * FROM Savings_Goals WHERE goal_id=? AND user_id=?",
      [id, req.user.user_id]
    );

    const updatedGoal = serializeGoal(new Goal(updatedRows[0]));

    res.json({
      message: "Goal updated",
      data: updatedGoal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to update goal"
    });
  }
};

// ✅ DELETE
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM Savings_Goals WHERE goal_id=? AND user_id=?",
      [id, req.user.user_id]
    );

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete goal" });
  }
};