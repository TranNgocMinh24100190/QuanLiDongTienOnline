const db = require("../config/db");

exports.createTransfer = async (user_id, data) => {
  const { from_wallet_id, to_wallet_id, amount } = data;

  if (!from_wallet_id || !to_wallet_id || !amount) {
    throw new Error("Missing required fields");
  }

  if (amount <= 0) {
    throw new Error("Invalid amount");
  }

  if (from_wallet_id === to_wallet_id) {
    throw new Error("Cannot transfer to same wallet");
  }

  // ✅ check wallet tồn tại
  const [wallets] = await db.query(
    "SELECT wallet_id, wallet_name FROM Wallets WHERE wallet_id IN (?,?) AND user_id=?",
    [from_wallet_id, to_wallet_id, user_id]
  );

  if (wallets.length !== 2) {
    throw new Error("Wallet not found");
  }

  const fromWallet = wallets.find((w) => w.wallet_id == from_wallet_id);

  const toWallet = wallets.find((w) => w.wallet_id == to_wallet_id);

  const fromWalletName = fromWallet?.wallet_name || "Unknown";

  const toWalletName = toWallet?.wallet_name || "Unknown";

  // ✅ check balance đủ
  const [fromWalletBalance] = await db.query(
    "SELECT balance FROM Wallets WHERE wallet_id=?",
    [from_wallet_id]
  );

  const sourceBalance = Number(fromWalletBalance[0].balance);
  const transferAmount = Number(amount);

  if (sourceBalance < transferAmount) {
    throw new Error("Insufficient balance");
  }

  // ✅ lấy category Transfer Out
  const [outCat] = await db.query(
    `SELECT category_id FROM Categories 
     WHERE user_id=? AND category_name="Transfer Out"`,
    [user_id]
  );

  // ✅ lấy category Transfer In
  const [inCat] = await db.query(
    `SELECT category_id FROM Categories 
     WHERE user_id=? AND category_name="Transfer In"`,
    [user_id]
  );
  if (outCat.length === 0 || inCat.length === 0) {
    throw new Error("Transfer categories not found");
  }

  const transferOutId = outCat[0].category_id;
  const transferInId = inCat[0].category_id;

  const groupId = Date.now();

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // ✅ 1. insert Expense (wallet nguồn)
    const [outTx] = await conn.query(
      `INSERT INTO Transactions
    (wallet_id, category_id, amount, transaction_type, description, transaction_date, is_transfer, transfer_group_id)
     VALUES (?,?,?,?,?,CURDATE(),1,?)`,
      [
        from_wallet_id,
        transferOutId,
        amount,
        "Expense",
        `Chuyển sang ví ${toWalletName}`,
        groupId
      ]
    );

    // ✅ 2. insert Income (wallet đích)
    const [inTx] = await conn.query(
      `INSERT INTO Transactions
    (wallet_id, category_id, amount, transaction_type, description, transaction_date, is_transfer, transfer_group_id)
     VALUES (?,?,?,?,?,CURDATE(),1,?)`,
      [
        to_wallet_id,
        transferInId,
        amount,
        "Income",
        `Nhận từ ví ${fromWalletName}`,
        groupId
      ]
    );
    // ✅ 3. update balance
    await conn.query(
      "UPDATE Wallets SET balance = balance - ? WHERE wallet_id=?",
      [amount, from_wallet_id]
    );

    await conn.query(
      "UPDATE Wallets SET balance = balance + ? WHERE wallet_id=?",
      [amount, to_wallet_id]
    );

    await conn.commit();

    return {
      message: "Transfer success",
      transfer: {
        from_transaction_id: outTx.insertId,
        to_transaction_id: inTx.insertId
      }
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.reverseTransfer = async (user_id, transaction_id) => {
  // ✅ 1. lấy transaction gốc + check quyền
  const [rows] = await db.query(
    `SELECT T.*, W.user_id
     FROM Transactions T
     JOIN Wallets W ON T.wallet_id = W.wallet_id
     WHERE T.transaction_id=? AND W.user_id=? AND T.is_transfer=1`,
    [transaction_id, user_id]
  );

  if (!rows || rows.length === 0) {
    throw new Error("Transfer transaction not found");
  }

  const t = rows[0];

  // ✅ 2. check group_id tồn tại
  if (!t.transfer_group_id) {
    throw new Error("Transfer group not found");
  }

  // ✅ 3. lấy toàn bộ group transaction
  const [groupTx] = await db.query(
    `SELECT T.*, W.user_id
     FROM Transactions T
     JOIN Wallets W ON T.wallet_id = W.wallet_id
     WHERE T.transfer_group_id=? AND W.user_id=?`,
    [t.transfer_group_id, user_id]
  );

  if (!groupTx || groupTx.length < 2) {
    throw new Error("Invalid transfer group");
  }

  // ✅ 4. chặn reverse nhiều lần
  const [check] = await db.query(
    `SELECT transaction_id FROM Transactions
     WHERE transfer_group_id=? 
     AND description LIKE '%Reverse transfer%' 
     LIMIT 1`,
    [t.transfer_group_id]
  );

  if (check.length > 0) {
    throw new Error("Transfer already reversed");
  }

  // ✅ 5. bắt đầu transaction DB
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    for (let tx of groupTx) {

      const reverseType =
        tx.transaction_type === "Income" ? "Expense" : "Income";

      // ✅ insert reverse transaction
      await conn.query(
        `INSERT INTO Transactions
        (wallet_id, category_id, amount, transaction_type, description, transaction_date, is_transfer, transfer_group_id, is_reversed)
        VALUES (?,?,?,?,?,CURDATE(),1,?,?)`,
        [
          tx.wallet_id,
          tx.category_id,
          tx.amount,
          reverseType,
          reverseType === "Income"
            ? `🔄 Hoàn tác giao dịch chuyển tiền`
            : `🔄 Hoàn tác giao dịch nhận tiền`,
          tx.transfer_group_id,
          1
        ]
      );

      // ✅ update balance
      if (tx.transaction_type === "Income") {
        // undo income → trừ
        await conn.query(
          "UPDATE Wallets SET balance = balance - ? WHERE wallet_id=?",
          [tx.amount, tx.wallet_id]
        );
      } else {
        // undo expense → cộng
        await conn.query(
          "UPDATE Wallets SET balance = balance + ? WHERE wallet_id=?",
          [tx.amount, tx.wallet_id]
        );
      }
    }

    await conn.query(
      `UPDATE Transactions 
       SET is_reversed = 1  
       WHERE transfer_group_id = ?`,
      [t.transfer_group_id]
    );

    await conn.commit();

    return {
      message: "Transfer reversed successfully"
    };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};