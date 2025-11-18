import React from 'react';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import AdminDashboardLayout from '../../components/admin/AdminDashboardLayout';
import VendorsPage from '../../pages/admin/VendorsPage';
import CustomersPage from '../../pages/admin/CustomersPage';
import BookingsPage from '../../pages/admin/BookingsPage';
import InterviewsPage from '../../pages/admin/InterviewsPage';
import PaymentsPage from '../../pages/admin/PaymentsPage';
import OffersPage from '../../pages/admin/OffersPage';
import NotificationsPage from '../../pages/admin/NotificationsPage';
import BlogPage from '../../pages/admin/BlogPage';
import EnquiriesPage from '../../pages/admin/EnquiriesPage';
import EditVendor from '../../pages/admin/EditVendor';
import SchedulePage from '../../pages/admin/SchedulePage';
import InterviewFeedback from '../../pages/admin/InterviewFeedback';

const RequireAdmin = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  return isAdmin ? children : <Navigate to="/login" />;
};

const AdminRoutes = () => (
  <Routes>
    <Route
      element={
        <RequireAdmin>
          <AdminDashboardLayout>
            <Outlet />
          </AdminDashboardLayout>
        </RequireAdmin>
      }
    >
      <Route path="vendors" element={<VendorsPage />} />
      <Route path="customers" element={<CustomersPage />} />
      <Route path="bookings" element={<BookingsPage />} />
      <Route path="interviews" element={<InterviewsPage />} />
      <Route path="interview/:id" element={<InterviewFeedback />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="offers" element={<OffersPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="blog" element={<BlogPage />} />
      <Route path="enquiries" element={<EnquiriesPage />} />
      <Route path="edit-vendor/:id" element={<EditVendor />} />
      <Route path="schedule/:vendorId" element={<SchedulePage />} />
      <Route path="*" element={<Navigate to="vendors" />} />
    </Route>
  </Routes>
);

export default AdminRoutes;
