const express = require('express');
const router = express.Router();
const actionController = require('../controllers/actionController');

// Dùng cho trang Action History
router.get('/history', actionController.getHistory);
router.get('/list', actionController.getDevicesList);
router.get('/stats', actionController.getStats);
// API lấy trạng thái hiện tại của tất cả thiết bị (cho Dashboard)
router.get('/current-states', actionController.getCurrentDeviceStates);
module.exports = router;