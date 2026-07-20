const db =
  require("../config/db");

exports.getUsers =
async (req, res) => {

  try {
    const [users] = await db.query(
        `SELECT user_id, full_name, email, role, created_at
        FROM Users`
      );

    res.json({
      data: users
    });

  } catch (err) {
    res.status(500).json({
      message:
        "Failed to get users"
    });

  }

};