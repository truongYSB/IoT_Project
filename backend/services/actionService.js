const db = require('../config/db');

const actionService = {
    // --- MỚI: Lấy danh sách thiết bị cho Dropdown ---
    getAllDevices: async () => {
        const [rows] = await db.query("SELECT id, name FROM Device");
        return rows; 
    },
    
    getActionHistory: async (params) => {
        // Thêm 'order' và 'device_id' vào params để đồng bộ logic lọc
        const { 
            page = 1, 
            limit = 10, 
            device_id = '', 
            search = '', 
            sortBy = 'createdAt', 
            order = 'DESC' 
        } = params;
        const offset = (page - 1) * limit;

        let baseQuery = `
            FROM Action a 
            JOIN Device d ON a.device_id = d.id 
            WHERE 1=1`;
        
        const queryParams = [];

        // Lọc chính xác theo ID thiết bị thay vì tên
        if (device_id) {
            baseQuery += ` AND a.device_id = ?`;
            queryParams.push(device_id);
        }

        // TÌM KIẾM ĐA NĂNG: Tên thiết bị, Hành động và Thời gian (DD/MM/YYYY)[cite: 8]
        if (search) {
            baseQuery += ` AND (d.name LIKE ? 
                            OR a.action LIKE ? 
                            OR DATE_FORMAT(a.createdAt, '%d/%m/%Y %H:%i:%s') LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const [countResult] = await db.query(`SELECT COUNT(*) as total ${baseQuery}`, queryParams);
        const totalRows = countResult[0].total;

        // Sử dụng biến order động (ASC/DESC)[cite: 8]
        const dataQuery = `SELECT a.id, d.name as device_name, a.action, a.status, a.createdAt 
                           ${baseQuery} ORDER BY a.${sortBy} ${order} LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(limit), parseInt(offset));

        const [data] = await db.query(dataQuery, queryParams);

        return {
            totalRows,
            totalPages: Math.ceil(totalRows / limit),
            currentPage: parseInt(page), // Bổ sung để Frontend dễ quản lý
            data
        };
    },

    // Hàm lấy thống kê ON/OFF của 5 thiết bị theo ngày
    getStatsByDate: async (date) => {
        const query = `
            SELECT 
                d.name as device_name,
                SUM(CASE WHEN a.action = 'ON' THEN 1 ELSE 0 END) as on_count,
                SUM(CASE WHEN a.action = 'OFF' THEN 1 ELSE 0 END) as off_count
            FROM Device d
            LEFT JOIN Action a ON d.id = a.device_id AND DATE(a.createdAt) = ?
            GROUP BY d.id, d.name`;
            
        const [rows] = await db.query(query, [date]);
        return rows;
    }
};

module.exports = actionService;