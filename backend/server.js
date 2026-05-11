require('dotenv').config(); // Load cấu hình từ .env
const express = require("express");
const cors = require("cors");
const http = require("http"); // Module tích hợp sẵn của Node.js
const { Server } = require("socket.io");
const { initMqtt } = require('./services/mqttService'); // Import hàm khởi tạo MQTT

// Import tất cả các Routes để phục vụ API
const sensorRoutes = require('./routes/sensorRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const actionRoutes = require('./routes/actionRoutes');

const app = express();
const server = http.createServer(app); // Tạo HTTP server để chạy song song Socket.io

// Cấu hình Socket.io để đẩy dữ liệu lên Dashboard mỗi 2 giây
const io = new Server(server, {
    cors: {
        origin: "*", // Cho phép ReactJS kết nối từ bất kỳ port nào
        methods: ["GET", "POST"]
    }
});

// --- MIDDLEWARE ---
app.use(cors()); // Cho phép gọi API từ Frontend
app.use(express.json()); // Để xử lý dữ liệu JSON từ các yêu cầu POST

// --- REGISTER ROUTES (Khai báo API) ---
app.use('/api/sensors', sensorRoutes); // Các API cho Dashboard & Data Sensor
app.use('/api/devices', deviceRoutes); // API điều khiển thiết bị
app.use('/api/actions', actionRoutes); // API xem nhật ký hoạt động

// API mặc định kiểm tra trạng thái server
app.get("/", (req, res) => {
    res.send("🚀 Backend IoT System is fully operational with WebSockets!");
});

// --- INITIALIZE MQTT ---
// Truyền 'io' vào để mỗi khi có dữ liệu từ ESP32 (2s/lần), nó sẽ tự động đẩy lên Dashboard
initMqtt(io);

const PORT = process.env.PORT || 5000;

// --- START SERVER ---
// QUAN TRỌNG: Dùng server.listen thay vì app.listen để kích hoạt tính năng Real-time
server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 API Endpoints are active.`);
    console.log(`📡 Socket.io is broadcasting on port ${PORT}`);
});