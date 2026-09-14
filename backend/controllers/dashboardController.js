const db = require("../config/database.js");

const clean = (v) =>
  v === undefined ||
  v === null ||
  String(v).trim() === ""
    ? null
    : String(v).trim();

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const one = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0] || null;
};

const sendError = (
  res,
  error,
  message = "Internal server error"
) => {
  console.error(message, error);

  return res.status(500).json({
    success: false,
    message,
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : undefined,
  });
};


// ============================================================
// DASHBOARD
// GET /api/dashboard
// ============================================================

const getDashboardData = async (req, res) => {
  try {
    const campusId = clean(req.query?.campus_id);
    const campusFilter = campusId
      ? "WHERE h.campus_id = ?"
      : "";

    const campusAnd = campusId
      ? "AND h.campus_id = ?"
      : "";

    const sql = `
      SELECT

        /* =========================
           STUDENTS
        ========================== */

        (
          SELECT COUNT(*)
          FROM students s
          ${
            campusId
              ? "WHERE s.campus_id = ?"
              : ""
          }
        ) AS total_students,


        /* =========================
           HOSTELS
        ========================== */

        (
          SELECT COUNT(*)
          FROM hostels h
          ${campusFilter}
        ) AS total_hostels,


        /* =========================
           FLOORS
        ========================== */

        (
          SELECT COUNT(*)
          FROM hostel_floors f
          JOIN hostels h
            ON h.id = f.hostel_id
          ${
            campusId
              ? "WHERE h.campus_id = ?"
              : ""
          }
        ) AS total_floors,


        /* =========================
           ROOMS
        ========================== */

        (
          SELECT COUNT(*)
          FROM hostel_rooms r
          JOIN hostel_floors f
            ON f.id = r.floor_id
          JOIN hostels h
            ON h.id = f.hostel_id
          ${
            campusId
              ? "WHERE h.campus_id = ?"
              : ""
          }
        ) AS total_rooms,


        /* =========================
           BEDS
        ========================== */

        (
          SELECT COALESCE(SUM(r.total_beds), 0)
          FROM hostel_rooms r
          JOIN hostel_floors f
            ON f.id = r.floor_id
          JOIN hostels h
            ON h.id = f.hostel_id
          ${
            campusId
              ? "WHERE h.campus_id = ?"
              : ""
          }
        ) AS total_beds,


        /* =========================
           OCCUPIED BEDS
        ========================== */

        (
          SELECT COUNT(*)
          FROM hostel_beds b
          JOIN hostel_rooms r
            ON r.id = b.room_id
          JOIN hostel_floors f
            ON f.id = r.floor_id
          JOIN hostels h
            ON h.id = f.hostel_id
          WHERE b.status = 'Occupied'
          ${
            campusId
              ? "AND h.campus_id = ?"
              : ""
          }
        ) AS occupied_beds,


        /* =========================
           AVAILABLE BEDS
        ========================== */

        (
          SELECT COUNT(*)
          FROM hostel_beds b
          JOIN hostel_rooms r
            ON r.id = b.room_id
          JOIN hostel_floors f
            ON f.id = r.floor_id
          JOIN hostels h
            ON h.id = f.hostel_id
          WHERE b.status = 'Available'
          
        ) AS available_beds,


        /* =========================
           MAINTENANCE ROOMS
        ========================== */

        (
          SELECT COUNT(*)
          FROM hostel_rooms r
          JOIN hostel_floors f
            ON f.id = r.floor_id
          JOIN hostels h
            ON h.id = f.hostel_id
          WHERE r.status = 'Maintenance'
          ${
            campusId
              ? "AND h.campus_id = ?"
              : ""
          }
        ) AS maintenance_rooms,


        /* =========================
           PENDING ROOM CHANGES
        ========================== */

        (
          SELECT COUNT(*)
          FROM hostel_room_change_requests rc
          JOIN hostel_rooms r
            ON r.id = rc.current_room_id
          JOIN hostel_floors f
            ON f.id = r.floor_id
          JOIN hostels h
            ON h.id = f.hostel_id
          WHERE rc.status = 'Pending'
          ${
            campusId
              ? "AND h.campus_id = ?"
              : ""
          }
        ) AS pending_changes,


        /* =========================
           OPEN MAINTENANCE
        ========================== */

        (
          SELECT COUNT(*)
          FROM hostel_maintenance m
          JOIN hostel_rooms r
            ON r.id = m.room_id
          JOIN hostel_floors f
            ON f.id = r.floor_id
          JOIN hostels h
            ON h.id = f.hostel_id
          WHERE m.status IN ('Open', 'In Progress')
          ${
            campusId
              ? "AND h.campus_id = ?"
              : ""
          }
        ) AS open_maintenance

    `;


    const params = campusId
      ? Array(10).fill(campusId)
      : [];

    const data = await one(sql, params);


    if (!data) {
      return res.status(200).json({
        success: true,
        overview: {
          totalStudents: 0,
          totalHostels: 0,
          totalFloors: 0,
          totalRooms: 0,
          totalBeds: 0,
          occupiedBeds: 0,
          availableBeds: 0,
          maintenanceRooms: 0,
          pendingChanges: 0,
          openMaintenance: 0,
        },
      });
    }


    return res.status(200).json({
      success: true,
      overview: {
        totalStudents: Number(data.total_students || 0),
        totalHostels: Number(data.total_hostels || 0),
        totalFloors: Number(data.total_floors || 0),
        totalRooms: Number(data.total_rooms || 0),
        totalBeds: Number(data.total_beds || 0),
        occupiedBeds: Number(data.occupied_beds || 0),
        availableBeds: Number(data.available_beds || 0),
        maintenanceRooms: Number(data.maintenance_rooms || 0),
        pendingChanges: Number(data.pending_changes || 0),
        openMaintenance: Number(data.open_maintenance || 0),
        // totalPresentToday: Number(data.present) || 0,
      },
    });


  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to fetch dashboard data"
    );
  }
};


module.exports = {
  getDashboardData,
};