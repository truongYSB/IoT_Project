const db = require('../config/db');
const { publishMessage } = require('./mqttService');

const deviceService = {
    controlDevice: async (deviceName, action) => {
        try {
            const [devices] = await db.query("SELECT id FROM Device WHERE name = ?", [deviceName]);
            if (devices.length === 0) throw new Error("Device not found");
            const deviceId = devices[0].id;

            // 1. Tìm trạng thái thực tế gần nhất (ON/OFF) để biết trạng thái bắt đầu
            const [lastAction] = await db.query(
                "SELECT status FROM Action WHERE device_id = ? AND status IN ('ON', 'OFF') ORDER BY id DESC LIMIT 1",
                [deviceId]
            );
            // Trạng thái cũ là status của bản ghi gần nhất, nếu chưa có thì lấy ngược lại lệnh hiện tại
            const initialState = lastAction.length > 0 ? lastAction[0].status : (action === 'ON' ? 'OFF' : 'ON');

            // 2. Lưu trạng thái LOADING (Cột action giữ lệnh người dùng bấm)
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

            // 4. Xử lý Timeout sau 10 giây
            setTimeout(async () => {
                const [rows] = await db.query("SELECT status FROM Action WHERE id = ?", [currentActionId]);
                
                if (rows.length > 0 && rows[0].status === 'LOADING') {
                    console.log(`⏳ Timeout: Lệnh ${action} cho ${deviceName} thất bại. Trạng thái hiện tại vẫn là ${initialState}`);
                    
                    // CHỈ CẬP NHẬT cột status về trạng thái ban đầu, KHÔNG sửa cột action
                    await db.query(
                        "UPDATE Action SET status = ? WHERE id = ?",
                        [initialState, currentActionId]
                    );
                }
            }, 10000);

            return { success: true, actionId: currentActionId };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
};

module.exports = deviceService;