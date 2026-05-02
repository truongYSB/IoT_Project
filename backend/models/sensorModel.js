const db = require('../config/db');

const Sensor = {
    // Tìm cảm biến theo tên để lấy ID
    findByName: async (name) => {
        const [rows] = await db.query("SELECT * FROM Sensor WHERE name = ?", [name]);
        return rows[0];
    },

    // Lấy danh sách tất cả các loại cảm biến
    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM Sensor");
        return rows;
    }
};

module.exports = Sensor;