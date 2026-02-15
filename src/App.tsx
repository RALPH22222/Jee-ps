import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useEffect } from 'react';
import Login from './auth/login';
import PassengerMap from './pages/passenger/map';
import AdminDashboard from './pages/admin/dashboard';
import Register from './auth/register';
import UpdatePassword from './pages/UpdatePassword';
import Sidebar from './components/sidebar';
import JeepRegistration from './pages/admin/JeepRegistration';
import UserManagement from './pages/admin/UserManagement';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => (
  <div className="flex bg-gray-50 min-h-screen">
    <Sidebar />
    <div className="flex-1">
      <Outlet />
    </div>
  </div>
);
function App() {
  const location = useLocation();

  useEffect(() => {
    toast.dismiss();
  }, [location]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/passenger/map" element={<PassengerMap />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="register-jeep" element={<JeepRegistration />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
