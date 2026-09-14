const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mydb",
  port: Number(process.env.DB_PORT || 3306),
});

connection.connect((err) => {
  if (err) console.error("Connection failed:", err.message);
  else console.log(`MySQL connected: ${process.env.DB_NAME || "mydb"}`);
});

module.exports = connection;
