import React, { useState, useEffect } from 'react';
import { getActionHistory, getDevicesList } from '../services/api'; 
import './ActionHistory.css';

const ActionHistory = () => {
  const [data, setData] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    device_id: '',
    search: '',
    order: 'DESC'
  });

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const list = await getDevicesList();
        setDeviceList(list);
      } catch (err) {
        console.error("Lỗi tải danh sách thiết bị:", err);
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
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

  const getStatusClass = (status) => {
    if (!status) return '';
    const s = status.toUpperCase();
    if (s.includes('ON')) return 'status-on';
    if (s.includes('OFF')) return 'status-off';
    if (s.includes('LOADING')) return 'status-loading';
    return '';
  };

  const emptyRows = 10 - data.length; 

  return (
    <div className="data-sensor-container">
      <div className="search-filter-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm hành động, thời gian (DD/MM/YYYY)..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>

        <select
          className="select-filter"
          value={filters.device_id}
          onChange={(e) => setFilters({ ...filters, device_id: e.target.value, page: 1 })}
        >
          <option value="">Tất cả thiết bị</option>
          {deviceList.map(dev => (
            <option key={dev.id} value={dev.id}>{dev.name}</option>
          ))}
        </select>

        <button className="btn-action" onClick={() => setFilters({
          ...filters,
          order: filters.order === 'DESC' ? 'ASC' : 'DESC'
        })}>
          {filters.order === 'DESC' ? 'Mới nhất' : 'Cũ nhất'} <i className="fa fa-sort"></i>
        </button>
      </div>

      <div className="table-wrapper">
        <table className="sensor-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Thiết bị</th>
              <th>Hành động</th>
              <th>Trạng thái</th> {/* THÊM CỘT NÀY */}
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td className="text-blue">{item.device_name}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(item.action)}`}>
                    {item.action}
                  </span>
                </td>
                {/* HIỂN THỊ GIÁ TRỊ STATUS TỪ DATABASE */}
                <td>
                  <span className={`status-badge ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  {new Date(item.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                  })}
                </td>
              </tr>
            ))}

            {/* Cập nhật bù đủ 5 cột cho dòng trống */}
            {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, i) => (
              <tr key={`empty-${i}`} style={{ height: '45px' }}>
                <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="pagination-group">
          <button className="left" disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
            &lt; Trước
          </button>
          <button className="page-number">Trang {filters.page} / {totalPages}</button>
          <button className="right" disabled={filters.page >= totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>
            Sau &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionHistory;