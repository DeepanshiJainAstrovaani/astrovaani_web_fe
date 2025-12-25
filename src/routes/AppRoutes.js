import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import FreeKundali from '../pages/FreeKundali';
import Blog from '../pages/Blog';
import BlogDetail from '../pages/BlogDetail';
import FAQ from '../pages/FAQ';
import Login from '../components/Auth/Login';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import AdminRoutes from './admin/AdminRoutes';
import VendorInterview from '../pages/VendorInterview';
import JoinUs from '../pages/JoinUs';

const AppRoutes = () => (
  <Router>
    <Routes>
      {/* TEMPORARILY DISABLED - Uncomment when ready */}
      {/* <Route path="/" element={<Home />} /> */}
      {/* <Route path="/free-kundali" element={<FreeKundali />} /> */}
      {/* <Route path="/blogs" element={<Blog />} /> */}
      {/* <Route path="/blog/:id" element={<BlogDetail />} /> */}
      {/* <Route path="/faq" element={<FAQ />} /> */}
      {/* <Route path="/interview" element={<VendorInterview />} /> */}
      
      {/* ACTIVE ROUTES */}
      <Route path="/" element={<JoinUs />} />
      
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
