const router = require("express").Router();
const ctrl = require("../controllers/walletController");
const auth = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

// CREATE
router.post("/", auth,
  [
    body("wallet_name").trim().notEmpty().withMessage("Tên ví không được để trống"),
    body("wallet_type").trim().notEmpty().withMessage("Loại ví không được để trống"),
  ],
  validate, ctrl.createWallet);

// GET
router.get("/", auth, ctrl.getWallets);
router.get("/:id", auth, ctrl.getWalletById);

// UPDATE
router.put("/:id", auth,
  [
    body("wallet_name").trim().notEmpty().withMessage("Tên ví không được để trống"),
  ],
  validate, ctrl.updateWallet);

// CLOSE
router.post("/:id/close", auth, ctrl.closeWallet);

// OPEN
router.post("/:id/open", auth, ctrl.openWallet);

module.exports = router;