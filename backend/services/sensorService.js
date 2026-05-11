const db = require('../config/db');

const sensorService = {
    //  Hàm lấy danh sách tất cả cảm biến cho Dropdown
    getAllSensors: async () => {
        const [rows] = await db.query("SELECT id, name FROM Sensor");
        return rows;
    },

    // Lấy dữ liệu cho biểu đồ Dashboard (từ 0h đến 24h hôm nay)
    getDailyChartData: async () => {
        // Truy vấn lấy dữ liệu của ngày hôm nay từ Database
        const query = `
            SELECT s.name, ds.value, ds.createdAt 
            FROM Data_Sensor ds 
            JOIN Sensor s ON ds.sensor_id = s.id 
            WHERE ds.createdAt >= CURDATE() 
            ORDER BY ds.createdAt ASC`;

        const [rows] = await db.query(query);

        // Gom nhóm dữ liệu theo từng mốc thời gian
        const groupedData = {};

        rows.forEach(row => {
            // Chuyển thời gian về timestamp và bỏ qua phần nghìn giây để đảm bảo gom nhóm chính xác
            const timeKey = new Date(row.createdAt).setMilliseconds(0);

            // Khởi tạo object chứa mốc thời gian nếu chưa tồn tại
            if (!groupedData[timeKey]) {
                groupedData[timeKey] = { timestamp: row.createdAt };
            }

            // Phân loại và gán giá trị dựa trên tên chính xác từ Database
            if (row.name === 'Temperature') {
                groupedData[timeKey].temp = row.value;
            } else if (row.name === 'Humidity') {
                groupedData[timeKey].humidity = row.value;
            } else if (row.name === 'Light') {
                groupedData[timeKey].light_lux = row.value;
            }
        });

        // Trả về mảng các đối tượng đã được gom nhóm để gửi về Frontend
        return Object.values(groupedData);
    },

    // Lấy lịch sử cảm biến với Tìm kiếm, Lọc và Phân trang
    getSensorHistory: async (params) => {
        const { page = 1, limit = 10, search = '', sensor_id = '', sortBy = 'createdAt', order = 'DESC' } = params;
        const offset = (page - 1) * limit;

        let baseQuery = `
            FROM Data_Sensor ds 
            JOIN Sensor s ON ds.sensor_id = s.id 
            WHERE 1=1`;

        const queryParams = [];

        // Lọc chính xác theo ID cảm biến
        if (sensor_id) {
            baseQuery += ` AND ds.sensor_id = ?`;
            queryParams.push(sensor_id);
        }

        // TÌM KIẾM CHUNG: Quét qua Giá trị, Tên và Thời gian (định dạng DD/MM/YYYY)
        if (search) {
            // Sử dụng DATE_FORMAT để cho phép tìm kiếm theo định dạng ngày Việt Nam
            baseQuery += ` AND (ds.value LIKE ? 
                            OR s.name LIKE ? 
                            OR DATE_FORMAT(ds.createdAt, '%d/%m/%Y %H:%i:%s') LIKE ?)`;

            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const [countResult] = await db.query(`SELECT COUNT(*) as total ${baseQuery}`, queryParams);
        const totalRows = countResult[0].total;

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