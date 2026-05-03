import React from 'react';
import './SensorCard.css';

const SensorCard = ({ title, value, unit, type }) => {
  return (
    <div className={`sensor-card ${type}`}>
      <div className="blur-overlay">
        <div className="sensor-info">
          <h3 className="sensor-title">{title}</h3>
          <div className="sensor-value">
            {value}<span>{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorCard;