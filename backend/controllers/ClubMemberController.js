const db = require("../config/database");

async function addMember(req, res) {
  try {
    const {
      name,
      email,
      phone,
      course,
      semester,
      department,
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing member
    const [existingMember] = await db
      .promise()
      .query(
        "SELECT id, member_id FROM club_members WHERE email = ? LIMIT 1",
        [cleanEmail]
      );

    if (existingMember.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Member with this email already exists",
        memberId: existingMember[0].member_id,
      });
    }

    // Insert member
    const [result] = await db.promise().query(
      `
      INSERT INTO club_members
      (
        name,
        email,
        phone,
        course,
        semester,
        department,
        register_date
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        cleanName,
        cleanEmail,
        phone || null,
        course || null,
        semester || null,
        department || null,
      ]
    );

    // Generate serial membership ID
    const memberId =
      `CSC${new Date().getFullYear()}-` +
      String(result.insertId).padStart(4, "0");

    // Save generated member ID
    await db.promise().query(
      "UPDATE club_members SET member_id = ? WHERE id = ?",
      [memberId, result.insertId]
    );

    // Registration date
    const registerDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Response
    return res.status(201).json({
      success: true,
      message: "Member registered successfully",

      member: {
        id: result.insertId,
        memberId,
        name: cleanName,
        email: cleanEmail,
        phone: phone || null,
        course: course || null,
        semester: semester || null,
        department: department || null,
        registerDate,
      },
    });
  } catch (error) {
    console.error("Member Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register member",
      error: error.message,
    });
  }
}

module.exports = {
  addMember,
};