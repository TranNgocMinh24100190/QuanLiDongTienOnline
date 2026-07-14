const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");

router.get("/", walletController.getWallets);
router.post("/", walletController.createWallet);

module.exports = router;
