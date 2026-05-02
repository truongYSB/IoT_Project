require('dotenv').config(); // Load cấu hình từ file .env
const express = require("express");
const cors = require("cors");
const http = require("http"); // Module tích hợp sẵn của Node.js
const { Server } = require("socket.io");
const { initMqtt } = require('./services/mqttService'); // Import bằng destructuring[cite: 3]

const app = express();
const server = http.createServer(app); // Tạo HTTP server để Socket.io có thể chạy cùng[cite: 3]

// Khởi tạo Socket.io với cấu hình CORS cho phép ReactJS kết nối[cite: 3]
const io = new Server(server, {
    cors: {
        origin: "*", // Cho phép tất cả các nguồn (có thể đổi thành localhost:3000 để bảo mật hơn)
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// API mặc định kiểm tra server
app.get("/", (req, res) => {
    res.send("Backend IoT System is running...");
});

// Truyền đối tượng 'io' vào hàm khởi tạo MQTT để bắt đầu luồng dữ liệu[cite: 3]
initMqtt(io);

// Lấy port từ .env hoặc mặc định là 5000[cite: 3]
const PORT = process.env.PORT || 5000;

// QUAN TRỌNG: Phải dùng server.listen (thay vì app.listen) để Socket.io hoạt động[cite: 3]
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Dashboard will update every 2 seconds via Socket.io`);
});