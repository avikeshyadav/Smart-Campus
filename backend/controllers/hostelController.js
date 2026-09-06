const db = require("../config/database.js");

const isValidId = (id) => /^\d+$/.test(String(id));
const clean = (v) => v === undefined || v === null || String(v).trim() === "" ? null : String(v).trim();

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });

const one = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0] || null;
};

const sendError = (res, error, message = "Internal server error") => {
  console.error(message, error);
  return res.status(500).json({ success: false, message, error: error.message });
};

/*
Hierarchy:
Campus -> Hostel -> Floor -> Room -> Bed -> Allocation -> Student

Existing room/bed/allocation/maintenance/change APIs are retained.
New hierarchy APIs are added under /api/hostel.
*/

// ============================================================
// OVERVIEW
// ============================================================
async function overview(req, res) {
  try {
    const campusId = clean(req.query.campus_id);
    const params = campusId ? [campusId] : [];

    const whereHostel = campusId ? " WHERE h.campus_id = ? " : "";
    const whereFloor = campusId ? " WHERE f.hostel_id IN (SELECT id FROM hostels WHERE campus_id = ?) " : "";
    const whereRoom = campusId ? " WHERE r.floor_id IN (SELECT f.id FROM hostel_floors f JOIN hostels h ON h.id=f.hostel_id WHERE h.campus_id = ?) " : "";

    const sql = `
      SELECT
        (SELECT COUNT(*) FROM hostels h ${whereHostel}) AS total_hostels,
        (SELECT COUNT(*) FROM hostel_floors f ${whereFloor}) AS total_floors,
        (SELECT COUNT(*) FROM hostel_rooms r ${whereRoom}) AS total_rooms,
        (SELECT COALESCE(SUM(r.total_beds),0) FROM hostel_rooms r
          JOIN hostel_floors f ON f.id=r.floor_id
          JOIN hostels h ON h.id=f.hostel_id
          ${campusId ? "WHERE h.campus_id = ?" : ""}) AS total_beds,
        (SELECT COUNT(*) FROM hostel_beds b
          JOIN hostel_rooms r ON r.id=b.room_id
          JOIN hostel_floors f ON f.id=r.floor_id
          JOIN hostels h ON h.id=f.hostel_id
          WHERE b.status='Occupied' ${campusId ? "AND h.campus_id = ?" : ""}) AS occupied_beds,
        (SELECT COUNT(*) FROM hostel_beds b
          JOIN hostel_rooms r ON r.id=b.room_id
          JOIN hostel_floors f ON f.id=r.floor_id
          JOIN hostels h ON h.id=f.hostel_id
          WHERE b.status='Available' ${campusId ? "AND h.campus_id = ?" : ""}) AS available_beds,
        (SELECT COUNT(*) FROM hostel_rooms r
          JOIN hostel_floors f ON f.id=r.floor_id
          JOIN hostels h ON h.id=f.hostel_id
          WHERE r.status='Maintenance' ${campusId ? "AND h.campus_id = ?" : ""}) AS maintenance_rooms,
        (SELECT COUNT(*) FROM hostel_room_change_requests rc
          JOIN hostel_rooms r ON r.id=rc.current_room_id
          JOIN hostel_floors f ON f.id=r.floor_id
          JOIN hostels h ON h.id=f.hostel_id
          WHERE rc.status='Pending' ${campusId ? "AND h.campus_id = ?" : ""}) AS pending_changes,
        (SELECT COUNT(*) FROM hostel_maintenance m
          JOIN hostel_rooms r ON r.id=m.room_id
          JOIN hostel_floors f ON f.id=r.floor_id
          JOIN hostels h ON h.id=f.hostel_id
          WHERE m.status IN ('Open','In Progress') ${campusId ? "AND h.campus_id = ?" : ""}) AS open_maintenance
    `;

    // The repeated campus placeholder occurs in each scalar query.
    const p = [];
    for (let i = 0; i < (campusId ? 8 : 0); i++) p.push(campusId);

    const data = await one(sql, p);
    return res.json({
      success: true,
      overview: {
        totalHostel: Number(data.total_hostels || 0),
        totalFloors: Number(data.total_floors || 0),
        totalRooms: Number(data.total_rooms || 0),
        totalBeds: Number(data.total_beds || 0),
        occupiedBeds: Number(data.occupied_beds || 0),
        availableBeds: Number(data.available_beds || 0),
        maintenanceRooms: Number(data.maintenance_rooms || 0),
        pendingChanges: Number(data.pending_changes || 0),
        openMaintenance: Number(data.open_maintenance || 0),
      },
    });
  } catch (e) {
    return sendError(res, e, "Failed to fetch hostel overview");
  }
}

// ============================================================
// HOSTELS
// ============================================================
async function hostels(req, res) {
  try {
    const { campus_id, status, search } = req.query;
    let sql = `
      SELECT
        h.id, h.campus_id, h.name, h.code, h.hostel_type,
        h.total_floors, h.status, h.created_at, h.updated_at,
        COUNT(DISTINCT f.id) AS floor_count,
        COUNT(DISTINCT r.id) AS room_count,
        COALESCE(SUM(r.total_beds),0) AS total_beds,
        COALESCE(SUM(CASE WHEN b.status='Occupied' THEN 1 ELSE 0 END),0) AS occupied_beds,
        COALESCE(SUM(CASE WHEN b.status='Available' THEN 1 ELSE 0 END),0) AS available_beds
      FROM hostels h
      LEFT JOIN hostel_floors f ON f.hostel_id=h.id
      LEFT JOIN hostel_rooms r ON r.floor_id=f.id
      LEFT JOIN hostel_beds b ON b.room_id=r.id
      WHERE 1=1
    `;
    const p = [];
    if (campus_id) { sql += " AND h.campus_id=?"; p.push(campus_id); }
    if (status) { sql += " AND h.status=?"; p.push(status); }
    if (search) {
      sql += " AND (h.name LIKE ? OR h.code LIKE ?)";
      p.push(`%${search}%`, `%${search}%`);
    }
    sql += `
      GROUP BY h.id,h.campus_id,h.name,h.code,h.hostel_type,
               h.total_floors,h.status,h.created_at,h.updated_at
      ORDER BY h.name ASC
    `;
    return res.json({ success: true, hostels: await query(sql, p) });
  } catch (e) { return sendError(res, e, "Failed to fetch hostels"); }
}

async function hostel(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success:false, message:"Invalid hostel ID" });

    const h = await one(`
      SELECT h.id,h.campus_id,h.name,h.code,h.hostel_type,
             h.total_floors,h.status,h.created_at,h.updated_at
      FROM hostels h WHERE h.id=? LIMIT 1
    `, [id]);

    if (!h) return res.status(404).json({ success:false,message:"Hostel not found" });

    const floors = await query(`
      SELECT f.id,f.hostel_id,f.floor_number,f.floor_name,f.created_at,
             COUNT(DISTINCT r.id) AS total_rooms,
             COALESCE(SUM(r.total_beds),0) AS total_beds,
             COALESCE(SUM(CASE WHEN b.status='Occupied' THEN 1 ELSE 0 END),0) AS occupied_beds,
             COALESCE(SUM(CASE WHEN b.status='Available' THEN 1 ELSE 0 END),0) AS available_beds
      FROM hostel_floors f
      LEFT JOIN hostel_rooms r ON r.floor_id=f.id
      LEFT JOIN hostel_beds b ON b.room_id=r.id
      WHERE f.hostel_id=?
      GROUP BY f.id,f.hostel_id,f.floor_number,f.floor_name,f.created_at
      ORDER BY f.floor_number ASC
    `, [id]);

    return res.json({ success:true, hostel:h, floors }); 
  } catch (e) { return sendError(res,e,"Failed to fetch hostel"); }
}

async function createHostel(req, res) {
  try {
    const {campus_id,hostel_name,hostel_code,name,code,hostel_type,total_floors,status,} = req.body
    // Support both old and new field names
    const hostelName = clean(hostel_name) || clean(name);
    const hostelCode = clean(hostel_code) || clean(code);

    if (!hostelName) {
      return res.status(400).json({ success: false,message: "Hostel name is required",});
    }
    // Check duplicate hostel code only if code is provided
    if (hostelCode) {
      const dup = await one("SELECT id FROM hostels WHERE code=? LIMIT 1",[hostelCode]);
      if (dup) {
        return res.status(409).json({
          success: false,
          message: "Hostel code already exists",
        });
      }
    }

    const result = await query(`INSERT INTO hostels
        (campus_id, name, code, hostel_type, total_floors, status) VALUES  (?, ?, ?, ?, ?, ?)`,
      [
        clean(campus_id),hostelName,hostelCode, clean(hostel_type) || "Boys", Number(total_floors || 0), clean(status) || "Active",
      ]
    );
    return res.status(201).json({
      success: true,
      message: "Hostel created successfully",
      hostelId: result.insertId,
    });
  } catch (e) {
    return sendError(res, e, "Failed to create hostel");
  }
}
async function updateHostel(req,res) {
  try {
    const {id}=req.params;
    if(!isValidId(id)) return res.status(400).json({success:false,message:"Invalid hostel ID"});
    const {campus_id,name,code,hostel_type,total_floors,status}=req.body;
    const exists=await one("SELECT id FROM hostels WHERE id=?",[id]);
    if(!exists) return res.status(404).json({success:false,message:"Hostel not found"});
 
    if(clean(code)){
      const dup=await one("SELECT id FROM hostels WHERE code=? AND id<>? LIMIT 1",[clean(code),id]);
      if(dup) return res.status(409).json({success:false,message:"Hostel code already exists"});
    }
    await query(`
      UPDATE hostels SET  
        campus_id=COALESCE(?,campus_id),
        name=COALESCE(?,name),
        code=COALESCE(?,code),
        hostel_type=COALESCE(?,hostel_type),
        total_floors=COALESCE(?,total_floors),
        status=COALESCE(?,status)
      WHERE id=?
    `,[
      clean(campus_id),clean(name),clean(code),clean(hostel_type),
      total_floors===undefined?null:Number(total_floors),clean(status),id
    ]);
    return res.json({success:true,message:"Hostel updated successfully"});
  } catch(e) {
    console.log("error",e)
     return sendError(res,e,"Failed to update hostel"); 
    }
}

async function deleteHostel(req,res) {
  try {
    const {id}=req.params;
    if(!isValidId(id)) return res.status(400).json({success:false,message:"Invalid hostel ID"});

    const active=await one(`
      SELECT COUNT(*) total
      FROM hostel_allocations a
      JOIN hostel_rooms r ON r.id=a.room_id
      JOIN hostel_floors f ON f.id=r.floor_id
      WHERE f.hostel_id=? AND a.status='Active'
    `,[id]);

    if(Number(active?.total)>0) return res.status(409).json({success:false,message:"Cannot delete hostel while students are allocated"});

    const floors=await one("SELECT COUNT(*) total FROM hostel_floors WHERE hostel_id=?",[id]);
    if(Number(floors?.total)>0) return res.status(409).json({success:false,message:"Delete hostel floors/rooms first"});

    const result=await query("DELETE FROM hostels WHERE id=?",[id]);
    if(!result.affectedRows) return res.status(404).json({success:false,message:"Hostel not found"});
    return res.json({success:true,message:"Hostel deleted successfully"});
  } catch(e) { return sendError(res,e,"Failed to delete hostel"); }
}

// ============================================================
// FLOORS
// ============================================================
async function floors(req,res) {
  try {
    const {hostel_id}=req.query;
    let sql=`
      SELECT f.id,f.hostel_id,f.floor_number,f.floor_name,f.created_at,
             h.name,h.code,
             COUNT(DISTINCT r.id) AS total_rooms,
             COALESCE(SUM(r.total_beds),0) AS total_beds,
             COALESCE(SUM(CASE WHEN b.status='Occupied' THEN 1 ELSE 0 END),0) AS occupied_beds,
             COALESCE(SUM(CASE WHEN b.status='Available' THEN 1 ELSE 0 END),0) AS available_beds
      FROM hostel_floors f
      JOIN hostels h ON h.id=f.hostel_id
      LEFT JOIN hostel_rooms r ON r.floor_id=f.id
      LEFT JOIN hostel_beds b ON b.room_id=r.id
      WHERE 1=1
    `;
    const p=[];
    if(hostel_id){sql+=" AND f.hostel_id=?";p.push(hostel_id);}
    sql+=`
      GROUP BY f.id,f.hostel_id,f.floor_number,f.floor_name,f.created_at,h.name,h.code
      ORDER BY h.name ASC,f.floor_number ASC
    `;
    return res.json({success:true,floors:await query(sql,p)});
  }catch(e){return sendError(res,e,"Failed to fetch floors");}
}

async function createFloor(req,res){
  try{
    const {hostel_id,floor_number,floor_name}=req.body;
    if(!hostel_id || floor_number===undefined) return res.status(400).json({success:false,message:"Hostel and floor number are required"});
    const h=await one("SELECT id FROM hostels WHERE id=?",[hostel_id]);
    if(!h)return res.status(404).json({success:false,message:"Hostel not found"});
    const dup=await one("SELECT id FROM hostel_floors WHERE hostel_id=? AND floor_number=?",[hostel_id,Number(floor_number)]);
    if(dup)return res.status(409).json({success:false,message:"Floor already exists in this hostel"});
    const r=await query("INSERT INTO hostel_floors(hostel_id,floor_number,floor_name) VALUES(?,?,?)",[hostel_id,Number(floor_number),clean(floor_name)||`Floor ${floor_number}`]);
    await query("UPDATE hostels SET total_floors=(SELECT COUNT(*) FROM hostel_floors WHERE hostel_id=?) WHERE id=?",[hostel_id,hostel_id]);
    return res.status(201).json({success:true,message:"Floor created successfully",floorId:r.insertId});
  }catch(e){return sendError(res,e,"Failed to create floor");}
}

async function updateFloor(req,res){
  try{
    const {id}=req.params;
    if(!isValidId(id))return res.status(400).json({success:false,message:"Invalid floor ID"});
    const {hostel_id,floor_number,floor_name}=req.body;
    const f=await one("SELECT * FROM hostel_floors WHERE id=?",[id]);
    if(!f)return res.status(404).json({success:false,message:"Floor not found"});
    const newHostel=hostel_id||f.hostel_id;
    const newNo=floor_number===undefined?f.floor_number:Number(floor_number);
    const dup=await one("SELECT id FROM hostel_floors WHERE hostel_id=? AND floor_number=? AND id<>?",[newHostel,newNo,id]);
    if(dup)return res.status(409).json({success:false,message:"Floor number already exists in this hostel"});
    await query("UPDATE hostel_floors SET hostel_id=?,floor_number=?,floor_name=? WHERE id=?",[newHostel,newNo,clean(floor_name)||f.floor_name,id]);
    await query("UPDATE hostels SET total_floors=(SELECT COUNT(*) FROM hostel_floors WHERE hostel_id=?) WHERE id=?",[newHostel,newHostel]);
    if(Number(newHostel)!==Number(f.hostel_id)){
      await query("UPDATE hostels SET total_floors=(SELECT COUNT(*) FROM hostel_floors WHERE hostel_id=?) WHERE id=?",[f.hostel_id,f.hostel_id]);
    }
    return res.json({success:true,message:"Floor updated successfully"});
  }catch(e){return sendError(res,e,"Failed to update floor");}
}

async function deleteFloor(req,res){
  try{
    const {id}=req.params;
    if(!isValidId(id))return res.status(400).json({success:false,message:"Invalid floor ID"});
    const f=await one("SELECT hostel_id FROM hostel_floors WHERE id=?",[id]);
    if(!f)return res.status(404).json({success:false,message:"Floor not found"});
    const rooms=await one("SELECT COUNT(*) total FROM hostel_rooms WHERE floor_id=?",[id]);
    if(Number(rooms?.total)>0)return res.status(409).json({success:false,message:"Delete rooms from this floor first"});
    await query("DELETE FROM hostel_floors WHERE id=?",[id]);
    await query("UPDATE hostels SET total_floors=(SELECT COUNT(*) FROM hostel_floors WHERE hostel_id=?) WHERE id=?",[f.hostel_id,f.hostel_id]);
    return res.json({success:true,message:"Floor deleted successfully"});
  }catch(e){return sendError(res,e,"Failed to delete floor");}
}

// ============================================================
// ROOMS
// ============================================================
async function rooms(req,res){
  try{
    const {hostel_id,floor_id,status,search}=req.query;
    let sql=`
      SELECT r.id,r.floor_id,f.hostel_id,h.name,h.code,
             f.floor_number,f.floor_name,r.room_number,r.room_type,
             r.total_beds,r.occupied_beds,r.status,r.created_at,r.updated_at,
             COUNT(CASE WHEN b.status='Available' THEN 1 END) AS available_beds
      FROM hostel_rooms r
      JOIN hostel_floors f ON f.id=r.floor_id
      JOIN hostels h ON h.id=f.hostel_id
      LEFT JOIN hostel_beds b ON b.room_id=r.id
      WHERE 1=1
    `;
    const p=[];
    if(hostel_id){sql+=" AND f.hostel_id=?";p.push(hostel_id);}
    if(floor_id){sql+=" AND r.floor_id=?";p.push(floor_id);}
    if(status){sql+=" AND r.status=?";p.push(status);}
    if(search){sql+=" AND r.room_number LIKE ?";p.push(`%${search}%`);}
    sql+=`
      GROUP BY r.id,r.floor_id,f.hostel_id,h.name,h.code,
               f.floor_number,f.floor_name,r.room_number,r.room_type,
               r.total_beds,r.occupied_beds,r.status,r.created_at,r.updated_at
      ORDER BY h.name,f.floor_number,r.room_number
    `;
    const data=await query(sql,p);
    return res.json({success:true,rooms:data,total:data.length});
  }catch(e){return sendError(res,e,"Failed to fetch rooms");}
}

async function room(req,res){
  try{
    const {id}=req.params;
    if(!isValidId(id))return res.status(400).json({success:false,message:"Invalid room ID"});
    const r=await one(`
      SELECT r.*,f.hostel_id,f.floor_number,f.floor_name,h.name,h.code
      FROM hostel_rooms r
      JOIN hostel_floors f ON f.id=r.floor_id
      JOIN hostels h ON h.id=f.hostel_id
      WHERE r.id=? LIMIT 1
    `,[id]);
    if(!r)return res.status(404).json({success:false,message:"Room not found"});
    const beds=await query(`
      SELECT b.id,b.room_id,b.bed_number,b.status,
             a.id allocation_id,a.student_id,a.allocation_date,
             s.student_id enrollment_no,s.name student_name,s.email,s.mobile,
             s.department,s.course,s.year,s.semester,s.photo_path
      FROM hostel_beds b
      LEFT JOIN hostel_allocations a ON a.bed_id=b.id AND a.status='Active'
      LEFT JOIN students s ON s.id=a.student_id
      WHERE b.room_id=? ORDER BY b.bed_number
    `,[id]);
    return res.json({success:true,room:r,beds});
  }catch(e){return sendError(res,e,"Failed to fetch room");}
}

async function createRoom(req,res){
  try{
    const {floor_id,room_number,room_type,total_beds,status}=req.body;
    const beds=Number(total_beds||3);
    if(!floor_id||!clean(room_number))return res.status(400).json({success:false,message:"Floor and room number are required"});
    if(!Number.isInteger(beds)||beds<1||beds>10)return res.status(400).json({success:false,message:"Total beds must be between 1 and 10"});
    const f=await one("SELECT id,hostel_id FROM hostel_floors WHERE id=?",[floor_id]);
    if(!f)return res.status(404).json({success:false,message:"Floor not found"});
    const dup=await one("SELECT id FROM hostel_rooms WHERE floor_id=? AND room_number=?",[floor_id,clean(room_number)]);
    if(dup)return res.status(409).json({success:false,message:"Room already exists on this floor"});

    const r=await query(`
      INSERT INTO hostel_rooms(floor_id,room_number,room_type,total_beds,occupied_beds,status)
      VALUES(?,?,?,0,0,?)
    `,[floor_id,clean(room_number),clean(room_type)||"Triple Sharing",clean(status)||"Available"]);
    const roomId=r.insertId;
    const values=Array.from({length:beds},(_,i)=>[roomId,i+1,"Available"]);
    await query("INSERT INTO hostel_beds(room_id,bed_number,status) VALUES ?",[values]);
    return res.status(201).json({success:true,message:"Room created successfully",roomId});
  }catch(e){return sendError(res,e,"Failed to create room");}
}

async function updateRoom(req,res){
  try{
    const {id}=req.params;
    if(!isValidId(id))return res.status(400).json({success:false,message:"Invalid room ID"});
    const old=await one("SELECT * FROM hostel_rooms WHERE id=?",[id]);
    if(!old)return res.status(404).json({success:false,message:"Room not found"});
    const {floor_id,room_number,room_type,status}=req.body;
    const floor=await one("SELECT id FROM hostel_floors WHERE id=?",[floor_id||old.floor_id]);
    if(!floor)return res.status(404).json({success:false,message:"Floor not found"});
    const dup=await one("SELECT id FROM hostel_rooms WHERE floor_id=? AND room_number=? AND id<>?",[floor_id||old.floor_id,clean(room_number)||old.room_number,id]);
    if(dup)return res.status(409).json({success:false,message:"Room already exists on this floor"});
    await query(`
      UPDATE hostel_rooms SET floor_id=?,room_number=?,room_type=?,status=?
      WHERE id=?
    `,[floor_id||old.floor_id,clean(room_number)||old.room_number,clean(room_type)||old.room_type,clean(status)||old.status,id]);
    return res.json({success:true,message:"Room updated successfully"});
  }catch(e){return sendError(res,e,"Failed to update room");}
}

async function deleteRoom(req,res){
  try{
    const {id}=req.params;
    if(!isValidId(id))return res.status(400).json({success:false,message:"Invalid room ID"});
    const active=await one("SELECT COUNT(*) total FROM hostel_allocations WHERE room_id=? AND status='Active'",[id]);
    if(Number(active?.total)>0)return res.status(409).json({success:false,message:"Cannot delete room because students are currently allocated"});
    const result=await query("DELETE FROM hostel_rooms WHERE id=?",[id]);
    if(!result.affectedRows)return res.status(404).json({success:false,message:"Room not found"});
    return res.json({success:true,message:"Room deleted successfully"});
  }catch(e){return sendError(res,e,"Failed to delete room");}
}

async function roomBeds(req,res){
  try{
    const {id}=req.params;
    if(!isValidId(id))return res.status(400).json({success:false,message:"Invalid room ID"});
    const data=await query(`
      SELECT b.id,b.room_id,b.bed_number,b.status,
             a.id allocation_id,a.student_id,a.allocation_date,
             s.student_id enrollment_no,s.name student_name,s.email,s.mobile,
             s.department,s.course,s.year,s.semester,s.photo_path
      FROM hostel_beds b
      LEFT JOIN hostel_allocations a ON a.bed_id=b.id AND a.status='Active'
      LEFT JOIN students s ON s.id=a.student_id
      WHERE b.room_id=? ORDER BY b.bed_number
    `,[id]);
    return res.json({success:true,beds:data});
  }catch(e){return sendError(res,e,"Failed to fetch room beds");}
}

async function beds(req,res){
  try{
    const {hostel_id,floor_id,room_id,status}=req.query;
    let sql=`
      SELECT b.id,b.room_id,b.bed_number,b.status,
             r.room_number,f.id floor_id,f.floor_number,f.floor_name,
             h.id hostel_id,h.name
      FROM hostel_beds b
      JOIN hostel_rooms r ON r.id=b.room_id
      JOIN hostel_floors f ON f.id=r.floor_id
      JOIN hostels h ON h.id=f.hostel_id
      WHERE 1=1
    `;
    const p=[];
    if(hostel_id){sql+=" AND h.id=?";p.push(hostel_id);}
    if(floor_id){sql+=" AND f.id=?";p.push(floor_id);}
    if(room_id){sql+=" AND r.id=?";p.push(room_id);}
    if(status){sql+=" AND b.status=?";p.push(status);}
    sql+=" ORDER BY h.name,f.floor_number,r.room_number,b.bed_number";
    return res.json({success:true,beds:await query(sql,p)});
  }catch(e){return sendError(res,e,"Failed to fetch beds");}
}

// ============================================================
// ALLOCATION
// ============================================================
async function availableStudents(req,res){
  try{
    const data=await query(`
      SELECT s.id,s.student_id,s.name,s.email,s.mobile,s.department,s.course,
             s.year,s.semester,s.gender,s.photo_path
      FROM students s
      WHERE LOWER(s.status)='active'
      AND NOT EXISTS(
        SELECT 1 FROM hostel_allocations a
        WHERE a.student_id=s.id AND a.status='Active'
      )
      ORDER BY s.name
    `);
    return res.json({success:true,students:data});
  }catch(e){return sendError(res,e,"Failed to fetch available students");}
}

async function allocate(req,res){
  try{
    const {student_id,room_id,bed_number,remarks}=req.body;
    if(!student_id||!room_id||!bed_number)return res.status(400).json({success:false,message:"Student, room and bed are required"});

    const student=await one("SELECT id,name FROM students WHERE id=? LIMIT 1",[student_id]);
    if(!student)return res.status(404).json({success:false,message:"Student not found"});

    const existing=await one("SELECT id FROM hostel_allocations WHERE student_id=? AND status='Active' LIMIT 1",[student_id]);
    if(existing)return res.status(409).json({success:false,message:"Student already has an active room allocation"});

    const bed=await one("SELECT id,room_id,bed_number,status FROM hostel_beds WHERE room_id=? AND bed_number=? LIMIT 1",[room_id,bed_number]);
    if(!bed)return res.status(404).json({success:false,message:"Selected bed not found in this room"});
    if(bed.status!=="Available")return res.status(409).json({success:false,message:"Bed is not available"});

    const result=await query(`
      INSERT INTO hostel_allocations(student_id,room_id,bed_id,allocation_date,status,remarks)
      VALUES(?,?,?,CURDATE(),'Active',?)
    `,[student_id,room_id,bed.id,clean(remarks)]);
    await query("UPDATE hostel_beds SET status='Occupied' WHERE id=?",[bed.id]);
    await updateRoomOccupancy(room_id);

    return res.status(201).json({
      success:true,message:"Student allocated successfully",
      allocationId:result.insertId,student_id:Number(student_id),
      room_id:Number(room_id),bed_id:Number(bed.id),bed_number:Number(bed_number)
    });
  }catch(e){return sendError(res,e,"Failed to allocate student");}
}

async function updateRoomOccupancy(roomId){
  const r=await one(`
    SELECT r.total_beds,
           COALESCE(SUM(CASE WHEN b.status='Occupied' THEN 1 ELSE 0 END),0) occupied
    FROM hostel_rooms r
    LEFT JOIN hostel_beds b ON b.room_id=r.id
    WHERE r.id=? GROUP BY r.id,r.total_beds
  `,[roomId]);
  if(!r)return;
  const occupied=Number(r.occupied), total=Number(r.total_beds);
  const status=occupied===0?"Available":occupied<total?"Partial":"Occupied";
  await query("UPDATE hostel_rooms SET occupied_beds=?,status=? WHERE id=?",[occupied,status,roomId]);
}

async function vacate(req,res){
  try{
    const {id}=req.params;
    if(!isValidId(id))return res.status(400).json({success:false,message:"Invalid allocation ID"});
    const a=await one("SELECT id,room_id,bed_id FROM hostel_allocations WHERE id=? AND status='Active' LIMIT 1",[id]);
    if(!a)return res.status(404).json({success:false,message:"Active allocation not found"});
    await query("UPDATE hostel_allocations SET status='Vacated',vacated_date=CURDATE() WHERE id=?",[id]);
    await query("UPDATE hostel_beds SET status='Available' WHERE id=?",[a.bed_id]);
    await updateRoomOccupancy(a.room_id);
    return res.json({success:true,message:"Student vacated successfully"});
  }catch(e){return sendError(res,e,"Failed to vacate student");}
}

async function residents(req,res){
  try{
    const {hostel_id,floor_id,room_id,search}=req.query;
    let sql=`
      SELECT a.id AS allocation_id ,s.id AS student_db_id,s.student_id,s.name AS student_name,s.email,s.mobile,
             s.department,s.course,s.year,s.semester,s.gender,s.photo_path,
             h.id hostel_id,h.name,h.code,
             f.id floor_id,f.floor_number,f.floor_name,
             r.id room_id,r.room_number,b.id bed_id,b.bed_number,
             a.allocation_date,a.remarks
      FROM hostel_allocations a
      JOIN students s ON s.id=a.student_id
      JOIN hostel_rooms r ON r.id=a.room_id
      JOIN hostel_floors f ON f.id=r.floor_id
      JOIN hostels h ON h.id=f.hostel_id
      JOIN hostel_beds b ON b.id=a.bed_id
      WHERE a.status='Active'
    `;
    const p=[];
    if(hostel_id){sql+=" AND h.id=?";p.push(hostel_id);}
    if(floor_id){sql+=" AND f.id=?";p.push(floor_id);}
    if(room_id){sql+=" AND r.id=?";p.push(room_id);}
    if(search){
      sql+=" AND (s.name LIKE ? OR s.student_id LIKE ? OR s.mobile LIKE ? OR r.room_number LIKE ?)";
      const v=`%${search}%`;p.push(v,v,v,v);
    }
    sql+=" ORDER BY h.name,f.floor_number,r.room_number,b.bed_number";
    const data=await query(sql,p);
    return res.json({success:true,residents:data,total:data.length});
  }catch(e){return sendError(res,e,"Failed to fetch residents");}
}

// ============================================================
// ROOM CHANGES
// ============================================================
async function changes(req,res){
  try{
    const {hostel_id,status}=req.query;
    let sql=`
      SELECT rc.id,s.id student_db_id,s.student_id enrollment_no,s.name,s.mobile,
             s.department,s.course,
             h1.name current_hostel,cr.room_number current_room,
             h2.name requested_hostel,rr.room_number requested_room,
             rc.reason,rc.status,rc.requested_at,rc.processed_at,
             rc.student_id,cr.id current_room_id,rr.id requested_room_id
      FROM hostel_room_change_requests rc
      JOIN students s ON s.id=rc.student_id
      JOIN hostel_rooms cr ON cr.id=rc.current_room_id
      JOIN hostel_floors cf ON cf.id=cr.floor_id
      JOIN hostels h1 ON h1.id=cf.hostel_id
      JOIN hostel_rooms rr ON rr.id=rc.requested_room_id
      JOIN hostel_floors rf ON rf.id=rr.floor_id
      JOIN hostels h2 ON h2.id=rf.hostel_id
      WHERE 1=1
    `;
    const p=[];
    if(hostel_id){sql+=" AND (h1.id=? OR h2.id=?)";p.push(hostel_id,hostel_id);}
    if(status){sql+=" AND rc.status=?";p.push(status);}
    sql+=" ORDER BY rc.requested_at DESC";
    return res.json({success:true,requests:await query(sql,p)});
  }catch(e){return sendError(res,e,"Failed to fetch room change requests");}
}

async function createChange(req,res){
  try{
    const {student_id,current_room_id,requested_room_id,reason}=req.body;
    if(!student_id||!current_room_id||!requested_room_id)return res.status(400).json({success:false,message:"Student, current room and requested room are required"});
    if(Number(current_room_id)===Number(requested_room_id))return res.status(400).json({success:false,message:"Requested room must be different"});
    const bed=await one("SELECT id FROM hostel_beds WHERE room_id=? AND status='Available' LIMIT 1",[requested_room_id]);
    if(!bed)return res.status(409).json({success:false,message:"Requested room has no available bed"});
    const r=await query(`
      INSERT INTO hostel_room_change_requests(student_id,current_room_id,requested_room_id,reason,status)
      VALUES(?,?,?,?, 'Pending')
    `,[student_id,current_room_id,requested_room_id,clean(reason)]);
    return res.status(201).json({success:true,message:"Room change request created successfully",requestId:r.insertId});
  }catch(e){return sendError(res,e,"Failed to create room change request");}
}

async function processChange(req,res){
  try{
    const {id}=req.params;
    const {status}=req.body;
    if(!isValidId(id))return res.status(400).json({success:false,message:"Invalid request ID"});
    if(!["Approved","Rejected"].includes(status))return res.status(400).json({success:false,message:"Status must be Approved or Rejected"});

    const request=await one("SELECT * FROM hostel_room_change_requests WHERE id=? AND status='Pending' LIMIT 1",[id]);
    if(!request)return res.status(404).json({success:false,message:"Pending room change request not found"});

    if(status==="Rejected"){
      await query("UPDATE hostel_room_change_requests SET status='Rejected',processed_at=NOW() WHERE id=?",[id]);
      return res.json({success:true,message:"Room change request rejected"});
    }

    const newBed=await one("SELECT id FROM hostel_beds WHERE room_id=? AND status='Available' ORDER BY bed_number LIMIT 1",[request.requested_room_id]);
    if(!newBed)return res.status(409).json({success:false,message:"No available bed in requested room"});

    const old=await one("SELECT * FROM hostel_allocations WHERE student_id=? AND status='Active' LIMIT 1",[request.student_id]);
    if(!old)return res.status(404).json({success:false,message:"Student has no active allocation"});

    await query("UPDATE hostel_allocations SET status='Vacated',vacated_date=CURDATE() WHERE id=?",[old.id]);
    await query("UPDATE hostel_beds SET status='Available' WHERE id=?",[old.bed_id]);
    await query("UPDATE hostel_beds SET status='Occupied' WHERE id=?",[newBed.id]);
    await query(`
      INSERT INTO hostel_allocations(student_id,room_id,bed_id,allocation_date,status,remarks)
      VALUES(?,?,?,CURDATE(),'Active','Room changed')
    `,[request.student_id,request.requested_room_id,newBed.id]);
    await query("UPDATE hostel_room_change_requests SET status='Approved',processed_at=NOW() WHERE id=?",[id]);
    await updateRoomOccupancy(old.room_id);
    await updateRoomOccupancy(request.requested_room_id);

    return res.json({success:true,message:"Room change approved successfully"});
  }catch(e){return sendError(res,e,"Failed to process room change");}
}

// ============================================================
// MAINTENANCE
// ============================================================
async function maintenance(req,res){
  try{
    const {hostel_id,floor_id,room_id,status,priority}=req.query;
    let sql=`
      SELECT m.id,m.room_id,r.room_number,
             f.id floor_id,f.floor_number,f.floor_name,
             h.id hostel_id,h.name,
             m.issue_title,m.description,m.priority,m.status,
             m.reported_by,m.assigned_to,m.reported_at,m.resolved_at
      FROM hostel_maintenance m
      JOIN hostel_rooms r ON r.id=m.room_id
      JOIN hostel_floors f ON f.id=r.floor_id
      JOIN hostels h ON h.id=f.hostel_id
      WHERE 1=1
    `;
    const p=[];
    if(hostel_id){sql+=" AND h.id=?";p.push(hostel_id);}
    if(floor_id){sql+=" AND f.id=?";p.push(floor_id);}
    if(room_id){sql+=" AND r.id=?";p.push(room_id);}
    if(status){sql+=" AND m.status=?";p.push(status);}
    if(priority){sql+=" AND m.priority=?";p.push(priority);}
    sql+=" ORDER BY m.reported_at DESC";
    return res.json({success:true,maintenance:await query(sql,p)});
  }catch(e){return sendError(res,e,"Failed to fetch maintenance records");}
}

async function createMaintenance(req,res){
  try{
    const {room_id,issue_title,description,priority,reported_by,assigned_to}=req.body;
    if(!room_id||!clean(issue_title))return res.status(400).json({success:false,message:"Room and issue title are required"});
    const allowed=["Low","Medium","High","Critical"];
    const p=allowed.includes(priority)?priority:"Medium";
    const r=await query(`
      INSERT INTO hostel_maintenance(room_id,issue_title,description,priority,status,reported_by,assigned_to)
      VALUES(?,?,?,?, 'Open',?,?)
    `,[room_id,clean(issue_title),clean(description),p,reported_by||null,clean(assigned_to)]);
    return res.status(201).json({success:true,message:"Maintenance request created successfully",maintenanceId:r.insertId});
  }catch(e){return sendError(res,e,"Failed to create maintenance request");}
}

async function updateMaintenance(req,res){
  try{
    const {id}=req.params;
    const {status,priority,assigned_to}=req.body;
    if(!isValidId(id))return res.status(400).json({success:false,message:"Invalid maintenance ID"});
    const allowedStatus=["Open","In Progress","Resolved","Cancelled"];
    const allowedPriority=["Low","Medium","High","Critical"];
    if(status&&!allowedStatus.includes(status))return res.status(400).json({success:false,message:"Invalid maintenance status"});
    if(priority&&!allowedPriority.includes(priority))return res.status(400).json({success:false,message:"Invalid priority"});

    const r=await query(`
      UPDATE hostel_maintenance
      SET status=COALESCE(?,status),
          priority=COALESCE(?,priority),
          assigned_to=COALESCE(?,assigned_to),
          resolved_at=CASE WHEN ?='Resolved' THEN NOW() ELSE resolved_at END
      WHERE id=?
    `,[status||null,priority||null,assigned_to||null,status||null,id]);
    if(!r.affectedRows)return res.status(404).json({success:false,message:"Maintenance record not found"});
    return res.json({success:true,message:"Maintenance updated successfully"});
  }catch(e){return sendError(res,e,"Failed to update maintenance");}
}

module.exports={
  overview,
  hostels,hostel,createHostel,updateHostel,deleteHostel,
  floors,createFloor,updateFloor,deleteFloor,
  rooms,room,createRoom,updateRoom,deleteRoom,roomBeds,beds,
  availableStudents,allocate,vacate,residents,
  changes,createChange,processChange,
  maintenance,createMaintenance,updateMaintenance
};
