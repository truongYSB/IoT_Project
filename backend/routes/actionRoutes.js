const express = require('express');
const router = express.Router();
const actionController = require('../controllers/actionController');

// Đường dẫn: GET /api/actions/history
// Dùng cho trang Action History
router.get('/history', actionController.getHistory);
router.get('/list', actionController.getDevicesList);
module.exports = router;