const mqtt = require('mqtt');

// Cấu hình các thông số kết nối từ file .env
const mqttOptions = {
    port: parseInt(process.env.MQTT_PORT),
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS,
    keepalive: 60,
    reconnectPeriod: 1000 // Tự động kết nối lại sau 1s nếu mất mạng
};

const mqttClient = mqtt.connect(process.env.MQTT_HOST, mqttOptions);

mqttClient.on('error', (err) => {
    console.error('❌ MQTT: Connection error:', err.message);
});

module.exports = mqttClient;