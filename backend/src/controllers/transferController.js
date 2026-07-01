const transferService = require("../services/transferService");

exports.createTransfer = async (req, res) => {
  try {
    const result = await transferService.createTransfer(
      req.user.user_id,
      req.body
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.reverseTransfer = async (req, res) => {
  try {
    const result = await transferService.reverseTransfer(
      req.user.user_id,
      req.params.id
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};