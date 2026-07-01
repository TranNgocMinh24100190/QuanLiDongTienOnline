const router = require("express").Router();
const ctrl = require("../controllers/transactionController");
const auth = require("../middleware/authMiddleware");

// ✅ GET transactions
router.get("/", auth, ctrl.getTransactions);

// ✅ CREATE transaction
router.post("/", auth, ctrl.createTransaction);

// ✅ REVERSE transaction
router.post("/:id/reverse", auth, ctrl.reverseTransaction);

module.exports = router;