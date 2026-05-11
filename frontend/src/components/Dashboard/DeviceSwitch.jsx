import React from 'react';

const DeviceSwitch = ({ label, status, loading, icon, onToggle }) => {
  return (
    <div className="device-item">
      <div className="device-info">
        {/* Nơi hiển thị Icon được truyền vào */}
        <span className="device-icon">{icon}</span>
        
        <div style={{textAlign: 'left'}}>
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