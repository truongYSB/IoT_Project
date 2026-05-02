const db = require('../config/db');

const Device = {
    // Lấy ID thiết bị dựa trên tên
    findByName: async (name) => {
        const [rows] = await db.query("SELECT * FROM Device WHERE name = ?", [name]);
        return rows[0];
    },

    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM Device");
        return rows;
    }
};

module.exports = Device;