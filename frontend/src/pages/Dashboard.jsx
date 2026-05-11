import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { controlDevice, getDailyChartData, getCurrentDeviceStates } from '../services/api';
import SensorCard from '../components/Dashboard/SensorCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DeviceSwitch from '../components/Dashboard/DeviceSwitch';
import { FaFan, FaLightbulb, FaTintSlash, FaTv, FaPlug } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const sensorData = useSocket('sensor-data-realtime');
  const [historyData, setHistoryData] = useState([]);
  const MAX_HISTORY_POINTS = 30;

  // State quản lý trạng thái BẬT/TẮT
  const [devices, setDevices] = useState({
    light: 'OFF',
    fan: 'OFF',
    air_purifier: 'OFF',
    device4: 'OFF',
    device5: 'OFF'
  });

  // State quản lý hiệu ứng LOADING riêng biệt
  const [isLoading, setIsLoading] = useState({
    light: false,
    fan: false,
    air_purifier: false,
    device4: false,
    device5: false
  });


  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getDailyChartData();
        if (data && data.length > 0) {
          const formattedData = data.map(item => ({
            time: new Date(item.timestamp).getTime(),
            temp: item.temp,
            lux: (item.light_lux > 2000 ? 2000 : item.light_lux) / 100,
            humi: item.humidity
          })).slice(-MAX_HISTORY_POINTS);
          setHistoryData(formattedData);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu lịch sử:", err);
      }
    };

    fetchHistory();
  }, []);

  // Load trạng thái hiện tại của các thiết bị khi component mount
  useEffect(() => {
    const fetchDeviceStates = async () => {
      try {
        const states = await getCurrentDeviceStates();
        if (states) {
          setDevices(states);
        }
      } catch (err) {
        console.error("Lỗi lấy trạng thái thiết bị:", err);
      }
    };

    fetchDeviceStates();
  }, []);

  useEffect(() => {
    if (sensorData) {
      let testLux = sensorData.light_lux;
      if (testLux > 2000) {
        testLux = 2000;
      }

      setHistoryData(prev => {
        const nextHistory = [
          ...prev,
          {
            time: new Date().getTime(),
            temp: sensorData.temp,
            lux: testLux / 100,
            humi: sensorData.humidity
          }
        ];

        return nextHistory.length > MAX_HISTORY_POINTS
          ? nextHistory.slice(-MAX_HISTORY_POINTS)
          : nextHistory;
      });
    }
  }, [sensorData]);

  // Hàm điều khiển thiết bị
  const handleToggle = async (deviceName, currentState) => {
    const nextAction = currentState === 'ON' ? 'OFF' : 'ON';

    setDevices(prev => ({ ...prev, [deviceName]: nextAction }));
    setIsLoading(prev => ({ ...prev, [deviceName]: true }));

    try {
      const apiDeviceName = deviceName === 'air_purifier' ? 'air purifier' : deviceName;
      const res = await controlDevice(apiDeviceName, nextAction);

      if (res.data && res.data.success) {
        const finalState = res.data.data?.status || res.data.status || nextAction;
        setDevices(prev => ({ ...prev, [deviceName]: finalState }));
      } else {
        throw new Error("Backend báo lỗi không thể bật/tắt thiết bị");
      }
    } catch (err) {
      setDevices(prev => ({ ...prev, [deviceName]: currentState }));
      console.error("Lỗi điều khiển, đã quay về trạng thái cũ:", err);
    } finally {
      setIsLoading(prev => ({ ...prev, [deviceName]: false }));
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sensor-grid">
        <SensorCard title="TEMPERATURE" value={sensorData?.temp || 0} unit="°C" type="temperature" />
        <SensorCard title="LUMINOSITY" value={sensorData?.light_lux || 0} unit="Lux" type="luminosity" />
        <SensorCard title="HUMIDITY" value={sensorData?.humidity || 0} unit="%" type="humidity" />
      </div>

      <div className="bottom-section">
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData.slice(-MAX_HISTORY_POINTS)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="time"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                axisLine={false}
                tick={false}
                tickLine={false}
              />

              <YAxis />

              <Tooltip labelFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString('vi-VN')} />

              <Legend />
              <Line type="monotone" dataKey="temp" stroke="var(--chart-temp)" name="Temperature (°C)" dot={false} />
              <Line type="monotone" dataKey="lux" stroke="var(--chart-lumi)" name="Luminosity (Lux/100)" dot={false} />
              <Line type="monotone" dataKey="humi" stroke="var(--chart-humi)" name="Humidity (%)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="control-panel">
          {/* Truyền icon vào qua prop */}
          <DeviceSwitch
            label="Fan"
            icon={<FaFan style={{ color: 'var(--icon-fan)' }} />}
            status={devices.fan}
            loading={isLoading.fan}
            onToggle={() => handleToggle('fan', devices.fan)}
          />

          <DeviceSwitch
            label="Light"
            icon={<FaLightbulb style={{ color: 'var(--primary-orange)' }} />}
            status={devices.light}
            loading={isLoading.light}
            onToggle={() => handleToggle('light', devices.light)}
          />

          <DeviceSwitch
            label="Air Purifier"
            icon={<FaTintSlash style={{ color: 'var(--icon-fan)' }} />}
            status={devices.air_purifier}
            loading={isLoading.air_purifier}
            onToggle={() => handleToggle('air_purifier', devices.air_purifier)}
          />
          <DeviceSwitch
            label="Thiết bị 4"
            icon={<FaTv style={{ color: 'var(--primary-blue)' }} />}
            status={devices.device4}
            loading={isLoading.device4}
            onToggle={() => handleToggle('device4', devices.device4)}
          />

          <DeviceSwitch
            label="Thiết bị 5"
            icon={<FaPlug style={{ color: '#8e44ad' }} />}
            status={devices.device5}
            loading={isLoading.device5}
            onToggle={() => handleToggle('device5', devices.device5)}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;