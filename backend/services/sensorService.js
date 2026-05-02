const db = require('../config/db');

const sensorService = {
    // Lấy dữ liệu cho biểu đồ Dashboard (từ 0h đến 24h hôm nay)
    getDailyChartData: async () => {
        const query = `
            SELECT s.name, ds.value, ds.createdAt 
            FROM Data_Sensor ds 
            JOIN Sensor s ON ds.sensor_id = s.id 
            WHERE ds.createdAt >= CURDATE() 
            ORDER BY ds.createdAt ASC`;
        const [rows] = await db.query(query);
        return rows;
    },

    // Lấy lịch sử cảm biến với Tìm kiếm, Lọc và Phân trang
    getSensorHistory: async (params) => {
        const { page = 1, limit = 10, search = '', type = '', sortBy = 'createdAt', order = 'DESC' } = params;
        const offset = (page - 1) * limit;

        let baseQuery = `
            FROM Data_Sensor ds 
            JOIN Sensor s ON ds.sensor_id = s.id 
            WHERE 1=1`;
        
        const queryParams = [];

        if (type) {
            baseQuery += ` AND s.name = ?`;
            queryParams.push(type);
        }
        if (search) {
            baseQuery += ` AND (ds.value LIKE ? OR s.name LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        // 1. Đếm tổng số bản ghi phù hợp để tính số trang
        const [countResult] = await db.query(`SELECT COUNT(*) as total ${baseQuery}`, queryParams);
        const totalRows = countResult[0].total;

        // 2. Lấy dữ liệu phân trang
        const dataQuery = `SELECT ds.id, s.name as sensor_name, ds.value, ds.createdAt ${baseQuery} 
                           ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(limit), parseInt(offset));

        const [data] = await db.query(dataQuery, queryParams);

        return {
            totalRows,
            totalPages: Math.ceil(totalRows / limit),
            currentPage: parseInt(page),
            data
        };
    }
};

module.exports = sensorService;