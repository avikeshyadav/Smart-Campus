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
        type: "SUCCESS",
        title: "MODULE_CREATED",
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
        type: "SUCCESS",
        title: "MODULE_UPDATED",
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
// Change Dashboard Module Order
// =====================================================
async function changeModuleOrder(req, res) {
  const { id } = req.params;
  const { direction } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Module ID is required",
    });
  }

  if (!["up", "down"].includes(direction)) {
    return res.status(400).json({
      success: false,
      message: "Direction must be up or down",
    });
  }

  try {
    // -------------------------------------------------
    // Get current module
    // -------------------------------------------------
    const currentModule = await new Promise((resolve, reject) => {
      db.query(
        `
        SELECT id, parent_id, sort_order, label
        FROM dashboard_menu
        WHERE id = ?
        `,
        [id],
        (err, rows) => {
          if (err) return reject(err);

          if (!rows.length) {
            return resolve(null);
          }

          resolve(rows[0]);
        }
      );
    });

    if (!currentModule) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // -------------------------------------------------
    // Find neighbour
    //
    // Same parent_id means:
    // Parent modules reorder with parent modules
    // Child modules reorder only with same parent
    // -------------------------------------------------
    let neighbour;

    if (direction === "up") {
      neighbour = await new Promise((resolve, reject) => {
        db.query(
          `
          SELECT id, sort_order, label
          FROM dashboard_menu
          WHERE
            (
              parent_id = ?
              OR (parent_id IS NULL AND ? IS NULL)
            )
            AND sort_order < ?
          ORDER BY sort_order DESC, id DESC
          LIMIT 1
          `,
          [
            currentModule.parent_id,
            currentModule.parent_id,
            currentModule.sort_order,
          ],
          (err, rows) => {
            if (err) return reject(err);
            resolve(rows[0] || null);
          }
        );
      });
    } else {
      neighbour = await new Promise((resolve, reject) => {
        db.query(
          `
          SELECT id, sort_order, label
          FROM dashboard_menu
          WHERE
            (
              parent_id = ?
              OR (parent_id IS NULL AND ? IS NULL)
            )
            AND sort_order > ?
          ORDER BY sort_order ASC, id ASC
          LIMIT 1
          `,
          [
            currentModule.parent_id,
            currentModule.parent_id,
            currentModule.sort_order,
          ],
          (err, rows) => {
            if (err) return reject(err);
            resolve(rows[0] || null);
          }
        );
      });
    }

    // -------------------------------------------------
    // Already first / last
    // -------------------------------------------------
    if (!neighbour) {
      return res.status(200).json({
        success: true,
        message:
          direction === "up"
            ? "Module is already at the top"
            : "Module is already at the bottom",
      });
    }

    // -------------------------------------------------
    // Swap sort_order
    // -------------------------------------------------
    await new Promise((resolve, reject) => {
      db.query(
        `
        UPDATE dashboard_menu
        SET sort_order = ?
        WHERE id = ?
        `,
        [neighbour.sort_order, currentModule.id],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.query(
        `
        UPDATE dashboard_menu
        SET sort_order = ?
        WHERE id = ?
        `,
        [currentModule.sort_order, neighbour.id],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // -------------------------------------------------
    // Notification
    // -------------------------------------------------
    await sendNotification({
      userId: req.user?.userId,
      type: "SUCCESS",
      title: "MODULE_ORDER_CHANGED",
      message: `${currentModule.label} module was moved ${direction}.`,
      entityType: "dashboard_menu",
      entityId: Number(currentModule.id),
      metadata: {
        moduleId: Number(currentModule.id),
        direction,
        neighbourId: Number(neighbour.id),
      },
    });

    return res.status(200).json({
      success: true,
      message:
        direction === "up"
          ? "Module moved up"
          : "Module moved down",
    });
  } catch (error) {
    console.error("Change module order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change module order",
      error: error.message,
    });
  }
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
            type: "SUCCESS",
            title: "MODULE_DELETED",
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
  changeModuleOrder,
  updateModuleStatus,
  deleteModule,
};
