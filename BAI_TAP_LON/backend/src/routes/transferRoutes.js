const router = require("express").Router();
const ctrl = require("../controllers/transferController");
const auth = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

router.post("/", auth, [
    body("amount").isFloat({ min: 1 }).withMessage("Số tiền phải là số dương")
], validate, ctrl.createTransfer);
router.post("/:id/reverse", auth, ctrl.reverseTransfer);

module.exports = router;