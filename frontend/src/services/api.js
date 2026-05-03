import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
});

// API điều khiển thiết bị[cite: 1]
export const controlDevice = (deviceName, action) => 
    api.post('/devices/control', { device: deviceName, action });

// API lấy lịch sử hoạt động (phân trang, lọc, tìm kiếm)[cite: 5, 6]
export const getActionHistory = (params) => 
    api.get('/actions/history', { params });
// --- MỚI: Gọi API lấy danh sách Dropdown ---
export const getSensorsList = async () => {
    const res = await api.get('/sensors/list');
    return res.data.data; 
};

// --- ĐÃ SỬA: Truyền params (đã chứa search và sensor_id) xuống Backend ---
export const getSensorHistory = async (params) => {
    const res = await api.get('/sensors/history', { params: params });
    return res.data;
};
// API lấy dữ liệu cảm biến
// export const getSensorData = (params) => 
//     api.get('/sensors', { params });

// API lấy dữ liệu vẽ biểu đồ cho Dashboard
export const getDailyChartData = async () => {
    // Gọi đúng đường dẫn /dashboard đã khai báo ở Backend
    const res = await api.get('/sensors/dashboard'); 
    
    // Vì Backend trả về { success: true, data: [...] }
    // Nên ta cần return res.data.data để Frontend lấy được đúng cái mảng dữ liệu
    return res.data.data; 
};

export default api;