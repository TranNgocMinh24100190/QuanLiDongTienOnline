const db = require("../config/db");
const Transaction = require("../models/Transaction");

const mapRowsToTransaction = (rows) => rows.map((row) => new Transaction(row));

exports.createTransaction = async (user_id, data) => {
  const { wallet_id, category_id, amount, transaction_type, description } = data;

  if (wallet_id == null || category_id == null || amount == null || !transaction_type) {
    throw new Error("Missing required fields");
  }

  if (amount <= 0) {
    throw new Error("Invalid amount");
  }

  const validTypes = ["Expense", "Income"];

  if (!validTypes.includes(transaction_type)) {
    throw new Error("Invalid transaction type");
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

  const walletBalance = Number(wallet[0].balance);
  const transactionAmount = Number(amount);

  if (transaction_type === "Expense" && walletBalance < transactionAmount) {
    throw new Error("Insufficient balance");
  }

  const [category] = await db.query(
    "SELECT * FROM Categories WHERE category_id=? AND user_id=?",
    [category_id, user_id]
  );

  if (category.length === 0) {
    throw new Error("Category not found");
  }

  if (category[0].type !== transaction_type) {
    throw new Error("Category type does not match transaction type");
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    let budgetWarning = null;

    if (transaction_type === "Expense") {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const [budgetRows] = await conn.query(
        `
          SELECT amount_limit
          FROM Budgets
          WHERE user_id = ?
            AND category_id = ?
            AND month = ?
            AND year = ?
          ORDER BY budget_id DESC
          LIMIT 1
        `,
        [user_id, category_id, month, year]
      );

      if (budgetRows.length > 0) {
        const budgetLimit = Number(budgetRows[0].amount_limit);

        const [spentRows] = await conn.query(
          `
            SELECT COALESCE(SUM(amount), 0) AS total
            FROM Transactions
            WHERE category_id = ?
              AND wallet_id = ?
              AND transaction_type = 'Expense'
              AND is_transfer = 0
              AND is_reversed = 0
              AND MONTH(transaction_date) = ?
              AND YEAR(transaction_date) = ?
          `,
          [category_id, wallet_id, month, year]
        );

        const totalSpent = Number(spentRows[0].total || 0);
        const newTotal = totalSpent + transactionAmount;

        if (newTotal > budgetLimit) {
          budgetWarning = "⚠️ Budget exceeded!";
        }
      }
    }

    const [insertResult] = await conn.query(
      `
        INSERT INTO Transactions
        (wallet_id, category_id, amount, transaction_type, description, transaction_date, is_transfer)
        VALUES (?, ?, ?, ?, ?, CURDATE(), ?)
      `,
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

    const createdTransaction = new Transaction({
      transaction_id: insertResult.insertId,
      wallet_id,
      category_id,
      amount: transactionAmount,
      transaction_type,
      description: description || "",
      transaction_date: new Date(),
      is_transfer: false,
      is_reversed: false,
      user_id
    });

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

        if (Number(g.current_amount) < Number(g.target_amount) && newAmount >= Number(g.target_amount)) {
          goalMessage.push(`🎉 Goal "${g.goal_name}" reached!`);
        }
      }
    }

    return {
      message: "Transaction success",
      budgetWarning,
      goalMessage: goalMessage.length > 0 ? goalMessage : null,
      data: createdTransaction.toJSON()
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// ✅ REVERSE TRANSACTION
exports.reverseTransaction = async (user_id, transaction_id) => {
  const [rows] = await db.query(
    `
      SELECT T.*, W.user_id
      FROM Transactions T
      JOIN Wallets W ON T.wallet_id = W.wallet_id
      WHERE T.transaction_id=? AND W.user_id=?
    `,
    [transaction_id, user_id]
  );

  if (rows.length === 0) {
    throw new Error("Transaction not found");
  }

  const t = rows[0];
  if (t.is_reversed) {
    throw new Error("Transaction has already been reversed");
  }
  if (t.description && t.description.startsWith("[REVERSED]")) {
    throw new Error("Cannot reverse a reversed transaction");
  }

  const reversedType = t.transaction_type === "Income" ? "Expense" : "Income";

  const [insertResult] = await db.query(
    `
      INSERT INTO Transactions(wallet_id, category_id, amount, transaction_type, description, transaction_date, is_transfer, is_reversed)
      VALUES (?,?,?,?,?,CURDATE(),?,?)
    `,
    [
      t.wallet_id,
      t.category_id,
      t.amount,
      reversedType,
      `[REVERSED] ${t.description.replace(/^\[REVERSED\]\s*/, "")}`,
      t.is_transfer,
      1
    ]
  );

  if (t.transaction_type === "Income") {
    await db.query(
      "UPDATE Wallets SET balance = balance - ? WHERE wallet_id=?",
      [t.amount, t.wallet_id]
    );
  } else {
    await db.query(
      "UPDATE Wallets SET balance = balance + ? WHERE wallet_id=?",
      [t.amount, t.wallet_id]
    );
  }

  if (t.transaction_type === "Income" && !t.is_transfer) {
    const [goals] = await db.query(
      "SELECT * FROM Savings_Goals WHERE user_id=?",
      [user_id]
    );

    for (const g of goals) {
      const newAmount = Math.max(Number(g.current_amount) - Number(t.amount), 0);
      await db.query(
        "UPDATE Savings_Goals SET current_amount=? WHERE goal_id=?",
        [newAmount, g.goal_id]
      );
    }
  }

  await db.query(
    "UPDATE Transactions SET is_reversed = 1 WHERE transaction_id = ?",
    [transaction_id]
  );

  const reversedTransaction = new Transaction({
    transaction_id: insertResult.insertId,
    wallet_id: t.wallet_id,
    category_id: t.category_id,
    amount: Number(t.amount),
    transaction_type: reversedType,
    description: `[REVERSED] ${t.description.replace(/^\[REVERSED\]\s*/, "")}`,
    transaction_date: new Date(),
    is_transfer: Boolean(t.is_transfer),
    is_reversed: true,
    user_id
  });

  return {
    message: "Transaction reversed successfully",
    data: reversedTransaction.toJSON()
  };
};