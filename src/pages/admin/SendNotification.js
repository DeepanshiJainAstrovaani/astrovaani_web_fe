import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Responsive helper hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

export default function SendNotification() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    targetType: 'all', // all, specific, segment
    targetUsers: [], // array of user IDs for specific targeting
    targetSegment: '', // new_users, active_users, inactive_users
    data: {},
    imageUrl: '',
    priority: 'default',
    sound: 'default',
    clickAction: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.body.trim()) {
      setError('Title and message are required');
      return;
    }

    if (formData.targetType === 'specific' && formData.targetUsers.length === 0) {
      setError('Please enter at least one User ID for specific targeting');
      return;
    }

    if (formData.targetType === 'segment' && !formData.targetSegment) {
      setError('Please select a user segment');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please login again.');
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      const payload = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        targetType: formData.targetType,
        priority: formData.priority,
        sound: formData.sound,
        data: {
          clickAction: formData.clickAction || '',
          ...formData.data
        }
      };

      // Add optional fields
      if (formData.imageUrl) payload.imageUrl = formData.imageUrl;
      if (formData.targetType === 'specific') payload.targetUsers = formData.targetUsers;
      if (formData.targetType === 'segment') payload.targetSegment = formData.targetSegment;

      const response = await fetch(`${API_URL}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send notification');
      }

      const notif = data.data;
      setSuccess(`✅ Notification sent successfully! Delivered to ${notif.stats?.successCount || 0} device(s).`);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          title: '',
          body: '',
          targetType: 'all',
          targetUsers: [],
          targetSegment: '',
          data: {},
          imageUrl: '',
          priority: 'default',
          sound: 'default',
          clickAction: ''
        });
        setSuccess('');
      }, 3000);

    } catch (err) {
      console.error('Error sending notification:', err);
      setError(err.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={getStyles(isMobile).container}>
      <div style={getStyles(isMobile).header}>
        <h1 style={getStyles(isMobile).pageTitle}>Send Push Notification</h1>
        <button
          onClick={() => navigate('/admin/notifications/history')}
          style={getStyles(isMobile).historyButton}
        >
          📋 View History
        </button>
      </div>

      <div style={getStyles(isMobile).card}>
        {error && (
          <div style={getStyles(isMobile).errorBox}>
            {error}
          </div>
        )}

        {success && (
          <div style={getStyles(isMobile).successBox}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={getStyles(isMobile).form}>
          {/* Notification Title */}
          <div style={getStyles(isMobile).formGroup}>
            <label style={getStyles(isMobile).label}>
              Notification Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., New Offer Available!"
              style={getStyles(isMobile).input}
              maxLength={50}
            />
            <span style={getStyles(isMobile).hint}>
              {formData.title.length}/50 characters
            </span>
          </div>

          {/* Notification Body */}
          <div style={getStyles(isMobile).formGroup}>
            <label style={getStyles(isMobile).label}>
              Notification Message *
            </label>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleInputChange}
              placeholder="Enter your notification message here..."
              style={getStyles(isMobile).textarea}
              rows={4}
              maxLength={200}
            />
            <span style={getStyles(isMobile).hint}>
              {formData.body.length}/200 characters
            </span>
          </div>

          {/* Target Type */}
          <div style={getStyles(isMobile).formGroup}>
            <label style={getStyles(isMobile).label}>
              Send To
            </label>
            <select
              name="targetType"
              value={formData.targetType}
              onChange={handleInputChange}
              style={getStyles(isMobile).select}
            >
              <option value="all">All Users</option>
              <option value="specific">Specific Users</option>
              <option value="segment">User Segment</option>
            </select>
          </div>

          {/* Specific User IDs (conditional) */}
          {formData.targetType === 'specific' && (
            <div style={getStyles(isMobile).formGroup}>
              <label style={getStyles(isMobile).label}>
                User IDs (comma-separated) *
              </label>
              <input
                type="text"
                name="targetUsers"
                value={formData.targetUsers.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  targetUsers: e.target.value.split(',').map(id => id.trim()).filter(id => id)
                }))}
                placeholder="e.g., 507f1f77bcf86cd799439011, 507f1f77bcf86cd799439012"
                style={getStyles(isMobile).input}
              />
              <span style={getStyles(isMobile).hint}>
                Enter user IDs separated by commas
              </span>
            </div>
          )}

          {/* User Segment (conditional) */}
          {formData.targetType === 'segment' && (
            <div style={getStyles(isMobile).formGroup}>
              <label style={getStyles(isMobile).label}>
                Select Segment *
              </label>
              <select
                name="targetSegment"
                value={formData.targetSegment}
                onChange={handleInputChange}
                style={getStyles(isMobile).select}
              >
                <option value="">-- Choose Segment --</option>
                <option value="new_users">New Users (Last 30 days)</option>
                <option value="active_users">Active Users (Last 30 days)</option>
                <option value="inactive_users">Inactive Users (30+ days)</option>
                <option value="all">All Users</option>
              </select>
            </div>
          )}

          {/* Image URL (Optional) */}
          <div style={getStyles(isMobile).formGroup}>
            <label style={getStyles(isMobile).label}>
              Image URL (Optional)
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              style={getStyles(isMobile).input}
            />
            <span style={getStyles(isMobile).hint}>
              Rich notification with image (supports Expo, FCM, APNs)
            </span>
          </div>

          {/* Priority */}
          <div style={getStyles(isMobile).formGroup}>
            <label style={getStyles(isMobile).label}>
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              style={getStyles(isMobile).select}
            >
              <option value="default">Default</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
            <span style={getStyles(isMobile).hint}>
              High priority notifications may bypass battery optimization
            </span>
          </div>

          {/* Click Action (Optional) */}
          <div style={getStyles(isMobile).formGroup}>
            <label style={getStyles(isMobile).label}>
              Click Action (Optional)
            </label>
            <input
              type="text"
              name="clickAction"
              value={formData.clickAction}
              onChange={handleInputChange}
              placeholder="e.g., open_bookings, open_profile"
              style={getStyles(isMobile).input}
            />
            <span style={getStyles(isMobile).hint}>
              Deep link action for app navigation
            </span>
          </div>

          {/* Submit Button */}
          <div style={getStyles(isMobile).buttonWrapper}>
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              style={getStyles(isMobile).cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...getStyles(isMobile).submitButton,
                ...(loading ? getStyles(isMobile).submitButtonDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? '📤 Sending...' : '📤 Send Notification'}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div style={getStyles(isMobile).infoBox}>
          <h3 style={getStyles(isMobile).infoTitle}>ℹ️ Multi-Platform Support</h3>
          <ul style={getStyles(isMobile).infoList}>
            <li>✅ <strong>Expo</strong>: iOS & Android via Expo Push Notifications</li>
            <li>✅ <strong>FCM</strong>: Android via Firebase Cloud Messaging</li>
            <li>✅ <strong>APNs</strong>: iOS via Apple Push Notification Service</li>
            <li>Keep titles short and catchy (max 50 chars)</li>
            <li>Messages should be clear and actionable (max 200 chars)</li>
            <li>All sent notifications are logged in history</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const getStyles = (isMobile) => ({
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: isMobile ? '16px' : '24px',
    fontFamily: '"Roboto", sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isMobile ? '16px' : '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  pageTitle: {
    fontSize: isMobile ? '20px' : '24px',
    fontWeight: '600',
    color: '#101820',
    margin: 0,
  },
  historyButton: {
    padding: isMobile ? '10px 16px' : '10px 20px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '500',
    color: '#101820',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #FAEAF9',
    padding: isMobile ? '20px 16px' : '32px 24px',
    borderRadius: '12px',
    maxWidth: '800px',
    margin: '0 auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  errorBox: {
    padding: isMobile ? '12px 14px' : '14px 16px',
    backgroundColor: '#fff3f3',
    border: '1px solid #ffcdd2',
    borderRadius: '8px',
    color: '#d32f2f',
    fontSize: isMobile ? '14px' : '15px',
    marginBottom: '20px',
    fontWeight: '500',
  },
  successBox: {
    padding: isMobile ? '12px 14px' : '14px 16px',
    backgroundColor: '#e8f5e9',
    border: '1px solid #a5d6a7',
    borderRadius: '8px',
    color: '#2e7d32',
    fontSize: isMobile ? '14px' : '15px',
    marginBottom: '20px',
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  formGroup: {
    marginBottom: isMobile ? '20px' : '24px',
  },
  label: {
    display: 'block',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '600',
    color: '#101820',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: isMobile ? '12px 14px' : '12px 16px',
    fontSize: isMobile ? '14px' : '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontFamily: '"Roboto", sans-serif',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: isMobile ? '12px 14px' : '12px 16px',
    fontSize: isMobile ? '14px' : '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontFamily: '"Roboto", sans-serif',
    resize: 'vertical',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: isMobile ? '12px 14px' : '12px 16px',
    fontSize: isMobile ? '14px' : '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontFamily: '"Roboto", sans-serif',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  hint: {
    display: 'block',
    fontSize: isMobile ? '12px' : '13px',
    color: '#666',
    marginTop: '6px',
    fontStyle: 'italic',
  },
  buttonWrapper: {
    display: 'flex',
    gap: isMobile ? '12px' : '16px',
    marginTop: isMobile ? '24px' : '32px',
    flexWrap: 'wrap',
  },
  cancelButton: {
    flex: isMobile ? '1 1 100%' : '0 1 auto',
    padding: isMobile ? '14px 24px' : '12px 32px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: isMobile ? '15px' : '16px',
    fontWeight: '600',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButton: {
    flex: isMobile ? '1 1 100%' : '1 1 auto',
    padding: isMobile ? '14px 24px' : '12px 32px',
    background: '#ffd600',
    border: 'none',
    borderRadius: '8px',
    fontSize: isMobile ? '15px' : '16px',
    fontWeight: '600',
    color: '#000',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  infoBox: {
    marginTop: isMobile ? '32px' : '40px',
    padding: isMobile ? '16px' : '20px',
    backgroundColor: '#f9f9f9',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
  },
  infoTitle: {
    fontSize: isMobile ? '15px' : '16px',
    fontWeight: '600',
    color: '#101820',
    marginBottom: '12px',
    marginTop: 0,
  },
  infoList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: isMobile ? '13px' : '14px',
    color: '#666',
    lineHeight: '1.8',
  },
});
