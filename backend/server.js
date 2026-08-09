const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { generalLimiter } = require('./User/hashFunctions/rateLimiter.js'); 
const authController = require('./User/Controller/authController')
const verifyAccessToken = require('./User/Middleware/auth')

const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST || "0.0.0.0";
//Mysql Database Connection
const db = require("./Database/database.js"); // Import the database connection

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://10.106.80.232:5173",
  "https://localhost:5173",
  "https://127.0.0.1:5173",
  "https://10.106.80.232:5173",
];
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // required so the browser will send/receive the refreshToken cookie
}));
app.use(helmet()); // secure HTTP headers
app.use(express.json({ limit: '10kb' })); // body size limit - DoS se bachne ke liye
app.use(cookieParser());
app.use(generalLimiter);
app.use(bodyParser.json());
app.set('trust proxy', 1);

//------------------USER CONTROLLER ----------------
app.get("/api/captcha",authController.captcha);
app.post("/api/register",authController.register);
app.post("/api/login", authController.login);
app.get('/api/logout',authController.logout);
app.post("/api/refresh", authController.refresh);
app.post("/forgetpassword",authController.forgotPassword);

//--------------------STUDENTS CONTROLLER ---------------
app.get("/api/students/count",verifyAccessToken, (req, res) => {
  db.query("SELECT * FROM students", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({
      total: result.length,
    });


  });
});
//Get Students 
// ===============================
// Get All Students API
// ===============================

app.get("/api/students", verifyAccessToken,(req, res) => {

  const sql = `
          SELECT
            id,
            name,
            student_id,
            class_name,
            email,
            mobile,
            photo_path
          FROM students
          ORDER BY id DESC
        `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database Error",
        error: err
      });
    }

    res.json(result);
    console.log("Data sent")

  });

});
// Post students data

app.post("/api/students",verifyAccessToken, (req, res) => {

  const { student_name, email, class: studentClass, mobile, photo } = req.body;

  db.query(
    "INSERT INTO students(name,student_id,class_name,mobile,photo) VALUES(?,?,?,?,?)",
    [student_name, roll_no, studentClass, mobile, photo],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Student Added Successfully"
      });
    }
  );

});

app.put("/api/students/:id",verifyAccessToken, (req, res) => {

  const { id } = req.params;
  const { student_name, roll_no, class: studentClass, email, mobile, photo, parents } = req.body;

  db.query(
    `UPDATE students
                                      SET name=?, roll_no=?, class=?, mobile=?, photo=?,email=?,parents=?
                                      WHERE id=?`,
    [student_name, roll_no, studentClass, mobile, photo, id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Student Updated"
      });
    }
  );

});

app.delete("/api/students/:id", verifyAccessToken,(req, res) => {

  db.query(
    "DELETE FROM students WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Student Deleted"
      });
    }
  );

});

// ===============================
// Dashboard Modules API
// ===============================

app.get("/api/dashboard/modules",verifyAccessToken, (req, res) => {

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
      return res.status(500).json({
        success: false,
        message: "Database Error"
      });
    }
    // Parent menus
    const parents = rows
      .filter(row => row.parent_id === null)
      .map(parent => ({
        ...parent,
        children: rows.filter(child => child.parent_id === parent.id)
      }));

    res.json({
      success: true,
      data: parents
    });

  });

});

// Enable / Disable Module API

app.post("/api/dashboard/modules",verifyAccessToken, (req, res) => {

  const {
    parent_id,
    label,
    path,
    icon,
    is_active,
    is_visible
  } = req.body;


  const sql =`

        INSERT INTO dashboard_menu
        (
        parent_id,
        label,
        path,
        icon,
        is_active,
        is_visible
        )

        VALUES(?,?,?,?,?,?)

        `;


  db.query(
    sql,
    [
      parent_id || null,
      label,
      path,
      icon,
      is_active,
      is_visible
    ],

    (err, result) => {

      if (err)
        return res.status(500).json(err);


      res.json({

        success: true,
        message: "Module Added",
        id: result.insertId

      });


    });


});


// ===============================
// Update Module API
// ===============================

app.put("/api/dashboard/modules/:id", verifyAccessToken,(req, res) => {

  const { id } = req.params;

  const {
    parent_id,
    label,
    path,
    icon,
    is_active,
    is_visible
  } = req.body;


  const sql =`
              UPDATE dashboard_menu
              SET
              parent_id=?,
              label=?,
              path=?,
              icon=?,
              is_active=?,
              is_visible=?
              WHERE id=?
              `;


  db.query(
    sql,
    [
      parent_id || null,
      label,
      path,
      icon,
      is_active,
      is_visible,
      id
    ],

    (err, result) => {

      if (err)
        return res.status(500).json(err);
      res.json({
        success: true,
        message: "Module Updated"
      });


    });


});




// ===============================
// Enable Disable Module API
// ===============================


app.put("/api/dashboard/modules/:id/status",verifyAccessToken, (req, res) => {

  const { id } = req.params;

  const {
    is_active
  } = req.body;



  db.query(`
        UPDATE dashboard_menu
        SET is_active=?
        WHERE id=?
        `,

    [
      is_active,
      id
    ],

    (err, result) => {


      if (err)
        return res.status(500).json(err);


      res.json({

        success: true,
        message: "Status Updated"

      });


    });


});

// Delete Modules

// ===============================
// Delete Module API
// ===============================

app.delete("/api/dashboard/modules/:id",verifyAccessToken, (req, res) => {

  const { id } = req.params;


  // Pehle child modules delete karega
  db.query(
    "DELETE FROM dashboard_menu WHERE parent_id=?",
    [id],
    (err) => {

      if (err)
        return res.status(500).json(err);


      // Phir main module delete karega
      db.query(
        "DELETE FROM dashboard_menu WHERE id=?",
        [id],
        (err) => {

          if (err)
            return res.status(500).json(err);


          res.json({
            success: true,
            message: "Module Deleted"
          });


        });


    });


});

app.listen(port, host, () => {
  console.log(`Auth server running on http://${host}:${port}`);
});
