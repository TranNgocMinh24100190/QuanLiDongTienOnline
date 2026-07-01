const db = require("../config/db");

exports.createTransaction = async (user_id, data) => {
  const { wallet_id, category_id, amount, transaction_type, description } = data;

  if (!wallet_id || !category_id || !amount || !transaction_type) {
    throw new Error("Missing required fields");
  }

  if (amount <= 0) {
    throw new Error("Invalid amount");
  }

  const [wallet] = await db.query(
    "SELECT * FROM Wallets WHERE wallet_id=? AND user_id=?",
    [wallet_id, user_id]
  );

  if (wallet.length === 0) {
    throw new Error("Wallet not found");
  }

  if (wallet[0].status === "CLOSED") {
    throw new Error("Wallet is closed");
  }

  if (transaction_type === "Expense" && wallet[0].balance < amount) {
    throw new Error("Insufficient balance");
  }

  // ======================
  // ✅ CHECK CATEGORY (NEW)
  // ======================
  const [category] = await db.query(
    "SELECT * FROM Categories WHERE category_id=? AND user_id=?",
    [category_id, user_id]
  );

  if (category.length === 0) {
    throw new Error("Category not found");
  }

  // ✅ check type khớp (IMPORTANT)
  if (category[0].type !== transaction_type) {
    throw new Error("Category type does not match transaction type");
  }
  
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO Transactions(wallet_id,category_id,amount,transaction_type,description,transaction_date,is_transfer)
      VALUES (?,?,?,?,?,CURDATE(),?)`,
      [wallet_id, category_id, amount, transaction_type, description, false]
    );

    if (transaction_type === "Income") {
      await conn.query(
        "UPDATE Wallets SET balance = balance + ? WHERE wallet_id=?",
        [amount, wallet_id]
      );
    } else {
      await conn.query(
        "UPDATE Wallets SET balance = balance - ? WHERE wallet_id=?",
        [amount, wallet_id]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  let budgetWarning = null;

  if (transaction_type === "Expense") {

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const [budgets] = await db.query(
      "SELECT amount_limit FROM Budgets WHERE user_id=? AND category_id=? AND month=? AND year=?",
      [user_id, category_id, month, year]
    );
    if (budgets && budgets.length > 0) {
      const [spent] = await db.query(
        `SELECT SUM(amount) AS total FROM Transactions
         WHERE wallet_id=? AND category_id=? AND transaction_type="Expense" AND is_transfer=false
         AND MONTH(transaction_date)=? AND YEAR(transaction_date)=?`,
        [wallet_id, category_id, month, year]
      );

      const totalSpent = Number(spent[0].total || 0);
      const limit = Number(budgets[0].amount_limit);

      if (totalSpent > limit) {
        budgetWarning = "⚠️ Budget exceeded!";
      }
    }
  }

  let goalMessage = [];

  if (transaction_type === "Income" && !Boolean(data.is_transfer)) {
    const [goals] = await db.query(
      "SELECT * FROM Savings_Goals WHERE user_id=?",
      [user_id]
    );

    for (let g of goals) {
      const newAmount = Number(g.current_amount) + Number(amount);

      await db.query(
        "UPDATE Savings_Goals SET current_amount=? WHERE goal_id=?",
        [newAmount, g.goal_id]
      );

      if (newAmount >= g.target_amount) {
        goalMessage.push(`🎉 Goal "${g.goal_name}" reached!`);
      }
    }
  }

  return { message: "Transaction success", budgetWarning, goalMessage: goalMessage.length > 0 ? goalMessage : null };
};

// ✅ REVERSE TRANSACTION
exports.reverseTransaction = async (user_id, transaction_id) => {
  // 1. lấy transaction gốc + check quyền
  const [rows] = await db.query(`
    SELECT T.*, W.user_id
    FROM Transactions T
    JOIN Wallets W ON T.wallet_id = W.wallet_id
    WHERE T.transaction_id=? AND W.user_id=?
  `, [transaction_id, user_id]);

  if (rows.length === 0) {
    throw new Error("Transaction not found");
  }

  const t = rows[0];

  // 2. xác định loại đảo (chỉ để insert)
  const reversedType =
    t.transaction_type === "Income" ? "Expense" : "Income";

  // 3. insert transaction đảo
  await db.query(
    `INSERT INTO Transactions(wallet_id, category_id, amount, transaction_type, description, transaction_date, is_transfer)
    VALUES (?,?,?,?,?,CURDATE(),?)`,
    [
      t.wallet_id,
      t.category_id,
      t.amount,
      reversedType,
      `Reverse of transaction ${t.transaction_id}`,
      t.is_transfer
    ]
  );

  // ✅ 4. update balance (🔥 dùng transaction GỐC)
  if (t.transaction_type === "Income") {
    // gốc đã + → undo = -
    await db.query(
      "UPDATE Wallets SET balance = balance - ? WHERE wallet_id=?",
      [t.amount, t.wallet_id]
    );
  } else {
    // gốc đã - → undo = +
    await db.query(
      "UPDATE Wallets SET balance = balance + ? WHERE wallet_id=?",
      [t.amount, t.wallet_id]
    );
  }

  return { message: "Transaction reversed successfully" };
};