const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// Đường dẫn: POST /api/devices/control
// Dùng để gửi lệnh Bật/Tắt thiết bị
router.post('/control', deviceController.control);

module.exports = router;