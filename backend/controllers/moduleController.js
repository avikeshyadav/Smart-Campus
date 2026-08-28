const db = require("../config/database.js");
const { createNotification } = require("../config/notificationConfig.js");


// =====================================================
// Helper: Create notification without blocking response
// =====================================================
const sendNotification = async ({
  userId,
  type,
  title,
  message,
  entityType = null,
  entityId = null,
  metadata = null,
}) => {
  try {
    if (!userId) {
      console.warn("Notification skipped: userId not found");
      return;
    }

    await createNotification({
      userId,
      type,
      title,
      message,
      entityType,
      entityId,
      metadata,
    });
  } catch (error) {
    // Notification failure should not break the main operation
    console.error("Notification creation failed:", error);
  }
};


// =====================================================
// Get Dashboard Modules
// =====================================================
async function getModules(req, res) {
  const query = `
    SELECT
      id,
      parent_id,
      label,
      description,
      icon,
      path,
      is_active,
      is_visible,
      sort_order
    FROM dashboard_menu
    WHERE is_visible = 1
    ORDER BY sort_order ASC
  `;

  db.query(query, (err, rows) => {
    if (err) {
      console.error("Get modules error:", err);

      return res.status(500).json({
        success: false,
        message: "Database Error",
        error: err.message,
      });
    }

    // Parent menus
    const parents = rows
      .filter((row) => row.parent_id === null)
      .map((parent) => ({
        ...parent,
        children: rows.filter(
          (child) => child.parent_id === parent.id
        ),
      }));

    return res.status(200).json({
      success: true,
      data: parents,
    });
  });
}


// =====================================================
// Add Dashboard Module
// =====================================================
async function addModule(req, res) {
  const {
    parent_id,
    label,
    description,
    path,
    icon,
    is_active,
    is_visible,
    sort_order,
  } = req.body;

  if (!label || !path) {
    return res.status(400).json({
      success: false,
      message: "Label and path are required",
    });
  }

  const sql = `
    INSERT INTO dashboard_menu
    (
      parent_id,
      label,
      description,
      path,
      icon,
      is_active,
      is_visible,
      sort_order
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      parent_id || null,
      label,
      description || null,
      path,
      icon || null,
      is_active ?? 1,
      is_visible ?? 1,
      sort_order ?? 0,
    ],
    async (err, result) => {
      if (err) {
        console.error("Add module error:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to add module",
          error: err.message,
        });
      }

      // ==========================================
      // Create Notification
      // ==========================================
      await sendNotification({
        userId: req.user?.userId,
        type: "MODULE_CREATED",
        title: "New Module",
        message: `${label} module was created successfully.`,
        entityType: "dashboard_menu",
        entityId: result.insertId,
        metadata: {
          moduleId: result.insertId,
          label,
          path,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Module Added",
        id: result.insertId,
      });
    }
  );
}


// =====================================================
// Update Dashboard Module
// =====================================================
async function updateModule(req, res) {
  const { id } = req.params;

  const {
    parent_id,
    label,
    description,
    path,
    icon,
    is_active,
    is_visible,
    sort_order,
  } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Module ID is required",
    });
  }

  if (!label || !path) {
    return res.status(400).json({
      success: false,
      message: "Label and path are required",
    });
  }

  const sql = `
    UPDATE dashboard_menu
    SET
      parent_id = ?,
      label = ?,
      description = ?,
      path = ?,
      icon = ?,
      is_active = ?,
      is_visible = ?,
      sort_order = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      parent_id || null,
      label,
      description || null,
      path,
      icon || null,
      is_active ?? 1,
      is_visible ?? 1,
      sort_order ?? 0,
      id,
    ],
    async (err, result) => {
      if (err) {
        console.error("Update module error:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to update module",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      // ==========================================
      // Create Notification
      // ==========================================
      await sendNotification({
        userId: req.user?.userId,

        type: "MODULE_UPDATED",

        title: "Module Updated",

        message: `${label} module was updated successfully.`,

        entityType: "dashboard_menu",

        entityId: Number(id),

        metadata: {
          moduleId: Number(id),
          label,
          path,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Module Updated",
      });
    }
  );
}


// =====================================================
// Enable / Disable Module
// =====================================================
async function updateModuleStatus(req, res) {
  const { id } = req.params;
  const { is_active } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Module ID is required",
    });
  }

  if (is_active === undefined) {
    return res.status(400).json({
      success: false,
      message: "is_active is required",
    });
  }

  const sql = `
    UPDATE dashboard_menu
    SET is_active = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [is_active, id],
    async (err, result) => {
      if (err) {
        console.error("Update module status error:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to update module status",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      const statusText =
        Number(is_active) === 1
          ? "enabled"
          : "disabled";

      // ==========================================
      // Create Notification
      // ==========================================
      await sendNotification({
        userId: req.user?.userId,

        type:
          Number(is_active) === 1
            ? "MODULE_ENABLED"
            : "MODULE_DISABLED",

        title:
          Number(is_active) === 1
            ? "Module Enabled"
            : "Module Disabled",

        message: `Module #${id} was ${statusText}.`,

        entityType: "dashboard_menu",

        entityId: Number(id),

        metadata: {
          moduleId: Number(id),
          isActive: Boolean(Number(is_active)),
        },
      });

      return res.status(200).json({
        success: true,
        message: "Status Updated",
      });
    }
  );
}


// =====================================================
// Delete Dashboard Module
// =====================================================
async function deleteModule(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Module ID is required",
    });
  }

  console.log("Deleting module:", id);

  // ==========================================
  // First delete child modules
  // ==========================================
  db.query(
    "DELETE FROM dashboard_menu WHERE parent_id = ?",
    [id],
    (childErr, childResult) => {
      if (childErr) {
        console.error(
          "Delete child modules error:",
          childErr
        );

        return res.status(500).json({
          success: false,
          message: "Failed to delete child modules",
          error: childErr.message,
        });
      }

      console.log(
        "Child modules deleted:",
        childResult.affectedRows
      );

      // ==========================================
      // Then delete parent module
      // ==========================================
      db.query(
        "DELETE FROM dashboard_menu WHERE id = ?",
        [id],
        async (err, result) => {
          if (err) {
            console.error("Delete module error:", err);

            return res.status(500).json({
              success: false,
              message: "Failed to delete module",
              error: err.message,
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "Module not found",
            });
          }

          // ==========================================
          // Create Notification
          // ==========================================
          await sendNotification({
            userId: req.user?.userId,

            type: "MODULE_DELETED",

            title: "Module Deleted",

            message: `Module #${id} was deleted successfully.`,

            entityType: "dashboard_menu",

            entityId: Number(id),

            metadata: {
              moduleId: Number(id),
              deletedChildren: childResult.affectedRows,
            },
          });

          return res.status(200).json({
            success: true,
            message: "Module Deleted",
          });
        }
      );
    }
  );
}


// =====================================================
// Export Controllers
// =====================================================
module.exports = {
  getModules,
  addModule,
  updateModule,
  updateModuleStatus,
  deleteModule,
};
