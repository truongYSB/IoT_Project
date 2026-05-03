const mqtt = require('mqtt');
const db = require('../config/db');

// Khai báo biến client ở ngoài để dùng chung cho cả init và publish
let client;

const initMqtt = (io) => {
    client = mqtt.connect(process.env.MQTT_HOST, {
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
            const query = "INSERT INTO Data_Sensor (sensor_id, value) VALUES ?";
            const values = [[1, data.temp], [2, data.humidity], [3, data.light_lux]];
            await db.query(query, [values]);

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

// --- ĐỊNH NGHĨA HÀM PUBLISH ĐANG THIẾU ---
const publishMessage = (topic, payload) => {
    if (client && client.connected) {
        client.publish(topic, JSON.stringify(payload), { qos: 1 });
        console.log(`📤 Đã gửi lệnh tới MQTT: ${topic}`);
    } else {
        console.error("❌ MQTT chưa kết nối, không thể gửi lệnh!");
    }
};

// QUAN TRỌNG: Phải export cả 2 hàm này
module.exports = { initMqtt, publishMessage };