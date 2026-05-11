import React, { useState, useEffect } from 'react';
import { getSensorHistory, getSensorsList } from '../services/api';
import './DataSensor.css';

const DataSensor = () => {
    const [data, setData] = useState([]);
    const [sensorList, setSensorList] = useState([]); // Chứa danh sách cảm biến từ DB
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        sensor_id: '',
        order: 'DESC'
    });
    const [totalPages, setTotalPages] = useState(1);

    // Lấy danh sách cảm biến khi khởi tạo trang
    useEffect(() => {
        const fetchList = async () => {
            try {
                const list = await getSensorsList();
                setSensorList(list);
            } catch (err) {
                console.error("Lỗi tải danh sách cảm biến:", err);
            }
        };
        fetchList();
    }, []);

    // Tải dữ liệu lịch sử khi bộ lọc thay đổi
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getSensorHistory(filters);
                if (res.success) {
                    setData(res.data);
                    setTotalPages(res.totalPages);
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu lịch sử:", err);
            }
        };
        fetchHistory();
    }, [filters]);

    // Hàm đảo ngược thứ tự sắp xếp
    const toggleOrder = () => {
        setFilters({
            ...filters,
            order: filters.order === 'DESC' ? 'ASC' : 'DESC'
        });
    };

    // TÍNH TOÁN DÒNG TRỐNG
    const emptyRows = filters.limit - data.length;

    return (
        <div className="data-sensor-container">
            {/* Thanh tìm kiếm và bộ lọc Dropdown */}
            <div className="search-filter-section">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên cảm biến, giá trị, thời gian (Chuẩn định dạng DD/MM/YYYY)"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                </div>

                {/* Dropdown lọc theo ID cảm biến */}
                <div className={`filter-wrapper ${isOpen ? 'is-open' : ''}`}>
                    <select
                        className="select-filter"
                        value={filters.sensor_id}
                        onMouseDown={() => setIsOpen(!isOpen)} // Toggle khi click để mở
                        onBlur={() => setIsOpen(false)}        // Đóng khi click ra ngoài
                        onChange={(e) => {
                            setFilters({ ...filters, sensor_id: e.target.value, page: 1 });
                            setIsOpen(false);
                        }}
                    >
                        <option value="">Tất cả cảm biến</option>
                        {sensorList.map(sensor => (
                            <option key={sensor.id} value={sensor.id}>{sensor.name}</option>
                        ))}
                    </select>
                </div>

                <button className="btn-action" onClick={toggleOrder}>
                    {filters.order === 'DESC' ? 'Mới nhất' : 'Cũ nhất'} <i className="fa fa-sort"></i>
                </button>
            </div>

            {/* Bảng dữ liệu */}
            <div className="table-wrapper">
                <table className="sensor-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên cảm biến</th>
                            <th>Giá trị</th>
                            <th>Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Hiển thị dữ liệu thật */}
                        {data.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td className="text-blue">{item.sensor_name}</td>
                                <td><strong>{item.value}</strong></td>
                                <td>
                                    {new Date(item.createdAt).toLocaleString('vi-VN', {
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                                    })}
                                </td>
                            </tr>
                        ))}

                        {/* Hiển thị các dòng trống để đủ 10 dòng */}
                        {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
                            <tr key={`empty-${index}`} className="empty-row">
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            <div className="pagination-container">
                <button
                    className="left"
                    disabled={filters.page <= 1}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                    &lt; Trước
                </button>
                <button className="page-number">Trang {filters.page} / {totalPages}</button>
                <button
                    className="right"
                    disabled={filters.page >= totalPages}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                    Sau &gt;
                </button>
            </div>
        </div>
    );
};

export default DataSensor;