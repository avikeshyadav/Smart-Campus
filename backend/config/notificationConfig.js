const db = require("../config/database");

const createNotification = async ({
  userId,
  type,
  title,
  message,
  entityType = null,
  entityId = null,
  metadata = null,
}) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [result] = await db.query(
    `
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      entity_type,
      entity_id,
      metadata,
      is_read,
      created_at,
      expires_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, NOW(), ?)
    `,
    [
      userId,
      type,
      title,
      message,
      entityType,
      entityId,
      metadata ? JSON.stringify(metadata) : null,
      expiresAt,
    ]
  );

  return result.insertId;
};

module.exports = {
  createNotification,
};
