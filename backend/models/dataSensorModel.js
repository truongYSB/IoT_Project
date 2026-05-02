const db = require('../config/db');

const DataSensor = {
    // Lưu nhiều bản ghi cùng lúc (Bulk Insert)
    createMultiple: async (values) => {
        const sql = "INSERT INTO Data_Sensor (sensor_id, value) VALUES ?";
        return await db.query(sql, [values]);
    },

    // Truy vấn dữ liệu cho biểu đồ Dashboard
    getDailyData: async () => {
        const sql = `
            SELECT s.name, ds.value, ds.createdAt 
            FROM Data_Sensor ds 
            JOIN Sensor s ON ds.sensor_id = s.id 
            WHERE ds.createdAt >= CURDATE() 
            ORDER BY ds.createdAt ASC`;
        const [rows] = await db.query(sql);
        return rows;
    },

    // Truy vấn lịch sử có lọc và phân trang
    getHistory: async (type, search, limit, offset, sortBy, order) => {
        let sql = `
            SELECT ds.id, s.name as sensor_name, ds.value, ds.createdAt 
            FROM Data_Sensor ds 
            JOIN Sensor s ON ds.sensor_id = s.id 
            WHERE 1=1`;
        const params = [];

        if (type) {
            sql += ` AND s.name = ?`;
            params.push(type);
        }
        if (search) {
            sql += ` AND ds.value LIKE ?`;
            params.push(`%${search}%`);
        }

        sql += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await db.query(sql, params);
        return rows;
    },

    // Đếm tổng số bản ghi (phục vụ phân trang)
    countHistory: async (type, search) => {
        let sql = `SELECT COUNT(*) as total FROM Data_Sensor ds JOIN Sensor s ON ds.sensor_id = s.id WHERE 1=1`;
        const params = [];
        if (type) { sql += ` AND s.name = ?`; params.push(type); }
        if (search) { sql += ` AND ds.value LIKE ?`; params.push(`%${search}%`); }
        
        const [rows] = await db.query(sql, params);
        return rows[0].total;
    }
};

module.exports = DataSensor;