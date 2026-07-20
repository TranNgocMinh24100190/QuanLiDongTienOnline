const router = require("express").Router();
const ctrl = require("../controllers/budgetController");
const auth = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

// ✅ GET budgets
router.get("/", auth, ctrl.getBudgets);

// ✅ CREATE
router.post("/", auth, [
    body("amount_limit").isFloat({ min: 1 }).withMessage("Giới hạn ngân sách phải là số dương"),
    body("month").isInt({ min: 1, max: 12 }).withMessage("Tháng không hợp lệ"),
    body("year").isInt({ min: 2000 }).withMessage("Năm không hợp lệ"),
    body("category_id").notEmpty().withMessage("Danh mục không được để trống")
], validate, ctrl.createBudget);

// ✅ UPDATE
router.put("/:id", auth, ctrl.updateBudget);

// ✅ DELETE
router.delete("/:id", auth, ctrl.deleteBudget);

module.exports = router;