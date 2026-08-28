const db = require("../config/database");

// GET notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [notifications] = await db.promise().query(
      `
      SELECT
        id,
        type,
        title,
        message,
        entity_type,
        entity_id,
        metadata,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [userId]
    );
    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};
// Unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await db.promise().query(
      `
      SELECT COUNT(*) AS count
      FROM notifications
      WHERE user_id = ?
        AND is_read = FALSE
        AND expires_at > NOW()
      `,
      [userId]
    );

    res.json({
      success: true,
      count: rows[0].count,
    });
  } catch (error) {
    console.error("Unread count error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
    });
  }
};


// Mark single notification as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;

    const [result] = await db.promise().query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ?
        AND user_id = ?
      `,
      [notificationId, userId]
    );

    res.json({
      success: true,
      updated: result.affectedRows > 0,
    });
  } catch (error) {
    console.error("Mark notification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};


// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await db.promise().query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ?
        AND is_read = FALSE
        AND expires_at > NOW()
      `,
      [userId]
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Mark all notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to mark notifications",
    });
  }
};


module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
