const db = require("../config/db");

// ✅ GET goals
exports.getGoals = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Savings_Goals WHERE user_id=?",
      [req.user.user_id]
    );

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to get goals" });
  }
};

// ✅ CREATE goal
exports.createGoal = async (req, res) => {
  try {
    const { goal_name, target_amount, target_date } = req.body;

    if (!goal_name || !target_amount) {
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

    // ✅ nếu có target_date thì thêm
    if (target_date) {
      query += ", target_date) VALUES (?,?,?,?,?)";
      values.push(target_date);
    } else {
      query += ") VALUES (?,?,?,?)";
    }

    await db.query(query, values);

    res.status(201).json({
      message: "Goal created"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to create goal"
    });
  }
};

// ✅ UPDATE progress
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { goal_name, target_amount, target_date } = req.body;

    let query = "UPDATE Savings_Goals SET ";
    let updates = [];
    let params = [];

    if (goal_name) {
      updates.push("goal_name=?");
      params.push(goal_name);
    }

    if (target_amount) {
      updates.push("target_amount=?");
      params.push(target_amount);
    }

    // ✅ optional target_date
    if (target_date) {
      updates.push("target_date=?");
      params.push(target_date);
    }

    // ✅ nếu không có gì để update
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

    res.json({
      message: "Goal updated"
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