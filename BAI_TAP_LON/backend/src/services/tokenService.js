const jwt = require("jsonwebtoken");

// ✅ Access token (ngắn hạn)
exports.generateAccessToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// ✅ Refresh token (dài hạn)
exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};