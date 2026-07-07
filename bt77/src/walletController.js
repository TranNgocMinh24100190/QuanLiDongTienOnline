const db = require("../config/db");

exports.getWallets = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM wallets");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createWallet = async (req, res) => {
  const { name, balance } = req.body;
  try {
    await db.query("INSERT INTO wallets (name, balance) VALUES (?, ?)", [name, balance]);
    res.json({ message: "Wallet created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
