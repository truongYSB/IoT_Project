import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import DataSensor from './pages/DataSensor';
import ActionHistory from './pages/ActionHistory';
import Profile from './pages/Profile';
import DeviceStats from './pages/DeviceStats';

function App() {
  return (
    <Router>
      <Routes>
        {/* MainLayout bao bọc tất cả các trang con */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="data-sensor" element={<DataSensor />} />
          <Route path="action-history" element={<ActionHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="device-stats" element={<DeviceStats />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;