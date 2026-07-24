const router = require("express").Router();
const ctrl = require("../controllers/transactionController");
const auth = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

// ✅ GET transactions
router.get("/", auth, ctrl.getTransactions);

// ✅ CREATE transaction
router.post("/", auth,[
    body("amount").isFloat({ min: 1 }).withMessage("Số tiền phải là số dương")
], validate ,ctrl.createTransaction);

// ✅ REVERSE transaction
router.post("/reverse/:id", auth, ctrl.reverseTransaction);

module.exports = router;