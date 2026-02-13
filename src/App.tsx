import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/login';
import PassengerMap from './pages/passenger/map';
import AdminDashboard from './pages/admin/dashboard';
import Register from './auth/register';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/passenger/map" element={<PassengerMap />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  )
}

export default App
