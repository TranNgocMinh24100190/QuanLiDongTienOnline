const router = require("express").Router();
const ctrl = require("../controllers/authController");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);

// ✅ NEW
router.post("/refresh", ctrl.refreshToken);
router.post("/logout", ctrl.logout);

module.exports = router;