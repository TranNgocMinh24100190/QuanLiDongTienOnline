const router = require("express").Router();
const ctrl = require("../controllers/walletController");
const auth = require("../middleware/authMiddleware");

// ✅ CREATE wallet
router.post("/", auth, ctrl.createWallet);

// ✅ GET wallet
router.get("/", auth, ctrl.getWallets);

// ✅ GET wallet by ID
router.get("/:id", auth, ctrl.getWalletById);

// ✅ UPDATE wallet
router.put("/:id", auth, ctrl.updateWallet);

// ✅ CLOSE wallet
router.post("/:id/close", auth, ctrl.closeWallet);

// ✅ OPEN wallet
router.post("/:id/open", auth, ctrl.openWallet);

module.exports = router;

