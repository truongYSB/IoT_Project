const sensorService = require('../services/sensorService');

const sensorController = {
    // API: Lấy dữ liệu biểu đồ 24h cho Dashboard
    getDashboardData: async (req, res) => {
        try {
            const data = await sensorService.getDailyChartData();
            res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // API trả về danh sách cảm biến
    getSensorsList: async (req, res) => {
        try {
            const data = await sensorService.getAllSensors();
            res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Lấy lịch sử
    getHistory: async (req, res) => {
        try {
            const result = await sensorService.getSensorHistory(req.query);
            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = sensorController;