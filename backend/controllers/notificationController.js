const db = require("../config/database");

// GET notifications
const getAllNotifications = async (req, res) => {
  try {
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
      ORDER BY created_at DESC
      LIMIT 50
      `
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
      WHERE expires_at > NOW()
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
    const notificationId = req.params.id;

    const [result] = await db.promise().query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ?
      `,
      [notificationId]
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

    await db.promise().query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE  is_read = FALSE
        AND expires_at > NOW()
      `
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

// DELETE single notification
const deleteNotification = async (req, res) => {
  try {
   const notificationId = req.params.id;
    console.log(notificationId)

    const [result] = await db.promise().query(
      `
      DELETE FROM notifications
      WHERE id = ?
      `,
      [notificationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      deleted: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};



module.exports = {
  getAllNotifications,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
