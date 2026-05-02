const mqtt = require('mqtt');
const db = require('../config/db');

/**
 * Khởi tạo kết nối MQTT và lắng nghe dữ liệu từ ESP32
 * @param {Server} io - Đối tượng Socket.io để đẩy dữ liệu real-time
 */
const initMqtt = (io) => {
    // Kết nối tới MQTT Broker dựa trên biến môi trường
    const client = mqtt.connect(process.env.MQTT_HOST, {
        port: parseInt(process.env.MQTT_PORT),
        username: process.env.MQTT_USER,
        password: process.env.MQTT_PASS
    });

    client.on('connect', () => {
        console.log('✅ MQTT Service: Connected and subscribing...');
        client.subscribe(process.env.TOPIC_SENSOR);
    });

    client.on('message', async (topic, message) => {
        try {
            const data = JSON.parse(message.toString());

            // 1. Lưu vào Database MySQL (XAMPP)
            // Lưu ý: Đảm bảo bảng Sensor đã có các ID 1, 2, 3 tương ứng
            const query = "INSERT INTO Data_Sensor (sensor_id, value) VALUES ?";
            const values = [
                [1, data.temp],      // ID 1: Nhiệt độ
                [2, data.humidity],  // ID 2: Độ ẩm
                [3, data.light_lux]  // ID 3: Ánh sáng
            ];
            await db.query(query, [values]);

            // 2. Gửi dữ liệu REAL-TIME tới Frontend thông qua Socket.io[cite: 2]
            // Sự kiện này sẽ phát đi mỗi 2 giây (theo tốc độ gửi của ESP32)
            io.emit('sensor-data-realtime', {
                temp: data.temp,
                humidity: data.humidity,
                light: data.light_lux,
                room_id: data.room_id || "bedroom01",
                time: new Date().toLocaleTimeString()
            });

        } catch (err) {
            console.error("❌ Lỗi xử lý dữ liệu MQTT:", err.message);
        }
    });
};

// Xuất hàm dưới dạng object để tránh lỗi TypeError: initMqtt is not a function[cite: 2]
module.exports = { initMqtt };