import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getDeviceStats } from '../services/api';
import '../pages/DeviceStats.css';
import { FaSyncAlt } from 'react-icons/fa';

const DailyDeviceChart = ({ date, dayTotal, deviceDetails }) => {
  return (
    <div className="daily-chart-container">
      <div className="daily-chart-header">
        <h4>📅 Ngày: {date.split('-').reverse().join('/')}</h4>
        <div className="daily-total-badges">
          <span className="badge-on">Tổng ON: {dayTotal.total_on}</span>
          <span className="badge-off">Tổng OFF: {dayTotal.total_off}</span>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={deviceDetails}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
            <XAxis dataKey="device_name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip cursor={{fill: 'transparent'}} />
            <Legend />
            <Bar dataKey="on_count" name="Số lần ON" fill="var(--status-on)" radius={[4, 4, 0, 0]} barSize={40} />
            <Bar dataKey="off_count" name="Số lần OFF" fill="var(--status-off)" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const DeviceStats = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (start, end) => {
    // Sử dụng múi giờ Việt Nam để validation
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });

    if (start && start > today) {
      setError("Ngày bắt đầu không được vượt quá ngày hôm nay.");
      setStats(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await getDeviceStats(start, end);

      if (res.data.success) {
        setStats(res.data.data);
        const { startDate: metaStart, endDate: metaEnd } = res.data.meta;
        if (!start) setStartDate(metaStart);
        if (!end) setEndDate(metaEnd);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối máy chủ");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate]);

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setError(null);
  };

  return (
    <div className="page-container">
      <div className="stats-card">
        <div className="header-filters">
          <h2>Thống kê chi tiết thiết bị</h2>
          <div className="filter-group">
            <input 
              type="date" 
              className="date-input"
              value={startDate || ''} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
            <span>đến</span>
            <input 
              type="date" 
              className="date-input"
              value={endDate || ''} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
            <button className="reset-button" onClick={handleReset}><FaSyncAlt className="icon-spin-hover" /> <span>Làm mới</span></button>
          </div>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải dữ liệu...</div>
        ) : stats ? (
          <>
            <div className="overall-summary">
              <div className="summary-card on">
                <p>Tổng lượt bật (Toàn bộ)</p>
                <h2 style={{ color: 'var(--status-on)' }}>{stats.overallTotal.on}</h2>
              </div>
              <div className="summary-card off">
                <p>Tổng lượt tắt (Toàn bộ)</p>
                <h2 style={{ color: 'var(--status-off)' }}>{stats.overallTotal.off}</h2>
              </div>
            </div>

            <h3 style={{ marginBottom: '20px', color: '#555' }}>Chi tiết hoạt động từng ngày</h3>
            
            {stats.dailyTotal.length > 0 ? (
              stats.dailyTotal.map((day) => (
                <DailyDeviceChart 
                  key={day.date}
                  date={day.date}
                  dayTotal={day}
                  deviceDetails={stats.dailyDeviceDetail.filter(item => item.date === day.date)}
                />
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>Không có dữ liệu thiết bị nào.</p>
            )}
          </>
        ) : (
          !error && <p style={{ textAlign: 'center' }}>Không tìm thấy dữ liệu.</p>
        )}
      </div>
    </div>
  );
};

export default DeviceStats;