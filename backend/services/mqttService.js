const mqtt = require('mqtt');
const db = require('../config/db');

let client;

const initMqtt = (io) => {
    // Khởi tạo kết nối tới Broker
    client = mqtt.connect(process.env.MQTT_HOST, {
        port: parseInt(process.env.MQTT_PORT),
        username: process.env.MQTT_USER,
        password: process.env.MQTT_PASS
    });

    client.on('connect', () => {
        console.log('✅ MQTT Service: Connected to Broker.');
        // Đăng ký nhận dữ liệu cảm biến và phản hồi trạng thái
        client.subscribe(process.env.TOPIC_SENSOR);
        client.subscribe(process.env.TOPIC_STATUS);
    });

    client.on('message', async (topic, message) => {
        try {
            const data = JSON.parse(message.toString());

            // Xử lý phản hồi xác nhận (ACK) từ Hardware
            if (topic === process.env.TOPIC_STATUS) {
                if (data.status === 'success' && data.actionId) {
                    // Lấy giá trị của cột 'action' từ bản ghi hiện tại
                    const [rows] = await db.query("SELECT action FROM Action WHERE id = ?", [data.actionId]);

                    if (rows.length > 0) {
                        const finalState = rows[0].action; // Đây sẽ là "ON" hoặc "OFF"

                        // Cập nhật 'status' bằng chính giá trị 'action' đó
                        await db.query(
                            "UPDATE Action SET status = ? WHERE id = ?",
                            [finalState, data.actionId]
                        );
                        console.log(`✅ Xác nhận thành công: Action ID ${data.actionId} đã chuyển sang ${finalState}`);
                    }
                }
            }
            // Xử lý dữ liệu cảm biến định kỳ (mỗi 2 giây)
            else if (topic === process.env.TOPIC_SENSOR) {
                const query = "INSERT INTO Data_Sensor (sensor_id, value) VALUES ?";
                const values = [
                    [1, data.temp],
                    [2, data.humidity],
                    [3, data.light_lux]
                ];
                await db.query(query, [values]);

                // Phát dữ liệu tới các Client đang kết nối Dashboard
                io.emit('sensor-data-realtime', {
                    ...data,
                    time: new Date().toLocaleTimeString()
                });
            }
        } catch (err) {
            console.error("❌ MQTT Message Processing Error:", err.message);
        }
    });
};

const publishMessage = (topic, payload) => {
    if (client && client.connected) {
        // Gửi chuỗi JSON lệnh điều khiển xuống topic
        client.publish(topic, JSON.stringify(payload), { qos: 1 });
    } else {
        console.error("❌ MQTT Client is not connected. Message dropped.");
    }
};

module.exports = { initMqtt, publishMessage };