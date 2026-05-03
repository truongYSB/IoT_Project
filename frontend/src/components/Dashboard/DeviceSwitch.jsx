// src/components/Dashboard/DeviceSwitch.jsx
import React from 'react';
// Import file CSS chứa style của nút gạt vào đây (nếu bạn đang để chung ở Dashboard.css thì có thể tách phần CSS của nút sang DeviceSwitch.css)

const DeviceSwitch = ({ label, status, loading, icon, onToggle }) => {
  return (
    <div className="device-item">
      <div className="device-info">
        {/* Nơi hiển thị Icon được truyền vào */}
        <span className="device-icon">{icon}</span>
        
        <div>
          <div className="device-label">{label}</div>
          <div className={`device-status font-mono ${loading ? 'LOADING' : status}`}>
            {loading ? 'LOADING' : status}
          </div>
        </div>
      </div>
      
      <label className="switch">
        <input
          type="checkbox"
          checked={status === 'ON'}
          onChange={onToggle}
          disabled={loading}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default DeviceSwitch;