const transferService = require("../services/transferService");
const Transfer = require("../models/Transfer");

const serializeTransfer = (payload) => {
  if (!payload) return null;

  const transfer = payload instanceof Transfer ? payload : new Transfer(payload);
  return transfer.toJSON();
};

exports.createTransfer = async (req, res) => {
  try {
    const result = await transferService.createTransfer(
      req.user.user_id,
      req.body
    );

    res.json({
      message: result.message,
      data: serializeTransfer(result.data)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.reverseTransfer = async (req, res) => {
  const transferId = Number(req.params.id);
  if (!Number.isInteger(transferId) || transferId <= 0) {
    return res.status(400).json({ message: "Invalid transfer ID" });
  }

  try {
    const result = await transferService.reverseTransfer(
      req.user.user_id,
      transferId
    );

    res.json({
      message: result.message,
      data: serializeTransfer(result.data)
    });
  } catch (err) {
    res.status(400).json({
      message: err && err.message ? err.message : "Transfer reversal failed"
    });
  }
};