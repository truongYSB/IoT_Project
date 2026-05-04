import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDeviceStats } from '../services/api';

const DeviceStats = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDeviceStats(selectedDate);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
      }
    };
    fetchData();
  }, [selectedDate]);

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '10px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-blue)' }}>Thống kê thiết bị</h3>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
        />
      </div>

      <div style={{ width: '100%', height: 500 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="device_name" />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
            <Bar dataKey="on_count" name="Số lần ON" fill="var(--status-on)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="off_count" name="Số lần OFF" fill="var(--status-off)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DeviceStats;