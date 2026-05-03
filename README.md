# Tạo Frontend:
B1: vào thư mục frontend
    cd frontend
B2: Chạy lệnh bên dưới và chọn React, JavaScript rồi nhấn Enter
    npm create vite@latest .
B4: Cài các thư viện
    npm install react-router-dom axios socket.io-client recharts react-icons
B3: Chạy frontend
    npm run dev

# Tạo Backend
B1: vào thư mục backend
    cd backend
B2: Chạy lệnh khởi tạo NodeJS
    npm init -y
B4: Cài package
    npm install express cors dotenv mqtt mysql2 socket.io
B5: Cài nodemon
    npm install --save-dev nodemon
B6: Sửa package.json backend, Thêm:
    "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js"
    }
B7: Tạo server backend
B8: Chạy backend
    npm run dev

# Sơ đồ backend
backend/
├── config/
│   ├── db.js          # Kết nối MySQL/MongoDB
│   └── mqtt.js        # Cấu hình kết nối tới MQTT Broker (192.168.1.103)
├── controllers/
│   ├── sensorController.js  # Xử lý logic cho trang Dashboard & Data Sensor
│   ├── actionController.js  # Xử lý logic cho trang Action History
│   └── deviceController.js  # Xử lý điều khiển thiết bị (Publish MQTT)
├── models/
│   ├── sensorModel.js       # Định nghĩa bảng dữ liệu cảm biến
│   ├── dataSensorModel.js   # Đây là Model quan trọng nhất, xử lý toàn bộ dữ liệu đo đạc từ ESP32 gửi về
│   ├── deviceModel.js       # Quản lý danh sách các thiết bị trong hệ thống
│   └── actionModel.js       # Định nghĩa bảng lịch sử hoạt động
├── routes/
│   ├── sensorRoutes.js      # Các API liên quan đến cảm biến
│   ├── actionRoutes.js      # Các API liên quan đến nhật ký
│   └── deviceRoutes.js      # API điều khiển thiết bị
├── services/
│   └── mqttService.js       # File quan trọng nhất: Lắng nghe MQTT và lưu vào
    └── sensorService.js     # Xử lý dữ liệu cho trang Dashboard và trang Data Sensor
    └── deviceService.js     # Xử lý điều khiển thiết bị từ Web và lưu vào bảng Action
    └── actionService.js     # Xử lý dữ liệu cho trang Action History 
DB
├── server.js                # File chạy chính của Node.js
└── package.json

# Sơ đồ frontend

frontend/
├── public/
├── src/
│   ├── assets/             # Hình ảnh, icons, file CSS toàn cục
│   ├── components/         # Các thành phần giao diện tái sử dụng
│   │   ├── Common/         # Navbar, Sidebar, Footer, LoadingSpinner
│   │   ├── Dashboard/      # SensorCard, Chart, DeviceSwitch
│   │   └── UI/             # Button, Table, Pagination, InputSearch
│   ├── hooks/              # Custom hooks (ví dụ: useSocket)
│   ├── layouts/            # Bố cục trang (MainLayout)
│   ├── pages/              # 4 Trang chính của hệ thống
│   │   ├── Dashboard.jsx      # Trang tổng quan (Real-time 2s/lần)
│   │   ├── DataSensor.jsx     # Trang lịch sử dữ liệu (Phân trang, lọc)
│   │   ├── ActionHistory.jsx  # Trang nhật ký thiết bị
│   │   └── Profile.jsx        # Trang thông tin cá nhân
│   ├── services/           # Quản lý gọi API (Axios instance)
│   ├── utils/              # Hàm bổ trợ (Format ngày tháng, đơn vị Lux)
│   ├── App.js              # Cấu hình Routing (react-router-dom)
│   └── main.jsx            # Điểm khởi đầu của ứng dụng
├── .env                    # Lưu BACKEND_URL (http://localhost:5000)
├── package.json
└── vite.config.js

# Trạng thái phản hồi
Trạng thái phản hồi (Status Codes):

200 OK: Mọi thứ đều ổn.

400 Bad Request: Người dùng gửi thiếu dữ liệu (ví dụ: bấm bật đèn nhưng không nói đèn nào).

500 Internal Server Error: Lỗi phía máy chủ hoặc CSDL.

# TEST

3. Cách xử lý phía Frontend (ReactJS) để trang Lịch sử không bị nhảy
Yêu cầu của bạn là: Dashboard cập nhật liên tục, Lịch sử chỉ cập nhật khi load trang.

Tại trang Dashboard:
Bạn sẽ lắng nghe sự kiện từ Socket.io.

JavaScript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Dashboard() {
    const [sensorData, setSensorData] = useState({});

    useEffect(() => {
        socket.on('update-sensor', (data) => {
            setSensorData(data); // Cập nhật state mỗi khi có dữ liệu mới (2s)
        });
        return () => socket.off('update-sensor');
    }, []);

    return <div>Nhiệt độ hiện tại: {sensorData.temp}</div>;
}
Tại trang Lịch sử dữ liệu (Data Sensor):
Bạn không dùng Socket.io ở đây. Bạn chỉ dùng axios để gọi API lấy dữ liệu một lần duy nhất khi vào trang.

JavaScript
function SensorHistory() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Chỉ gọi API một lần khi component mount (vào trang)
        fetchHistory(); 
    }, []); // Mảng rỗng đảm bảo nó không chạy lại trừ khi reload trang

    const fetchHistory = async () => {
        const res = await axios.get('http://localhost:5000/api/sensors/history');
        setHistory(res.data.data);
    };

    return (
        <table>
            {/* Hiển thị bảng tĩnh, không bị nhảy dòng mỗi 2 giây */}
        </table>
    );
}
Tóm lại logic:
Backend: Khi nhận được tin từ MQTT, dùng io.emit() để "hét" lên cho tất cả cùng nghe.

Dashboard: Mở tai ra nghe (socket.on), nên dữ liệu nhảy liên tục mỗi 2 giây.

Lịch sử: Đóng tai lại, không nghe Socket. Chỉ lấy dữ liệu cũ từ Database thông qua API khi mới vào trang. Việc này giúp bảng dữ liệu của bạn đứng yên để người dùng dễ dàng xem và lọc.