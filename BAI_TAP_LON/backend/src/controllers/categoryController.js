const db = require("../config/db");

// ✅ GET categories (thêm filter type)
exports.getCategories = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { type } = req.query;

    let query = "SELECT * FROM Categories WHERE user_id=?";
    let params = [user_id];

    // ✅ THÊM filter theo type (NEW)
    if (type) {
      query += " AND type=?";
      params.push(type);
    }

    const [rows] = await db.query(query, params);

    res.json({
      count: rows.length,
      data: rows
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to get categories" });
  }
};

// ✅ CREATE (THÊM type)
exports.createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    // ✅ VALIDATE thêm type
    if (!name || !type || name.trim() === "" || type.trim() === "") {
      return res.status(400).json({
        message: "Name and type are required"
      });
    }

    if (!["Income", "Expense"].includes(type)) {
      return res.status(400).json({
        message: "Invalid category type"
      });
    }

    await db.query(
      "INSERT INTO Categories(user_id, category_name, type, is_system) VALUES (?,?,?,0)",
      [req.user.user_id, name.trim(), type]
    );

    res.status(201).json({ message: "Category created" });

  } catch (err) {
    res.status(500).json({ message: "Failed to create category" });
  }
};

// ✅ UPDATE 
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    const [rows] = await db.query(
      `SELECT is_system 
      FROM Categories 
      WHERE category_id = ?
      AND user_id = ?`,
      [id, req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    if (rows[0].is_system === 1) {
      return res.status(400).json({
        message:
          "System categories cannot be updated"
      });
    }

    const [result] = await db.query(
      `UPDATE Categories
      SET category_name = ?
      WHERE category_id = ?
      AND user_id = ?`,
      [name.trim(), id, req.user.user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.json({message:"Category updated"});

  } catch (err) {
    console.error(err);
    res.status(500).json({message: "Failed to update category"});
  }
};

// ✅ DELETE (GIỮ NGUYÊN)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ THÊM check system category (không cho delete)
    const [rows] = await db.query(
      "SELECT is_system FROM Categories WHERE category_id=? AND user_id=?",
      [id, req.user.user_id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    if (rows[0].is_system === 1) {
      return res.status(400).json({
        message: "System categories cannot be deleted"
      });
    }

    const [result] = await db.query(
      "DELETE FROM Categories WHERE category_id=? AND user_id=?",
      [id, req.user.user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.json({ message: "Category deleted" });

  } catch (err) {
    res.status(500).json({ message: "Failed to delete category" });
  }
};