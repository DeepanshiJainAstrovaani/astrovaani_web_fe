import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL;

  // Check if admin is already logged in (on app load)
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      
      if (token && adminData) {
        setIsAuthenticated(true);
        setAdmin(JSON.parse(adminData));
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Send OTP to admin's WhatsApp
  const sendOTP = async (phoneNumber) => {
    try {
      const response = await axios.post(`${API_URL}/admin-auth/send-otp`, {
        phoneNumber
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send OTP' 
      };
    }
  };

  // Verify OTP and login
  const verifyOTP = async (phoneNumber, otp) => {
    try {
      const response = await axios.post(`${API_URL}/admin-auth/verify-otp`, {
        phoneNumber,
        otp
      });

      const { token, admin: adminData } = response.data;

      // Store in localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(adminData));

      // Update state
      setIsAuthenticated(true);
      setAdmin(adminData);

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid OTP' 
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setIsAuthenticated(false);
    setAdmin(null);
  };

  const value = {
    isAuthenticated,
    admin,
    loading,
    sendOTP,
    verifyOTP,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
