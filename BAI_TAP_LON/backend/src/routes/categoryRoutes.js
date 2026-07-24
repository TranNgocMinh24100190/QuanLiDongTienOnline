const router = require("express").Router();
const ctrl = require("../controllers/categoryController");
const auth = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

router.get("/", auth, ctrl.getCategories);

router.post("/", auth,
    [
        body("name").notEmpty().withMessage("Category name is required"),
        body("type")
            .notEmpty()
            .withMessage("Type is required")
            .isIn(["Expense", "Income"])
            .withMessage("Type must be Expense or Income")
    ],
    validate,
    ctrl.createCategory
);

router.put("/:id", auth,
    [
        body("name").optional().notEmpty().withMessage("Category name is required"),
        body("type")
            .optional()
            .isIn(["Expense", "Income"])
            .withMessage("Type must be Expense or Income")
    ],
    validate,
    ctrl.updateCategory
);

router.delete("/:id", auth, ctrl.deleteCategory);

module.exports = router;