const router = require("express").Router();
const ctrl = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

router.post("/register", [
    body("full_name").notEmpty().withMessage("Họ tên không được để trống"),
    body("email").isEmail().withMessage("Email không hợp lệ").normalizeEmail(),
    body("password").isLength({ min: 5 }).withMessage("Mật khẩu phải có ít nhất 5 ký tự")
], validate, ctrl.register);
router.post("/login", [
    body("email").isEmail().withMessage("Email không hợp lệ").normalizeEmail(),
    body("password").notEmpty().withMessage("Mật khẩu không được để trống")
], validate, ctrl.login);

// ✅ NEW
router.get("/me", auth, ctrl.me);
router.post("/refresh", ctrl.refreshToken);
router.post("/logout", ctrl.logout);

module.exports = router;