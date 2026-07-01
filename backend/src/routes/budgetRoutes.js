const router = require("express").Router();
const ctrl = require("../controllers/budgetController");
const auth = require("../middleware/authMiddleware");

// ✅ GET budgets
router.get("/", auth, ctrl.getBudgets);

// ✅ CREATE
router.post("/", auth, ctrl.createBudget);

// ✅ UPDATE
router.put("/:id", auth, ctrl.updateBudget);

// ✅ DELETE
router.delete("/:id", auth, ctrl.deleteBudget);

module.exports = router;