const db = require('../config/db');

const actionService = {
    // Lấy danh sách thiết bị cho Dropdown
    getAllDevices: async () => {
        const [rows] = await db.query("SELECT id, name FROM Device");
        return rows;
    },

    // Lấy trạng thái hiện tại của tất cả thiết bị
    getCurrentDeviceStates: async () => {
        const query = `
            SELECT 
                d.name as device_name,
                d.id as device_id,
                COALESCE(
                    (SELECT a.status 
                     FROM Action a 
                     WHERE a.device_id = d.id AND a.status IN ('ON', 'OFF') 
                     ORDER BY a.id DESC LIMIT 1), 
                    'OFF'
                ) as current_status
            FROM Device d
            ORDER BY d.id`;
        
        const [rows] = await db.query(query);
        
        // Chuyển đổi thành object với key là device name
        const deviceStates = {};
        rows.forEach(row => {
            deviceStates[row.device_name.toLowerCase().replace(' ', '_')] = row.current_status;
        });
        
        return deviceStates;
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

        // TÌM KIẾM ĐA NĂNG: Tên thiết bị, Hành động và Thời gian (DD/MM/YYYY)
        if (search) {
            baseQuery += ` AND (d.name LIKE ? 
                            OR a.action LIKE ? 
                            OR DATE_FORMAT(a.createdAt, '%d/%m/%Y %H:%i:%s') LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const [countResult] = await db.query(`SELECT COUNT(*) as total ${baseQuery}`, queryParams);
        const totalRows = countResult[0].total;

        // Sử dụng biến order động (ASC/DESC)
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
    // getStatsByDate: async (date) => {
    //     const query = `
    //         SELECT 
    //             d.name as device_name,
    //             SUM(CASE WHEN a.action = 'ON' THEN 1 ELSE 0 END) as on_count,
    //             SUM(CASE WHEN a.action = 'OFF' THEN 1 ELSE 0 END) as off_count
    //         FROM Device d
    //         LEFT JOIN Action a ON d.id = a.device_id AND DATE(a.createdAt) = ?
    //         GROUP BY d.id, d.name`;

    //     const [rows] = await db.query(query, [date]);
    //     return rows;
    // },

    getStatsByRange: async (startDate, endDate) => {
        // CHUẨN BỊ DỮ LIỆU VÀ KIỂM TRA LOGIC
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Lấy ngày hôm nay theo múi giờ Việt Nam để so sánh
        const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
        const today = new Date(todayStr);

        if (start > today) {
            throw new Error("Ngày bắt đầu không được vượt quá ngày hôm nay.");
        }
        if (end > today) {
            throw new Error("Ngày kết thúc không được vượt quá ngày hôm nay.");
        }
        if (start > end) {
            throw new Error("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
        }

        // TRUY VẤN SQL
        const detailQuery = `
            SELECT 
                DATE_FORMAT(a.createdAt, '%Y-%m-%d') as date,
                d.name as device_name,
                SUM(CASE WHEN a.action = 'ON' THEN 1 ELSE 0 END) as on_count,
                SUM(CASE WHEN a.action = 'OFF' THEN 1 ELSE 0 END) as off_count
            FROM Device d
            JOIN Action a ON d.id = a.device_id
            WHERE DATE(a.createdAt) BETWEEN ? AND ?
            GROUP BY date, d.id, d.name
            ORDER BY date ASC, d.name ASC`;

        const [rows] = await db.query(detailQuery, [startDate, endDate]);

        // XỬ LÝ DỮ LIỆU TRẢ VỀ
        let totalRangeOn = 0;
        let totalRangeOff = 0;
        const dailySummaryMap = {};

        rows.forEach(row => {
            const on = parseInt(row.on_count);
            const off = parseInt(row.off_count);
            const date = row.date;

            totalRangeOn += on;
            totalRangeOff += off;

            if (!dailySummaryMap[date]) {
                dailySummaryMap[date] = { date, total_on: 0, total_off: 0 };
            }
            dailySummaryMap[date].total_on += on;
            dailySummaryMap[date].total_off += off;
        });

        return {
            overallTotal: {
                on: totalRangeOn,
                off: totalRangeOff,
                all_actions: totalRangeOn + totalRangeOff
            },
            dailyTotal: Object.values(dailySummaryMap),
            dailyDeviceDetail: rows
        };
    }
};

module.exports = actionService;