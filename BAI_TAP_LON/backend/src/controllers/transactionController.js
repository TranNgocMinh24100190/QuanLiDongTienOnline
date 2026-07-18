const db = require("../config/db");
const service = require("../services/transactionService");

// ✅ GET ALL TRANSACTIONS(Flexible with filters, sorting, and pagination)
exports.getTransactions = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // ✅ query params
    const {
      type,
      wallet_id,
      category_id,
      month,
      search,
      sort = "desc",
      page = 1,
      limit = 100
    } = req.query;

    let query = `
      SELECT T.*, W.wallet_name
      FROM Transactions T
      JOIN Wallets W ON T.wallet_id = W.wallet_id
      WHERE W.user_id = ?
    `;

    let params = [user_id];

    // =====================
    // ✅ FILTER
    // =====================

    if (type) {
      query += " AND T.transaction_type = ?";
      params.push(type);
    }

    if (wallet_id) {
      query += " AND T.wallet_id = ?";
      params.push(wallet_id);
    }

    if (category_id) {
      query += " AND T.category_id = ?";
      params.push(category_id);
    }

    if (month) {
      query += " AND MONTH(T.transaction_date) = ?";
      params.push(month);
    }

    if (search) {
      query += " AND T.description LIKE ?";
      params.push(`%${search}%`);
    }

    // =====================
    // ✅ SORT
    // =====================
    if (sort === "asc") {
      query += " ORDER BY T.transaction_date ASC,T.transaction_id ASC";
    } else {
      query += " ORDER BY T.transaction_date DESC,T.transaction_id DESC";
    }

    // =====================
    // ✅ PAGINATION
    // =====================
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    query += " LIMIT ? OFFSET ?";
    params.push(limitNum, offset);

    // =====================
    // ✅ EXECUTE
    // =====================
    const [rows] = await db.query(query, params);

    res.json({
      page: pageNum,
      limit: limitNum,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to get transactions"
    });
  }
};

// ✅ CREATE TRANSACTION
exports.createTransaction = async (req, res) => {
  try {
    const { wallet_id, category_id, amount, transaction_type } = req.body;

    if (!wallet_id || !category_id || !transaction_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const result = await service.createTransaction(
      req.user.user_id,
      req.body
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ REVERSE TRANSACTION
exports.reverseTransaction = async (req, res) => {
  try {
    const id = req.params.id;

    if(!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const result = await service.reverseTransaction(
      req.user.user_id,
      req.params.id
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};