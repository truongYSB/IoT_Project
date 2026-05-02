const db = require('../config/db');
const { publishMessage } = require('./mqttService');

const deviceService = {
    controlDevice: async (deviceName, action) => {
        try {
            // Lấy ID thiết bị từ tên
            const [devices] = await db.query("SELECT id FROM Device WHERE name = ?", [deviceName]);
            if (devices.length === 0) throw new Error("Thiết bị không tồn tại");
            
            const deviceId = devices[0].id;

            // 1. Gửi lệnh qua MQTT
            const payload = { device: deviceName.toLowerCase(), state: action };
            publishMessage(process.env.TOPIC_CONTROL, payload);

            // 2. Lưu nhật ký vào bảng Action
            const query = "INSERT INTO Action (device_id, action, status) VALUES (?, ?, ?)";
            await db.query(query, [deviceId, action, 'Success']);

            return { success: true };
        } catch (err) {
            console.error("Device Control Error:", err);
            return { success: false, error: err.message };
        }
    }
};

module.exports = deviceService;