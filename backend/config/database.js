const mysql = require('mysql2')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Avik@123',
    database: 'mydb'
});
connection.connect((err) => {
    if (err) {
        console.log("Connection failed:", err);
        return;
    }
});

module.exports = connection;