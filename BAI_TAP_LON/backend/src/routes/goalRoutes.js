const router = require("express").Router();
const ctrl = require("../controllers/goalController");
const auth = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

router.get("/", auth, ctrl.getGoals);
router.post("/", auth, [
    body("goal_name").notEmpty().withMessage("Tên mục tiêu không được để trống"),
    body("target_amount").isFloat({ min: 1 }).withMessage("Số tiền mục tiêu phải là số dương")
], validate, ctrl.createGoal);
router.put("/:id", auth, ctrl.updateGoal);
router.delete("/:id", auth, ctrl.deleteGoal);

module.exports = router;