const router = require("express").Router();
const ctrl = require("../controllers/goalController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, ctrl.getGoals);
router.post("/", auth, ctrl.createGoal);
router.put("/:id", auth, ctrl.updateGoal);
router.delete("/:id", auth, ctrl.deleteGoal);

module.exports = router;