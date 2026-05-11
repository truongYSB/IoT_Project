import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
});

// API điều khiển thiết bị
export const controlDevice = (deviceName, action) => 
    api.post('/devices/control', { device: deviceName, action });

// API lấy lịch sử hoạt động (phân trang, lọc, tìm kiếm)
export const getActionHistory = (params) => 
    api.get('/actions/history', { params });
// Lấy danh sách thiết bị
export const getDevicesList = async () => {
    const res = await api.get('/actions/list'); // Đường dẫn tùy theo route bạn đặt
    return res.data.data; 
};

// API lấy trạng thái hiện tại của tất cả thiết bị
export const getCurrentDeviceStates = async () => {
    const res = await api.get('/actions/current-states');
    return res.data.data;
};

// Gọi API lấy danh sách cảm biến
export const getSensorsList = async () => {
    const res = await api.get('/sensors/list');
    return res.data.data; 
};

// Truyền params (đã chứa search và sensor_id) xuống Backend
export const getSensorHistory = async (params) => {
    const res = await api.get('/sensors/history', { params: params });
    return res.data;
};


// API lấy dữ liệu vẽ biểu đồ cho Dashboard
export const getDailyChartData = async () => {
    // Gọi đúng đường dẫn /dashboard đã khai báo ở Backend
    const res = await api.get('/sensors/dashboard'); 
    return res.data.data; 
};

export const getDeviceStats = (startDate, endDate) => 
    api.get('/actions/stats', { params: { startDate, endDate } });

export default api;