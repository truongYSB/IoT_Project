const actionService = require('../services/actionService');

const actionController = {
    // API: Lấy nhật ký điều khiển (Phân trang, Lọc thiết bị)
    getHistory: async (req, res) => {
        try {
            // req.query chứa các tham số: page, limit, device, search
            const result = await actionService.getActionHistory(req.query);
            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = actionController;