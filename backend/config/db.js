const mysql = require('mysql2/promise');

// Khởi tạo Pool kết nối tới MySQL trên XAMPP
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối khi khởi tạo (tùy chọn)
db.getConnection()
    .then(connection => {
        console.log('✅ Database: MySQL connection pool established.');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database: Connection failed!', err.message);
    });

module.exports = db;