import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import FreeKundali from '../pages/FreeKundali';
import Blog from '../pages/Blog';
import FAQ from '../pages/FAQ';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import AdminRoutes from './admin/AdminRoutes';
import VendorInterview from '../pages/VendorInterview';

const AdminScheduleRedirect = () => {
  const { vendorId } = useParams();
  return <Navigate to={`/admindashboard/schedule/${vendorId}`} replace />;
};

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/free-kundali" element={<FreeKundali />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/faq" element={<FAQ />} />
      
      {/* Public vendor interview slot selection page */}
      <Route path="/interview" element={<VendorInterview />} />
      
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/schedule/:vendorId" element={<AdminScheduleRedirect />} />
      <Route path="/admindashboard/*" element={<AdminRoutes />} />
    </Routes>
  </Router>
);

export default AppRoutes;
