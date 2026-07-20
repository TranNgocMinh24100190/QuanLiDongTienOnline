const router = require("express").Router();

const auth = require("../middleware/authMiddleware");

const authorize = require("../middleware/authorize");

const adminController = require("../controllers/adminController");

router.get("/users", auth, authorize("ADMIN"), adminController.getUsers);

module.exports = router;