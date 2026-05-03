const db = require('../config/db');
const { publishMessage } = require('./mqttService');

const deviceService = {
    controlDevice: async (deviceName, action) => {
        try {
            const [devices] = await db.query("SELECT id FROM Device WHERE name = ?", [deviceName]);
            if (devices.length === 0) throw new Error("Device not found");
            const deviceId = devices[0].id;

            // 1. Tìm trạng thái thực tế gần nhất
            const [lastAction] = await db.query(
                "SELECT status FROM Action WHERE device_id = ? AND status IN ('ON', 'OFF') ORDER BY id DESC LIMIT 1",
                [deviceId]
            );
            const initialState = lastAction.length > 0 ? lastAction[0].status : (action === 'ON' ? 'OFF' : 'ON');

            // 2. Lưu trạng thái LOADING
            const [result] = await db.query(
                "INSERT INTO Action (device_id, action, status) VALUES (?, ?, ?)",
                [deviceId, action, 'LOADING']
            );
            const currentActionId = result.insertId;

            // 3. Gửi lệnh MQTT
            publishMessage(process.env.TOPIC_CONTROL, { 
                device: deviceName.toLowerCase(), 
                state: action, 
                actionId: currentActionId 
            });

            // --- BƯỚC 4 MỚI: VÒNG LẶP CHỜ PHẢN HỒI (Tối đa 10 giây) ---
            let finalStatus = 'LOADING';
            let attempts = 0;
            const maxAttempts = 20; // 20 lần x 500ms = 10 giây

            while (finalStatus === 'LOADING' && attempts < maxAttempts) {
                // Dừng 0.5s trước khi quét lại Database
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const [rows] = await db.query("SELECT status FROM Action WHERE id = ?", [currentActionId]);
                if (rows.length > 0 && rows[0].status !== 'LOADING') {
                    // Nếu mạch đã phản hồi (mqtt.js đã sửa chữ LOADING thành ON/OFF), thoát vòng lặp
                    finalStatus = rows[0].status;
                }
                attempts++;
            }

            // 5. Nếu sau 10s vòng lặp kết thúc mà vẫn LOADING -> Mất mạng
            if (finalStatus === 'LOADING') {
                console.log(`⏳ Timeout: Lệnh ${action} cho ${deviceName} thất bại. Trả về trạng thái cũ.`);
                
                // Rollback database về trạng thái ban đầu
                await db.query(
                    "UPDATE Action SET status = ? WHERE id = ?",
                    [initialState, currentActionId]
                );
                finalStatus = initialState; // Cập nhật biến để gửi về Frontend
            }

            // Trả về kèm theo finalStatus
            return { success: true, actionId: currentActionId, status: finalStatus };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
};

module.exports = deviceService;