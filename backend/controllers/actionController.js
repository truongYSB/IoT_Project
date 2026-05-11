const actionService = require('../services/actionService');

const actionController = {
    // API trả về danh sách thiết bị
    getDevicesList: async (req, res) => {
        try {
            const data = await actionService.getAllDevices();
            res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // API lấy trạng thái hiện tại của tất cả thiết bị
    getCurrentDeviceStates: async (req, res) => {
        try {
            const data = await actionService.getCurrentDeviceStates();
            res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
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
    },

    // getStats: async (req, res) => {
    //     try {
    //         const { date } = req.query; // Nhận ngày dạng YYYY-MM-DD
    //         const result = await actionService.getStatsByDate(date);
    //         res.status(200).json({ success: true, data: result });
    //     } catch (error) {
    //         res.status(500).json({ success: false, message: error.message });
    //     }
    // }

    getStats: async (req, res) => {
        try {
            let { startDate, endDate } = req.query;

            // Lấy ngày hôm nay theo múi giờ Việt Nam (định dạng YYYY-MM-DD)
            const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });

            if (startDate && !endDate) {
                endDate = todayStr;
            }
            else if (!startDate && !endDate) {
                const date = new Date();
                // Lùi lại 7 ngày dựa trên thời gian hiện tại
                date.setDate(date.getDate() - 7);
                startDate = date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
                endDate = todayStr;
            }

            const result = await actionService.getStatsByRange(startDate, endDate);

            res.status(200).json({
                success: true,
                data: result,
                meta: { startDate, endDate }
            });
        } catch (error) {
            const statusCode = error.message.includes("không được") ? 400 : 500;
            res.status(statusCode).json({ success: false, message: error.message });
        }
    }
};

module.exports = actionController;