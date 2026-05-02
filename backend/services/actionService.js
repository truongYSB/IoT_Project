const db = require('../config/db');

const actionService = {
    getActionHistory: async (params) => {
        const { page = 1, limit = 10, device = '', search = '' } = params;
        const offset = (page - 1) * limit;

        let baseQuery = `
            FROM Action a 
            JOIN Device d ON a.device_id = d.id 
            WHERE 1=1`;
        
        const queryParams = [];

        if (device && device !== 'All') {
            baseQuery += ` AND d.name = ?`;
            queryParams.push(device);
        }
        if (search) {
            baseQuery += ` AND (d.name LIKE ? OR a.action LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        const [countResult] = await db.query(`SELECT COUNT(*) as total ${baseQuery}`, queryParams);
        const totalRows = countResult[0].total;

        const dataQuery = `SELECT a.id, d.name as device_name, a.action, a.status, a.createdAt 
                           ${baseQuery} ORDER BY a.createdAt DESC LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(limit), parseInt(offset));

        const [data] = await db.query(dataQuery, queryParams);

        return {
            totalRows,
            totalPages: Math.ceil(totalRows / limit),
            data
        };
    }
};

module.exports = actionService;