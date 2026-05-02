const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// Đường dẫn: GET /api/sensors/dashboard
// Dùng để lấy dữ liệu biểu đồ 24h
router.get('/dashboard', sensorController.getDashboardData);

// Đường dẫn: GET /api/sensors/history
// Dùng cho trang Data Sensor (lọc, tìm kiếm, phân trang)
router.get('/history', sensorController.getHistory);

module.exports = router;