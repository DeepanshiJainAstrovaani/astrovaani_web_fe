import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Auth/Login';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import AdminRoutes from './admin/AdminRoutes';
import JoinUs from '../pages/JoinUs';
import VendorInterview from '../pages/VendorInterview';

const AppRoutes = () => (
  <Router>
    <Routes>
      {/* TEMPORARILY DISABLED - Uncomment when ready */}
      {/* <Route path="/" element={<Home />} /> */}
      {/* <Route path="/free-kundali" element={<FreeKundali />} /> */}
      {/* <Route path="/blogs" element={<Blog />} /> */}
      {/* <Route path="/blog/:id" element={<BlogDetail />} /> */}
      {/* <Route path="/faq" element={<FAQ />} /> */}
      
      {/* ACTIVE ROUTES */}
      <Route path="/" element={<JoinUs />} />
      
      {/* Public interview slot selection page (accessed via WhatsApp link) */}
      <Route path="/interview" element={<VendorInterview />} />
      
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
      
      {/* Redirect all other routes to / for now */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default AppRoutes;
