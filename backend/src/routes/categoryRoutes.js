const router = require("express").Router();
const ctrl = require("../controllers/categoryController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, ctrl.getCategories);
router.post("/", auth, ctrl.createCategory);
router.put("/:id", auth, ctrl.updateCategory);
router.delete("/:id", auth, ctrl.deleteCategory);

module.exports = router;