const router = require("express").Router();
const ctrl = require("../controllers/transferController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, ctrl.createTransfer);
router.post("/:id/reverse", auth, ctrl.reverseTransfer);

module.exports = router;