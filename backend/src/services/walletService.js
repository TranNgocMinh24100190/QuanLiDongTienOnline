const db = require("../config/db");
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

  await db.query(
    `INSERT INTO Wallets(user_id, wallet_name, wallet_type, balance, status)
     VALUES (?,?,?,?,?)`,
    [user_id, wallet_name.trim(), wallet_type.trim(), 0, "ACTIVE"]
  );

  return { message: "Wallet created successfully" };
};


// ✅ UPDATE WALLET (NEW 🔥)
exports.updateWallet = async (user_id, wallet_id, data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid input data");
  }

  const { wallet_name, wallet_type } = data;

  // ✅ không có gì update
  if (!wallet_name && !wallet_type) {
    throw new Error("No fields to update");
  }

  let updates = [];
  let params = [];

  // ✅ update name
  if (wallet_name) {
    if (wallet_name.trim() === "") {
      throw new Error("wallet_name cannot be empty");
    }
    updates.push("wallet_name=?");
    params.push(wallet_name.trim());
  }

  // ✅ update type (có điều kiện)
  if (wallet_type) {
    const validTypes = ["Cash", "Bank", "E-Wallet", "Credit Card", "Crypto Currency", "Other"];
    const type = wallet_type.trim();
    if (!validTypes.includes(type)) {
      throw new Error("Invalid wallet type");
    }

    // ❗ check transaction trước khi cho đổi type
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

  // ✅ build query dynamic
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

  return { message: "Wallet updated successfully" };
};



// ✅ CLOSE WALLET (version xịn)
exports.closeWallet = async (user_id, id) => {
  // 1. lấy wallet
  const [rows] = await db.query(
    "SELECT balance, status FROM Wallets WHERE wallet_id=? AND user_id=?",
    [id, user_id]
  );

  if (!rows || rows.length === 0) {
    throw new Error("Wallet not found");
  }

  const wallet = rows[0];

  // 2. check trạng thái
  if (wallet.status === "CLOSED") {
    throw new Error("Wallet already closed");
  }

  const balance = Number(wallet.balance || 0);

  // 3. chặn nếu còn tiền dương
  if (balance > 0) {
    throw new Error("Cannot close wallet with remaining balance");
  }

  // 4. check nếu đang âm → cảnh báo
  let warning = null;
  if (balance < 0) {
    warning = "Wallet has negative balance (debt)";
  }

  // 5. update DB
  await db.query(
    "UPDATE Wallets SET status='CLOSED', closed_at=NOW() WHERE wallet_id=? AND user_id=?",
    [id, user_id]
  );

  // 6. return kết quả (có warning nếu có)
  return {
    message: "Wallet closed successfully",
    warning: warning
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

  return { message: "Wallet reopened successfully" };
};