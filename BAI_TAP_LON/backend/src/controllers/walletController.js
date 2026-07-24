const db = require("../config/db");
const service = require("../services/walletService");
const Wallet = require("../models/Wallet");

const serializeWallet = (payload) => {
  if (!payload) return null;

  const wallet = payload instanceof Wallet ? payload : new Wallet(payload);
  return wallet.toJSON();
};

// ✅ CREATE WALLET
exports.createWallet = async (req, res) => {
  try {
    const { wallet_name, wallet_type } = req.body;

    if (!wallet_name || !wallet_type || wallet_name.trim() === "" || wallet_type.trim() === "") {
      return res.status(400).json({ message: "Wallet name and type are required" });
    }

    const result = await service.createWallet(req.user.user_id, req.body);

    res.status(201).json({
      ...result,
      data: result.data ? serializeWallet(result.data) : null
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: err.message
    });
  }
};

// ✅ GET ALL
exports.getWallets = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Wallets WHERE user_id=?",
      [req.user.user_id]
    );

    const wallets = rows.map((row) => serializeWallet(row));

    res.json(wallets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get wallets" });
  }
};

// ✅ GET BY ID
exports.getWalletById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid wallet ID" });
    }

    const [rows] = await db.query(
      "SELECT * FROM Wallets WHERE wallet_id=? AND user_id=?",
      [id, req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json(serializeWallet(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get wallet" });
  }
};

// ✅ UPDATE
exports.updateWallet = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid wallet ID" });
    }

    const result = await service.updateWallet(req.user.user_id, id, req.body);

    res.json({
      ...result,
      data: result.data ? serializeWallet(result.data) : null
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// ✅ CLOSE
exports.closeWallet = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid wallet ID" });
    }

    const result = await service.closeWallet(req.user.user_id, id);

    res.json({
      ...result,
      data: result.data ? serializeWallet(result.data) : null
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// ✅ OPEN
exports.openWallet = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid wallet ID" });
    }

    const result = await service.openWallet(req.user.user_id, id);

    res.json({
      ...result,
      data: result.data ? serializeWallet(result.data) : null
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};