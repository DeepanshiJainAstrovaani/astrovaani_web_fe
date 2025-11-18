import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import FreeKundali from '../pages/FreeKundali';
import Blog from '../pages/Blog';
import FAQ from '../pages/FAQ';
import Login from '../components/Auth/Login';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import AdminRoutes from './admin/AdminRoutes';
import VendorInterview from '../pages/VendorInterview';

const AdminScheduleRedirect = () => {
  const { vendorId } = useParams();
  return <Navigate to={`/admin/schedule/${vendorId}`} replace />;
};

const AppRoutes = () => (
  <Router>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/free-kundali" element={<FreeKundali />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/interview" element={<VendorInterview />} />
      
      {/* Auth Route */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Admin Routes */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute>
            <AdminRoutes />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/schedule/:vendorId" 
        element={
          <ProtectedRoute>
            <AdminScheduleRedirect />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Router>
);

export default AppRoutes;
