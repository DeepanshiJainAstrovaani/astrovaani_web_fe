import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import FreeKundali from '../pages/FreeKundali';
import Blog from '../pages/Blog';
import FAQ from '../pages/FAQ';
import Login from '../components/Auth/Login';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import AdminRoutes from './admin/AdminRoutes';
import VendorInterview from '../pages/VendorInterview';
import JoinUs from '../pages/JoinUs';

const AppRoutes = () => (
  <Router>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/free-kundali" element={<FreeKundali />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/interview" element={<VendorInterview />} />
      <Route path="/joinus" element={<JoinUs />} />
      
      {/* Auth Route */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Admin Routes - Support both /admin and /admindashboard paths */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute>
            <AdminRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admindashboard/*" 
        element={
          <ProtectedRoute>
            <AdminRoutes />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Router>
);

export default AppRoutes;
