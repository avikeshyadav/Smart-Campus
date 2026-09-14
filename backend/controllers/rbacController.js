const db = require("../config/database");


/**
 * Check whether a user has an active Super Admin role.
 */
async function isSuperAdmin(userId) {
  const [rows] = await db.promise().query(
    `
      SELECT 1
      FROM user_roles ur
      INNER JOIN roles r
        ON r.id = ur.role_id
      WHERE ur.user_id = ?
        AND r.slug = 'super_admin'
        AND r.is_active = TRUE
      LIMIT 1
    `,
    [userId]
  );

  return rows.length > 0;
}

/**
 * Get complete RBAC information of a user.
 */
async function getUserRbac(userId) {
  const [roles] = await db.promise().query(
    `
      SELECT
        r.id,
        r.name,
        r.slug,
        r.description,
        r.is_system_role,
        r.is_active
      FROM user_roles ur
      INNER JOIN roles r
        ON r.id = ur.role_id
      WHERE ur.user_id = ?
        AND r.is_active = TRUE
      ORDER BY r.name
    `,
    [userId]
  );

  const [permissions] = await db.promise().query(
    `
      SELECT DISTINCT
        p.id,
        p.name,
        p.slug,
        p.module,
        p.action,
        p.description
      FROM user_roles ur
      INNER JOIN roles r
        ON r.id = ur.role_id
       AND r.is_active = TRUE
      INNER JOIN role_permissions rp
        ON rp.role_id = r.id
      INNER JOIN permissions p
        ON p.id = rp.permission_id
      WHERE ur.user_id = ?
      ORDER BY p.module, p.name
    `,
    [userId]
  );

  const superAdmin = roles.some(
    (role) => role.slug === "super_admin"
  );
  return {
    roles,
    permissions: permissions.map((permission) => permission.slug),
    permissionDetails: permissions,
    isSuperAdmin: superAdmin,
  };
}

/*
|--------------------------------------------------------------------------
| RBAC ME
|--------------------------------------------------------------------------
*/

async function me(req, res) {
  try {
    const userId = req.user?.userId;
 
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rbac = await getUserRbac(userId);

    return res.json({
      success: true,
      user: rbac,
    });
  } catch (error) {
    console.error("RBAC me error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load RBAC profile",
    });
  }
}

/*
|--------------------------------------------------------------------------
| RBAC SUMMARY
|--------------------------------------------------------------------------
*/

async function summary(req, res) {
  try {
    const [[users]] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM users"
    );

    const [[roles]] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM roles WHERE is_active = TRUE"
    );

    const [[permissions]] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM permissions"
    );

    const [[superAdmins]] = await db.promise().query(`
      SELECT COUNT(DISTINCT ur.user_id) AS total
      FROM user_roles ur
      INNER JOIN roles r
        ON r.id = ur.role_id
      WHERE r.slug = 'super_admin'
        AND r.is_active = TRUE
    `);

    return res.json({
      success: true,
      summary: {
        users: Number(users.total),
        roles: Number(roles.total),
        permissions: Number(permissions.total),
        superAdmins: Number(superAdmins.total),
      },
    });
  } catch (error) {
    console.error("RBAC summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load RBAC summary",
    });
  }
}

/*
|--------------------------------------------------------------------------
| ROLES
|--------------------------------------------------------------------------
*/

async function listRoles(req, res) {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        r.*,
        COUNT(DISTINCT ur.user_id) AS user_count,
        COUNT(DISTINCT rp.permission_id) AS permission_count
      FROM roles r
      LEFT JOIN user_roles ur
        ON ur.role_id = r.id
      LEFT JOIN role_permissions rp
        ON rp.role_id = r.id
      GROUP BY r.id
      ORDER BY r.is_system_role DESC, r.name
    `);

    return res.json({
      success: true,
      roles: rows,
    });
  } catch (error) {
    console.error("listRoles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load roles",
    });
  }
}

async function createRole(req, res) {
  const { name, slug, description, is_active = true } = req.body;

  if (!name?.trim() || !slug?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Name and slug are required",
    });
  }

  const cleanName = name.trim();
  const cleanSlug = slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  try {
    const [result] = await db.promise().query(
      `
        INSERT INTO roles
          (
            name,
            slug,
            description,
            is_active,
            is_system_role,
            created_by
          )
        VALUES (?, ?, ?, ?, FALSE, ?)
      `,
      [
        cleanName,
        cleanSlug,
        description?.trim() || null,
        !!is_active,
        req.user.userId,
      ]
    );

    const [rows] = await db.promise().query(
      "SELECT * FROM roles WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      role: rows[0],
    });
  } catch (error) {
    console.error("createRole error:", error);

    return res.status(
      error.code === "ER_DUP_ENTRY" ? 409 : 500
    ).json({
      success: false,
      message:
        error.code === "ER_DUP_ENTRY"
          ? "Role name or slug already exists"
          : "Failed to create role",
    });
  }
}

async function updateRole(req, res) {
  const id = Number(req.params.id);

  const {
    name,
    slug,
    description,
    is_active,
  } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid role ID",
    });
  }

  try {
    const [existingRows] = await db.promise().query(
      "SELECT * FROM roles WHERE id = ?",
      [id]
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const existing = existingRows[0];

    const cleanSlug =
      slug !== undefined && slug !== null
        ? slug.trim().toLowerCase().replace(/\s+/g, "_")
        : null;

    // System roles cannot be renamed or disabled.
    if (
      existing.is_system_role &&
      (
        (cleanSlug && cleanSlug !== existing.slug) ||
        is_active === false
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "System role cannot be disabled or renamed",
      });
    }

    await db.promise().query(
      `
        UPDATE roles
        SET
          name = COALESCE(?, name),
          slug = COALESCE(?, slug),
          description = ?,
          is_active = COALESCE(?, is_active)
        WHERE id = ?
      `,
      [
        name?.trim() || null,
        cleanSlug || null,
        description !== undefined
          ? description?.trim() || null
          : existing.description,
        is_active === undefined
          ? null
          : !!is_active,
        id,
      ]
    );

    const [rows] = await db.promise().query(
      "SELECT * FROM roles WHERE id = ?",
      [id]
    );

    return res.json({
      success: true,
      role: rows[0],
    });
  } catch (error) {
    console.error("updateRole error:", error);

    return res.status(
      error.code === "ER_DUP_ENTRY" ? 409 : 500
    ).json({
      success: false,
      message:
        error.code === "ER_DUP_ENTRY"
          ? "Role name or slug already exists"
          : "Failed to update role",
    });
  }
}

async function deleteRole(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid role ID",
    });
  }

  try {
    const [rows] = await db.promise().query(
      "SELECT is_system_role, slug FROM roles WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    if (
      rows[0].is_system_role ||
      rows[0].slug === "super_admin"
    ) {
      return res.status(400).json({
        success: false,
        message: "System roles cannot be deleted",
      });
    }

    await db.promise().query(
      "DELETE FROM roles WHERE id = ?",
      [id]
    );

    return res.json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("deleteRole error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete role",
    });
  }
}

/*
|--------------------------------------------------------------------------
| PERMISSIONS
|--------------------------------------------------------------------------
*/

async function listPermissions(req, res) {
  try {
    const [rows] = await db.promise().query(
      `
        SELECT *
        FROM permissions
        ORDER BY module, name
      `
    );

    return res.json({
      success: true,
      permissions: rows,
    });
  } catch (error) {
    console.error("listPermissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load permissions",
    });
  }
}

async function createPermission(req, res) {
  const {
    name,
    slug,
    module,
    action,
    description,
  } = req.body;

  if (
    !name?.trim() ||
    !slug?.trim() ||
    !module?.trim() ||
    !action?.trim()
  ) {
    return res.status(400).json({
      success: false,
      message:
        "name, slug, module and action are required",
    });
  }

  try {
    const [result] = await db.promise().query(
      `
        INSERT INTO permissions
          (
            name,
            slug,
            module,
            action,
            description
          )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        name.trim(),
        slug.trim().toLowerCase(),
        module.trim(),
        action.trim(),
        description?.trim() || null,
      ]
    );

    const [rows] = await db.promise().query(
      "SELECT * FROM permissions WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      permission: rows[0],
    });
  } catch (error) {
    console.error("createPermission error:", error);

    return res.status(
      error.code === "ER_DUP_ENTRY" ? 409 : 500
    ).json({
      success: false,
      message:
        error.code === "ER_DUP_ENTRY"
          ? "Permission already exists"
          : "Failed to create permission",
    });
  }
}

async function updatePermission(req, res) {
  const id = Number(req.params.id);

  const {
    name,
    slug,
    module,
    action,
    description,
  } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid permission ID",
    });
  }

  try {
    const [rows] = await db.promise().query(
      "SELECT id FROM permissions WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    await db.promise().query(
      `
        UPDATE permissions
        SET
          name = COALESCE(?, name),
          slug = COALESCE(?, slug),
          module = COALESCE(?, module),
          action = COALESCE(?, action),
          description = ?
        WHERE id = ?
      `,
      [
        name?.trim() || null,
        slug?.trim().toLowerCase() || null,
        module?.trim() || null,
        action?.trim() || null,
        description !== undefined
          ? description?.trim() || null
          : null,
        id,
      ]
    );

    const [updated] = await db.promise().query(
      "SELECT * FROM permissions WHERE id = ?",
      [id]
    );

    return res.json({
      success: true,
      permission: updated[0],
    });
  } catch (error) {
    console.error("updatePermission error:", error);

    return res.status(
      error.code === "ER_DUP_ENTRY" ? 409 : 500
    ).json({
      success: false,
      message:
        error.code === "ER_DUP_ENTRY"
          ? "Permission already exists"
          : "Failed to update permission",
    });
  }
}

async function deletePermission(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid permission ID",
    });
  }

  try {
    const [rows] = await db.promise().query(
      "SELECT id FROM permissions WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    await db.promise().query(
      "DELETE FROM permissions WHERE id = ?",
      [id]
    );

    return res.json({
      success: true,
      message: "Permission deleted successfully",
    });
  } catch (error) {
    console.error("deletePermission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete permission",
    });
  }
}

/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

async function listUsers(req, res) {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.job_title,
        u.is_verified,
        GROUP_CONCAT(
          DISTINCT r.name
          ORDER BY r.name
          SEPARATOR ', '
        ) AS roles,
        GROUP_CONCAT(
          DISTINCT r.slug
          ORDER BY r.slug
          SEPARATOR ','
        ) AS role_slugs
      FROM users u
      LEFT JOIN user_roles ur
        ON ur.user_id = u.id
      LEFT JOIN roles r
        ON r.id = ur.role_id
      GROUP BY u.id
      ORDER BY u.name
    `);

    return res.json({
      success: true,
      users: rows,
    });
  } catch (error) {
    console.error("listUsers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load users",
    });
  }
}

async function getUserRoles(req, res) {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  try {
    const [rows] = await db.promise().query(
      `
        SELECT
          r.id,
          r.name,
          r.slug,
          r.description,
          r.is_system_role,
          r.is_active
        FROM user_roles ur
        INNER JOIN roles r
          ON r.id = ur.role_id
        WHERE ur.user_id = ?
        ORDER BY r.name
      `,
      [userId]
    );

    return res.json({
      success: true,
      roles: rows,
    });
  } catch (error) {
    console.error("getUserRoles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load user roles",
    });
  }
}

/*
|--------------------------------------------------------------------------
| ASSIGN USER ROLES
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This project currently uses db.promise() from a single MySQL
| connection. Therefore:
|
|   db.promise()       -> PromiseConnection
|   conn.release()     -> DO NOT USE
|
| We use beginTransaction/commit/rollback on the same connection.
|--------------------------------------------------------------------------
*/

async function assignUserRoles(req, res) {
  const userId = Number(req.params.id);

  const roleIds = Array.isArray(req.body.roleIds)
    ? [
        ...new Set(
          req.body.roleIds
            .map(Number)
            .filter(
              (id) =>
                Number.isInteger(id) && id > 0
            )
        ),
      ]
    : [];

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  const conn = db.promise();
  let transactionStarted = false;

  try {
    // Check user.
    const [users] = await conn.query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate requested roles.
    let roles = [];

    if (roleIds.length > 0) {
      const [roleRows] = await conn.query(
        `
          SELECT
            id,
            slug,
            is_system_role
          FROM roles
          WHERE id IN (?)
            AND is_active = TRUE
        `,
        [roleIds]
      );

      roles = roleRows;

      const validIds = new Set(
        roleRows.map((role) => Number(role.id))
      );

      const hasInvalidRole = roleIds.some(
        (id) => !validIds.has(id)
      );

      if (hasInvalidRole) {
        return res.status(400).json({
          success: false,
          message:
            "One or more roles are invalid or inactive",
        });
      }
    }

    // Check current Super Admin status.
    const [currentSuper] = await conn.query(
      `
        SELECT COUNT(*) AS total
        FROM user_roles ur
        INNER JOIN roles r
          ON r.id = ur.role_id
        WHERE ur.user_id = ?
          AND r.slug = 'super_admin'
      `,
      [userId]
    );

    const isCurrentlySuperAdmin =
      Number(currentSuper[0].total) > 0;

    const keepsSuperAdmin = roles.some(
      (role) => role.slug === "super_admin"
    );

    // A Super Admin cannot remove its own Super Admin role.
    if (
      isCurrentlySuperAdmin &&
      !keepsSuperAdmin
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Super Admin cannot be removed from itself",
      });
    }

    // Start transaction.
    await conn.beginTransaction();
    transactionStarted = true;

    // Remove old assignments.
    await conn.query(
      "DELETE FROM user_roles WHERE user_id = ?",
      [userId]
    );

    // Add new assignments.
    if (roleIds.length > 0) {
      const values = roleIds.map((roleId) => [
        userId,
        roleId,
      ]);

      await conn.query(
        `
          INSERT INTO user_roles
            (user_id, role_id)
          VALUES ?
        `,
        [values]
      );
    }

    // Commit.
    await conn.commit();
    transactionStarted = false;

    // Get updated RBAC.
    const updatedRbac =
      await getUserRbac(userId);

    return res.json({
      success: true,
      message: "User roles updated successfully",
      rbac: updatedRbac,
    });
  } catch (error) {
    console.error(
      "assignUserRoles error:",
      error
    );

    if (transactionStarted) {
      try {
        await conn.rollback();
      } catch (rollbackError) {
        console.error(
          "assignUserRoles rollback error:",
          rollbackError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to assign roles",
      error: error.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| ROLE PERMISSIONS
|--------------------------------------------------------------------------
*/

async function getRolePermissions(req, res) {
  const roleId = Number(req.params.id);

  if (!Number.isInteger(roleId) || roleId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid role ID",
    });
  }

  try {
    const [role] = await db.promise().query(
      `
        SELECT
          id,
          name,
          slug,
          is_system_role,
          is_active
        FROM roles
        WHERE id = ?
      `,
      [roleId]
    );

    if (!role.length) { 
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const [rows] = await db.promise().query(
      `
        SELECT
          p.id,
          p.name,
          p.slug,
          p.module,
          p.action,
          p.description
        FROM role_permissions rp
        INNER JOIN permissions p
          ON p.id = rp.permission_id
        WHERE rp.role_id = ?
        ORDER BY p.module, p.name
      `,
      [roleId]
    );

    return res.json({
      success: true,
      role: role[0],
      permissions: rows,
    });
  } catch (error) {
    console.error(
      "getRolePermissions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load role permissions",
    });
  }
}


async function assignRolePermissions(req, res) {
  const roleId = Number(req.params.id);

  const ids = Array.isArray(req.body.permissionIds)
    ? [
        ...new Set(
          req.body.permissionIds
            .map(Number)
            .filter(
              (id) =>
                Number.isInteger(id) && id > 0
            )
        ),
      ]
    : [];

  if (!Number.isInteger(roleId) || roleId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid role ID",
    });
  }

  const conn = db.promise();
  let transactionStarted = false;

  try {
    /*
    |--------------------------------------------------------------------------
    | 1. Check role
    |--------------------------------------------------------------------------
    */

    const [roleRows] = await conn.query(
      `
        SELECT
          id,
          is_system_role,
          slug,
          is_active
        FROM roles
        WHERE id = ?
      `,
      [roleId]
    );

    if (!roleRows.length) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const role = roleRows[0];

    /*
    |--------------------------------------------------------------------------
    | 2. Super Admin
    |--------------------------------------------------------------------------
    |
    | Super Admin automatically has complete access.
    | Do not manually modify its role_permissions.
    |--------------------------------------------------------------------------
    */

    if (role.slug === "super_admin") {
      return res.status(400).json({
        success: false,
        message:
          "Super Admin already has full access",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Validate permission IDs
    |--------------------------------------------------------------------------
    */

    if (ids.length > 0) {
      const [permissionRows] =
        await conn.query(
          `
            SELECT id
            FROM permissions
            WHERE id IN (?)
          `,
          [ids]
        );

      const validIds = new Set(
        permissionRows.map(
          (permission) =>
            Number(permission.id)
        )
      );

      const invalidPermission = ids.some(
        (permissionId) =>
          !validIds.has(permissionId)
      );

      if (invalidPermission) {
        return res.status(400).json({
          success: false,
          message:
            "One or more permissions are invalid",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Begin transaction
    |--------------------------------------------------------------------------
    */

    await conn.beginTransaction();
    transactionStarted = true;

    /*
    |--------------------------------------------------------------------------
    | 5. Delete old permissions
    |--------------------------------------------------------------------------
    */

    await conn.query(
      `
        DELETE FROM role_permissions
        WHERE role_id = ?
      `,
      [roleId]
    );

    /*
    |--------------------------------------------------------------------------
    | 6. Insert new permissions
    |--------------------------------------------------------------------------
    */

    if (ids.length > 0) {
      const values = ids.map(
        (permissionId) => [
          roleId,
          permissionId,
        ]
      );

      await conn.query(
        `
          INSERT INTO role_permissions
            (role_id, permission_id)
          VALUES ?
        `,
        [values]
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 7. Commit
    |--------------------------------------------------------------------------
    */

    await conn.commit();
    transactionStarted = false;

    /*
    |--------------------------------------------------------------------------
    | 8. Return updated permissions
    |--------------------------------------------------------------------------
    */

    const [updatedPermissions] =
      await conn.query(
        `
          SELECT
            p.id,
            p.name,
            p.slug,
            p.module,
            p.action,
            p.description
          FROM role_permissions rp
          INNER JOIN permissions p
            ON p.id = rp.permission_id
          WHERE rp.role_id = ?
          ORDER BY p.module, p.name
        `,
        [roleId]
      );

    return res.json({
      success: true,
      message:
        "Role permissions updated successfully",
      roleId,
      permissionIds:
        updatedPermissions.map(
          (permission) =>
            Number(permission.id)
        ),
      permissions: updatedPermissions,
    });
  } catch (error) {
    console.error(
      "assignRolePermissions error:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | Rollback
    |--------------------------------------------------------------------------
    */

    if (transactionStarted) {
      try {
        await conn.rollback();
      } catch (rollbackError) {
        console.error(
          "assignRolePermissions rollback error:",
          rollbackError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to assign permissions",
      error: error.message,
    });
  }

  // IMPORTANT:
  // DO NOT call conn.release()
  //
  // This project uses createConnection().
  // release() is only appropriate for a connection
  // obtained from a MySQL pool using getConnection().
}


/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  me,summary,listRoles,createRole,
  updateRole,deleteRole,listPermissions,createPermission,
  updatePermission,deletePermission,listUsers,getUserRoles,
  assignUserRoles,getRolePermissions,assignRolePermissions,
  getUserRbac,isSuperAdmin,
};