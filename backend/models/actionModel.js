const db = require('../config/db');

const Action = {
    // Lưu mới một hành động điều khiển
    create: async (deviceId, action, status) => {
        const sql = "INSERT INTO Action (device_id, action, status) VALUES (?, ?, ?)";
        return await db.query(sql, [deviceId, action, status]);
    },

    // Lấy nhật ký có phân trang và lọc theo thiết bị
    getHistory: async (device, search, limit, offset) => {
        let sql = `
            SELECT a.id, d.name as device_name, a.action, a.status, a.createdAt 
            FROM Action a 
            JOIN Device d ON a.device_id = d.id 
            WHERE 1=1`;
        const params = [];

        if (device && device !== 'All') {
            sql += ` AND d.name = ?`;
            params.push(device);
        }
        if (search) {
            sql += ` AND (d.name LIKE ? OR a.action LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ` ORDER BY a.createdAt DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await db.query(sql, params);
        return rows;
    },

    countHistory: async (device, search) => {
        let sql = `SELECT COUNT(*) as total FROM Action a JOIN Device d ON a.device_id = d.id WHERE 1=1`;
        const params = [];
        if (device && device !== 'All') { sql += ` AND d.name = ?`; params.push(device); }
        if (search) { sql += ` AND (d.name LIKE ? OR a.action LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
        
        const [rows] = await db.query(sql, params);
        return rows[0].total;
    }
};

module.exports = Action;