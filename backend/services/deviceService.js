const db = require('../config/db');
const { publishMessage } = require('./mqttService');

const deviceService = {
    controlDevice: async (deviceName, action) => {
        try {
            // 1. Tìm ID thiết bị từ tên (ví dụ: "Fan") trong database
            const [devices] = await db.query("SELECT id FROM Device WHERE name = ?", [deviceName]);
            if (devices.length === 0) throw new Error("Device not found");
            const deviceId = devices[0].id;

            // 2. Xác định trạng thái ngược lại để phục vụ Rollback nếu gặp lỗi Timeout
            const rollbackAction = (action === 'ON') ? 'OFF' : 'ON';

            // 3. Lưu trạng thái LOADING vào cơ sở dữ liệu để báo hiệu đang chờ xử lý[cite: 2]
            const [result] = await db.query(
                "INSERT INTO Action (device_id, action, status) VALUES (?, ?, ?)",
                [deviceId, action, 'LOADING']
            );
            const currentActionId = result.insertId;

            // 4. Gửi lệnh qua MQTT kèm theo actionId để ESP32 có thể phản hồi xác nhận (ACK)[cite: 2]
            publishMessage(process.env.TOPIC_CONTROL, { 
                device: deviceName.toLowerCase(), 
                state: action, 
                actionId: currentActionId 
            });

            // 5. Thiết lập cơ chế Timeout 10 giây[cite: 2]
            setTimeout(async () => {
                // Kiểm tra lại trạng thái của lệnh sau 10 giây[cite: 2]
                const [rows] = await db.query("SELECT status FROM Action WHERE id = ?", [currentActionId]);
                
                // Nếu sau 10s vẫn là LOADING, nghĩa là không nhận được phản hồi từ ESP32[cite: 2]
                if (rows.length > 0 && rows[0].status === 'LOADING') {
                    console.log(`⏳ Timeout: ${deviceName} không phản hồi. Đang Rollback về ${rollbackAction}`);
                    
                    // Cập nhật hành động về trạng thái cũ và đánh dấu là TIMEOUT[cite: 2]
                    await db.query(
                        "UPDATE Action SET action = ?, status = 'TIMEOUT' WHERE id = ?",
                        [rollbackAction, currentActionId]
                    );
                }
            }, 10000);

            // Trả về kết quả để Controller có thể phản hồi lại cho người dùng[cite: 2]
            return { success: true, actionId: currentActionId };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
};

module.exports = deviceService;