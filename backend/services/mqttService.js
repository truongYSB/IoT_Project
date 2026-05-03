const mqtt = require('mqtt');
const db = require('../config/db');

let client;

const initMqtt = (io) => {
    // 1. Khởi tạo kết nối tới Broker[cite: 3]
    client = mqtt.connect(process.env.MQTT_HOST, {
        port: parseInt(process.env.MQTT_PORT),
        username: process.env.MQTT_USER,
        password: process.env.MQTT_PASS
    });

    client.on('connect', () => {
        console.log('✅ MQTT Service: Connected to Broker.');
        // Đăng ký nhận dữ liệu cảm biến và phản hồi trạng thái[cite: 3]
        client.subscribe(process.env.TOPIC_SENSOR);
        client.subscribe(process.env.TOPIC_STATUS); 
    });

    client.on('message', async (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            
            // --- LOG DEBUG: Giúp bạn kiểm tra dữ liệu ESP32 gửi về ---
            // console.log(`📩 Message received on [${topic}]`);
            // console.log("Payload:", data);

            // Xử lý phản hồi xác nhận (ACK) từ Hardware[cite: 3]
            if (topic === process.env.TOPIC_STATUS) {
                if (data.status === 'success' && data.actionId) {
                    // Nếu thành công, cập nhật trạng thái bản ghi thành SUCCESS[cite: 3]
                    await db.query(
                        "UPDATE Action SET status = 'SUCCESS' WHERE id = ?", 
                        [data.actionId]
                    );
                    console.log(`✅ Transaction Confirmed: Action ID ${data.actionId} is now SUCCESS.`);
                    
                    // Thông báo cho Frontend qua Socket.io (nếu cần)
                    io.emit('device-status-updated', { actionId: data.actionId, status: 'SUCCESS' });
                }
            } 
            // Xử lý dữ liệu cảm biến định kỳ (mỗi 2 giây)[cite: 3]
            else if (topic === process.env.TOPIC_SENSOR) {
                const query = "INSERT INTO Data_Sensor (sensor_id, value) VALUES ?";
                const values = [
                    [1, data.temp], 
                    [2, data.humidity], 
                    [3, data.light_lux]
                ];
                await db.query(query, [values]);

                // Phát dữ liệu tới các Client đang kết nối Dashboard[cite: 3]
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
        // Gửi chuỗi JSON lệnh điều khiển xuống topic[cite: 3]
        client.publish(topic, JSON.stringify(payload), { qos: 1 });
    } else {
        console.error("❌ MQTT Client is not connected. Message dropped.");
    }
};

module.exports = { initMqtt, publishMessage };