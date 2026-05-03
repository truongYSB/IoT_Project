import React, { useState, useEffect } from 'react';
import { getActionHistory } from '../services/api';
import './ActionHistory.css';

const ActionHistory = () => {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    device: 'All',
    search: 'DTH11' // Mặc định theo ảnh của bạn
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Gọi API lấy nhật ký điều khiển
        const res = await getActionHistory(filters);
        if (res.data.success) {
          setData(res.data.data);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        console.error("Lỗi tải lịch sử hoạt động:", err);
      }
    };
    fetchHistory();
  }, [filters]);

  // Hàm helper để định dạng màu sắc trạng thái giống trong ảnh
  const getStatusClass = (status) => {
    if (status === 'ON') return 'status-on';
    if (status === 'OFF') return 'status-off';
    if (status === 'LOADING') return 'status-loading';
    return '';
  };

  return (
    <div className="action-history-container">
      {/* Thanh công cụ tìm kiếm và lọc */}
      <div className="top-tools">
        <div className="search-box">
          <input 
            type="text" 
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button className="btn-tool disabled">Lọc ⏳</button>
        <button className="btn-tool active">Sắp xếp ▾</button>
      </div>

      {/* Bảng nhật ký thiết bị */}
      <table className="action-table">
        <thead>
          <tr>
            <th>ID Thiết bị</th>
            <th>Tên thiết bị</th>
            <th>Hành động</th>
            <th>Trạng thái</th>
            <th>Thời gian</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.device_id || 1}</strong></td>
              <td className="device-name-link">{item.device_name}</td>
              <td className={getStatusClass(item.action)}>{item.action}</td>
              <td className={getStatusClass(item.status)}>{item.status}</td>
              <td>{new Date(item.createdAt).toLocaleString('vi-VN')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Thanh phân trang */}
      <div className="pagination-wrapper">
        <button 
          className="page-btn"
          disabled={filters.page <= 1}
          onClick={() => setFilters({...filters, page: filters.page - 1})}
        >
          ‹ Trước
        </button>
        <span className="current-page">Trang {filters.page}</span>
        <button 
          className="page-btn"
          disabled={filters.page >= totalPages}
          onClick={() => setFilters({...filters, page: filters.page + 1})}
        >
          Sau ›
        </button>
      </div>
    </div>
  );
};

export default ActionHistory;