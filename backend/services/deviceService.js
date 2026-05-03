const db = require('../config/db');
const { publishMessage } = require('./mqttService');

const deviceService = {
    controlDevice: async (deviceName, action) => {
        try {
            // 1. Lấy ID thiết bị và trạng thái cuối cùng trước đó
            const [devices] = await db.query("SELECT id FROM Device WHERE name = ?", [deviceName]);
            if (devices.length === 0) throw new Error("Device not found");
            const deviceId = devices[0].id;

            // Lấy trạng thái trước đó để phục vụ trường hợp rollback (nếu 10s không phản hồi)
            const [lastAction] = await db.query(
                "SELECT action FROM Action WHERE device_id = ? AND status != 'LOADING' ORDER BY createdAt DESC LIMIT 1",
                [deviceId]
            );
            const previousState = lastAction.length > 0 ? lastAction[0].action : (action === 'ON' ? 'OFF' : 'ON');

            // 2. Lưu trạng thái LOADING vào SQL trước
            const [result] = await db.query(
                "INSERT INTO Action (device_id, action, status) VALUES (?, ?, ?)",
                [deviceId, action, 'LOADING']
            );
            const currentActionId = result.insertId;

            // 3. Gửi lệnh MQTT kèm theo actionId
            const payload = { 
                device: deviceName.toLowerCase(), 
                state: action, 
                actionId: currentActionId 
            };
            publishMessage(process.env.TOPIC_CONTROL, payload);

            // 4. Thiết lập Timeout 10 giây
            setTimeout(async () => {
                const [checkStatus] = await db.query("SELECT status FROM Action WHERE id = ?", [currentActionId]);
                
                // Nếu sau 10s vẫn là LOADING thì coi như thất bại, thực hiện rollback
                if (checkStatus.length > 0 && checkStatus[0].status === 'LOADING') {
                    console.log(`⏳ Timeout: Device ${deviceName} không phản hồi. Đang rollback về ${previousState}`);
                    await db.query(
                        "UPDATE Action SET action = ?, status = 'FAILED (Timeout)' WHERE id = ?", 
                        [previousState, currentActionId]
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