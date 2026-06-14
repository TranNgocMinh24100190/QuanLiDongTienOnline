const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// =====================
// CONNECT DB (MariaDB/MySQL)
// =====================
const pool = mysql.createPool({
  host: 'localhost',
  user: 'minh',
  password: '123456',
  database: 'QuanLyDongTien',
  waitForConnections: true,
  connectionLimit: 10
});

// =====================
// CREATE - Thêm giao dịch
// =====================
app.post('/transactions', async (req, res) => {
  try {
    const { wallet_id, category_id, amount, transaction_type, description, transaction_date } = req.body;

    const [result] = await pool.query(
      `INSERT INTO Transactions 
      (wallet_id, category_id, amount, transaction_type, description, transaction_date)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [wallet_id, category_id, amount, transaction_type, description, transaction_date]
    );

    res.json({
      message: 'Create success',
      transaction_id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// READ - Lấy tất cả
// =====================
app.get('/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Transactions');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// READ - Lấy theo ID
// =====================
app.get('/transactions/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Transactions WHERE transaction_id = ?',
      [req.params.id]
    );

    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// UPDATE - Sửa giao dịch
// =====================
app.put('/transactions/:id', async (req, res) => {
  try {
    const { amount, description } = req.body;

    await pool.query(
      `UPDATE Transactions 
       SET amount = ?, description = ?
       WHERE transaction_id = ?`,
      [amount, description, req.params.id]
    );

    res.json({ message: 'Update success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// DELETE - Xóa giao dịch
// =====================
app.delete('/transactions/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM Transactions WHERE transaction_id = ?',
      [req.params.id]
    );

    res.json({ message: 'Delete success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// START SERVER
// =====================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});