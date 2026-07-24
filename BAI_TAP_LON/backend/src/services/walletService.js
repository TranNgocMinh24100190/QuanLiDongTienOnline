const db = require("../config/db");
const Wallet = require("../models/Wallet");

// ✅ CREATE WALLET
exports.createWallet = async (user_id, data) => {
  const { wallet_name, wallet_type } = data;

  if (!wallet_name || !wallet_type || wallet_name.trim() === "" || wallet_type.trim() === "") {
    throw new Error("Wallet name and type are required");
  }

  const validTypes = ["Cash", "Bank", "E-Wallet", "Credit Card", "Crypto Currency", "Other"];
  if (!validTypes.includes(wallet_type)) {
    throw new Error("Invalid wallet type");
  }

  const [result] = await db.query(
    `INSERT INTO Wallets(user_id, wallet_name, wallet_type, balance, status)
     VALUES (?,?,?,?,?)`,
    [user_id, wallet_name.trim(), wallet_type.trim(), 0, "ACTIVE"]
  );

  const wallet = new Wallet({
    wallet_id: result.insertId,
    user_id,
    wallet_name: wallet_name.trim(),
    wallet_type: wallet_type.trim(),
    balance: 0,
    status: "ACTIVE",
    created_at: new Date()
  });

  return {
    message: "Wallet created successfully",
    data: wallet.toJSON()
  };
};

// ✅ UPDATE WALLET
exports.updateWallet = async (user_id, wallet_id, data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid input data");
  }

  const { wallet_name, wallet_type } = data;

  if (!wallet_name && !wallet_type) {
    throw new Error("No fields to update");
  }

  let updates = [];
  let params = [];

  if (wallet_name) {
    if (wallet_name.trim() === "") {
      throw new Error("wallet_name cannot be empty");
    }
    updates.push("wallet_name=?");
    params.push(wallet_name.trim());
  }

  if (wallet_type) {
    const validTypes = ["Cash", "Bank", "E-Wallet", "Credit Card", "Crypto Currency", "Other"];
    const type = wallet_type.trim();
    if (!validTypes.includes(type)) {
      throw new Error("Invalid wallet type");
    }

    const [transactions] = await db.query(
      "SELECT 1 FROM Transactions WHERE wallet_id=? LIMIT 1",
      [wallet_id]
    );

    if (transactions && transactions.length > 0) {
      throw new Error("Cannot change wallet type after transactions exist");
    }

    updates.push("wallet_type=?");
    params.push(type);
  }

  if (updates.length === 0) {
    throw new Error("No valid fields to update");
  }

  const query = `
    UPDATE Wallets
    SET ${updates.join(", ")}
    WHERE wallet_id=? AND user_id=?
  `;

  params.push(wallet_id, user_id);

  const [result] = await db.query(query, params);

  if (!result || result.affectedRows === 0) {
    throw new Error("Wallet not found");
  }

  const [updatedRows] = await db.query(
    "SELECT * FROM Wallets WHERE wallet_id=? AND user_id=?",
    [wallet_id, user_id]
  );

  const wallet = updatedRows.length > 0 ? new Wallet(updatedRows[0]) : null;

  return {
    message: "Wallet updated successfully",
    data: wallet ? wallet.toJSON() : null
  };
};

// ✅ CLOSE WALLET
exports.closeWallet = async (user_id, id) => {
  const [rows] = await db.query(
    "SELECT balance, status FROM Wallets WHERE wallet_id=? AND user_id=?",
    [id, user_id]
  );

  if (!rows || rows.length === 0) {
    throw new Error("Wallet not found");
  }

  const wallet = rows[0];

  if (wallet.status === "CLOSED") {
    throw new Error("Wallet already closed");
  }

  const balance = Number(wallet.balance || 0);

  if (balance > 0) {
    throw new Error("Cannot close wallet with remaining balance");
  }

  let warning = null;
  if (balance < 0) {
    warning = "Wallet has negative balance (debt)";
  }

  await db.query(
    "UPDATE Wallets SET status='CLOSED', closed_at=NOW() WHERE wallet_id=? AND user_id=?",
    [id, user_id]
  );

  const [updatedRows] = await db.query(
    "SELECT * FROM Wallets WHERE wallet_id=? AND user_id=?",
    [id, user_id]
  );

  const updatedWallet = updatedRows.length > 0 ? new Wallet(updatedRows[0]) : null;

  return {
    message: "Wallet closed successfully",
    warning,
    data: updatedWallet ? updatedWallet.toJSON() : null
  };
};

// ✅ OPEN WALLET
exports.openWallet = async (user_id, id) => {
  const [rows] = await db.query(
    "SELECT status FROM Wallets WHERE wallet_id=? AND user_id=?",
    [id, user_id]
  );

  if (!rows || rows.length === 0) {
    throw new Error("Wallet not found");
  }

  if (rows[0].status === "ACTIVE") {
    throw new Error("Wallet already active");
  }

  await db.query(
    "UPDATE Wallets SET status='ACTIVE', closed_at=NULL WHERE wallet_id=? AND user_id=?",
    [id, user_id]
  );

  const [updatedRows] = await db.query(
    "SELECT * FROM Wallets WHERE wallet_id=? AND user_id=?",
    [id, user_id]
  );

  const updatedWallet = updatedRows.length > 0 ? new Wallet(updatedRows[0]) : null;

  return {
    message: "Wallet reopened successfully",
    data: updatedWallet ? updatedWallet.toJSON() : null
  };
};