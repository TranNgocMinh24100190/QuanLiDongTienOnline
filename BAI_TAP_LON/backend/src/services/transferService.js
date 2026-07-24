const db = require("../config/db");
const Transfer = require("../models/Transfer");

exports.createTransfer = async (user_id, data) => {
  const { from_wallet_id, to_wallet_id, amount, note } = data;

  if (from_wallet_id == null || to_wallet_id == null || amount == null) {
    throw new Error("Missing required fields");
  }

  if (Number(amount) <= 0) {
    throw new Error("Invalid amount");
  }

  if (from_wallet_id === to_wallet_id) {
    throw new Error("Cannot transfer to same wallet");
  }

  const [wallets] = await db.query(
    "SELECT wallet_id, wallet_name FROM Wallets WHERE wallet_id IN (?, ?) AND user_id=?",
    [from_wallet_id, to_wallet_id, user_id]
  );

  if (wallets.length !== 2) {
    throw new Error("Wallet not found");
  }

  const fromWallet = wallets.find((w) => w.wallet_id == from_wallet_id);
  const toWallet = wallets.find((w) => w.wallet_id == to_wallet_id);

  const fromWalletName = fromWallet?.wallet_name || "Unknown";
  const toWalletName = toWallet?.wallet_name || "Unknown";

  const [fromWalletBalance] = await db.query(
    "SELECT balance FROM Wallets WHERE wallet_id=?",
    [from_wallet_id]
  );

  const sourceBalance = Number(fromWalletBalance[0].balance);
  const transferAmount = Number(amount);

  if (sourceBalance < transferAmount) {
    throw new Error("Insufficient balance");
  }

  const [outCat] = await db.query(
    `SELECT category_id FROM Categories
     WHERE user_id=? AND category_name="Transfer Out"`,
    [user_id]
  );

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

    // insert transfer header into Transfers table (thema phù hợp với schema)
    const [transferInsert] = await conn.query(
      `INSERT INTO Transfers (from_wallet_id, to_wallet_id, amount, transfer_date, note)
       VALUES (?, ?, ?, CURDATE(), ?)`,
      [from_wallet_id, to_wallet_id, amount, note || null]
    );

    // insert expense transaction (nguồn)
    const [outTx] = await conn.query(
      `INSERT INTO Transactions
       (wallet_id, category_id, amount, transaction_type, description, transaction_date, is_transfer, transfer_group_id)
       VALUES (?, ?, ?, ?, ?, CURDATE(), 1, ?)`,
      [
        from_wallet_id,
        transferOutId,
        amount,
        "Expense",
        `Chuyển sang ví ${toWalletName}`,
        groupId
      ]
    );

    // insert income transaction (đích)
    const [inTx] = await conn.query(
      `INSERT INTO Transactions
       (wallet_id, category_id, amount, transaction_type, description, transaction_date, is_transfer, transfer_group_id)
       VALUES (?, ?, ?, ?, ?, CURDATE(), 1, ?)`,
      [
        to_wallet_id,
        transferInId,
        amount,
        "Income",
        `Nhận từ ví ${fromWalletName}`,
        groupId
      ]
    );

    // update balances
    await conn.query(
      "UPDATE Wallets SET balance = balance - ? WHERE wallet_id=?",
      [amount, from_wallet_id]
    );

    await conn.query(
      "UPDATE Wallets SET balance = balance + ? WHERE wallet_id=?",
      [amount, to_wallet_id]
    );

    await conn.commit();

    const transferModel = new Transfer({
      transfer_id: transferInsert.insertId,
      from_wallet_id,
      to_wallet_id,
      amount: transferAmount,
      transfer_date: new Date(),
      note: note || "",
      from_wallet_name: fromWalletName,
      to_wallet_name: toWalletName,
      from_transaction_id: outTx.insertId,
      to_transaction_id: inTx.insertId,
      transfer_group_id: groupId,
      is_reversed: false
    });

    return {
      message: "Transfer success",
      data: transferModel.toJSON()
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.reverseTransfer = async (user_id, transaction_id) => {
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

  if (!t.transfer_group_id) {
    throw new Error("Transfer group not found");
  }

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

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    for (const tx of groupTx) {
      const reverseType = tx.transaction_type === "Income" ? "Expense" : "Income";

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

      if (tx.transaction_type === "Income") {
        await conn.query(
          "UPDATE Wallets SET balance = balance - ? WHERE wallet_id=?",
          [tx.amount, tx.wallet_id]
        );
      } else {
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

    const transferModel = new Transfer({
      transfer_group_id: t.transfer_group_id,
      amount: Number(t.amount),
      transfer_date: new Date(),
      note: "Reverse transfer",
      is_reversed: true
    });

    return {
      message: "Transfer reversed successfully",
      data: transferModel.toJSON()
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};