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

export default function NotificationHistory() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all'); // all, sent, scheduled, failed
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filter, pagination.page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please login again.');
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const response = await fetch(
        `${API_URL}/notifications?page=${pagination.page}&limit=10${statusParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch notifications');
      }

      setNotifications(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete notification');
      }

      // Refresh list
      fetchNotifications();
      fetchStats();
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert(err.message || 'Failed to delete notification');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      sent: { color: '#4caf50', bg: '#e8f5e9', text: 'Sent' },
      scheduled: { color: '#2196f3', bg: '#e3f2fd', text: 'Scheduled' },
      sending: { color: '#ff9800', bg: '#fff3e0', text: 'Sending' },
      failed: { color: '#f44336', bg: '#ffebee', text: 'Failed' },
      draft: { color: '#9e9e9e', bg: '#f5f5f5', text: 'Draft' }
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        color: config.color,
        backgroundColor: config.bg
      }}>
        {config.text}
      </span>
    );
  };

  const getTargetTypeBadge = (targetType) => {
    const icons = {
      all: '👥',
      specific: '👤',
      segment: '📊'
    };
    return `${icons[targetType] || '📢'} ${targetType.charAt(0).toUpperCase() + targetType.slice(1)}`;
  };

  return (
    <div style={getStyles(isMobile).container}>
      <div style={getStyles(isMobile).header}>
        <h1 style={getStyles(isMobile).pageTitle}>Notification History</h1>
        <button
          onClick={() => navigate('/admin/notifications/send')}
          style={getStyles(isMobile).sendButton}
        >
          📤 Send New
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={getStyles(isMobile).statsContainer}>
          <div style={getStyles(isMobile).statCard}>
            <div style={getStyles(isMobile).statValue}>{stats.totalSent}</div>
            <div style={getStyles(isMobile).statLabel}>Total Sent</div>
          </div>
          <div style={getStyles(isMobile).statCard}>
            <div style={getStyles(isMobile).statValue}>{stats.totalDelivered}</div>
            <div style={getStyles(isMobile).statLabel}>Delivered</div>
          </div>
          <div style={getStyles(isMobile).statCard}>
            <div style={getStyles(isMobile).statValue}>{stats.totalScheduled}</div>
            <div style={getStyles(isMobile).statLabel}>Scheduled</div>
          </div>
          <div style={getStyles(isMobile).statCard}>
            <div style={getStyles(isMobile).statValue}>
              {stats.deviceBreakdown.expo + stats.deviceBreakdown.fcm + stats.deviceBreakdown.apns}
            </div>
            <div style={getStyles(isMobile).statLabel}>Active Devices</div>
          </div>
        </div>
      )}

      {/* Device Breakdown */}
      {stats && (
        <div style={getStyles(isMobile).deviceBreakdown}>
          <div style={getStyles(isMobile).deviceStat}>
            <span style={getStyles(isMobile).deviceIcon}>📱</span>
            <span style={getStyles(isMobile).deviceLabel}>Expo:</span>
            <span style={getStyles(isMobile).deviceValue}>{stats.deviceBreakdown.expo}</span>
          </div>
          <div style={getStyles(isMobile).deviceStat}>
            <span style={getStyles(isMobile).deviceIcon}>🔥</span>
            <span style={getStyles(isMobile).deviceLabel}>FCM:</span>
            <span style={getStyles(isMobile).deviceValue}>{stats.deviceBreakdown.fcm}</span>
          </div>
          <div style={getStyles(isMobile).deviceStat}>
            <span style={getStyles(isMobile).deviceIcon}>🍎</span>
            <span style={getStyles(isMobile).deviceLabel}>APNs:</span>
            <span style={getStyles(isMobile).deviceValue}>{stats.deviceBreakdown.apns}</span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={getStyles(isMobile).filterContainer}>
        {['all', 'sent', 'scheduled', 'failed'].map(f => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            style={{
              ...getStyles(isMobile).filterButton,
              ...(filter === f ? getStyles(isMobile).filterButtonActive : {})
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div style={getStyles(isMobile).errorBox}>
          {error}
        </div>
      )}

      {/* Notifications List */}
      {loading ? (
        <div style={getStyles(isMobile).loadingContainer}>
          <div style={getStyles(isMobile).spinner}></div>
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div style={getStyles(isMobile).emptyState}>
          <div style={getStyles(isMobile).emptyIcon}>📭</div>
          <h3 style={getStyles(isMobile).emptyTitle}>No notifications found</h3>
          <p style={getStyles(isMobile).emptyText}>
            {filter === 'all' 
              ? 'Send your first notification to get started!'
              : `No ${filter} notifications found.`}
          </p>
        </div>
      ) : (
        <div style={getStyles(isMobile).tableContainer}>
          <table style={getStyles(isMobile).table}>
            <thead>
              <tr style={getStyles(isMobile).tableHeaderRow}>
                <th style={getStyles(isMobile).tableHeader}>Title</th>
                {!isMobile && <th style={getStyles(isMobile).tableHeader}>Target</th>}
                <th style={getStyles(isMobile).tableHeader}>Status</th>
                {!isMobile && <th style={getStyles(isMobile).tableHeader}>Sent</th>}
                <th style={getStyles(isMobile).tableHeader}>Stats</th>
                <th style={getStyles(isMobile).tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(notification => (
                <tr key={notification._id} style={getStyles(isMobile).tableRow}>
                  <td style={getStyles(isMobile).tableCell}>
                    <div style={getStyles(isMobile).notificationTitle}>
                      {notification.title}
                    </div>
                    <div style={getStyles(isMobile).notificationBody}>
                      {notification.body}
                    </div>
                    {isMobile && (
                      <div style={getStyles(isMobile).mobileMeta}>
                        {getTargetTypeBadge(notification.targetType)}
                        {notification.sentAt && ` • ${formatDate(notification.sentAt)}`}
                      </div>
                    )}
                  </td>
                  {!isMobile && (
                    <td style={getStyles(isMobile).tableCell}>
                      {getTargetTypeBadge(notification.targetType)}
                    </td>
                  )}
                  <td style={getStyles(isMobile).tableCell}>
                    {getStatusBadge(notification.status)}
                  </td>
                  {!isMobile && (
                    <td style={getStyles(isMobile).tableCell}>
                      {formatDate(notification.sentAt || notification.scheduledFor)}
                    </td>
                  )}
                  <td style={getStyles(isMobile).tableCell}>
                    <div style={getStyles(isMobile).statsCell}>
                      <span style={getStyles(isMobile).statsSuccess}>
                        ✓ {notification.stats?.successCount || 0}
                      </span>
                      {notification.stats?.failureCount > 0 && (
                        <span style={getStyles(isMobile).statsFailed}>
                          ✗ {notification.stats.failureCount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={getStyles(isMobile).tableCell}>
                    <button
                      onClick={() => handleDelete(notification._id)}
                      style={getStyles(isMobile).deleteButton}
                      title="Delete notification"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={getStyles(isMobile).pagination}>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            style={getStyles(isMobile).paginationButton}
          >
            ← Previous
          </button>
          <span style={getStyles(isMobile).paginationInfo}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            style={getStyles(isMobile).paginationButton}
          >
            Next →
          </button>
        </div>
      )}
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
    marginBottom: isMobile ? '20px' : '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  pageTitle: {
    fontSize: isMobile ? '20px' : '24px',
    fontWeight: '600',
    color: '#101820',
    margin: 0,
  },
  sendButton: {
    padding: isMobile ? '10px 16px' : '10px 20px',
    backgroundColor: '#ffd600',
    border: 'none',
    borderRadius: '8px',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '600',
    color: '#000',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
    gap: isMobile ? '12px' : '16px',
    marginBottom: isMobile ? '16px' : '24px',
  },
  statCard: {
    background: '#ffffff',
    padding: isMobile ? '16px' : '20px',
    borderRadius: '12px',
    border: '1px solid #FAEAF9',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  statValue: {
    fontSize: isMobile ? '24px' : '32px',
    fontWeight: '700',
    color: '#101820',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: isMobile ? '12px' : '14px',
    color: '#666',
    fontWeight: '500',
  },
  deviceBreakdown: {
    display: 'flex',
    justifyContent: 'space-around',
    background: '#ffffff',
    padding: isMobile ? '12px' : '16px',
    borderRadius: '12px',
    border: '1px solid #FAEAF9',
    marginBottom: isMobile ? '16px' : '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  deviceStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: isMobile ? '13px' : '14px',
  },
  deviceIcon: {
    fontSize: '18px',
  },
  deviceLabel: {
    fontWeight: '600',
    color: '#666',
  },
  deviceValue: {
    fontWeight: '700',
    color: '#101820',
  },
  filterContainer: {
    display: 'flex',
    gap: isMobile ? '8px' : '12px',
    marginBottom: isMobile ? '16px' : '20px',
    flexWrap: 'wrap',
  },
  filterButton: {
    padding: isMobile ? '8px 16px' : '10px 20px',
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: '500',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterButtonActive: {
    backgroundColor: '#ffd600',
    borderColor: '#ffd600',
    color: '#000',
    fontWeight: '600',
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #ffd600',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: isMobile ? '40px 20px' : '60px 20px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #FAEAF9',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: '600',
    color: '#101820',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: isMobile ? '14px' : '15px',
    color: '#666',
  },
  tableContainer: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #FAEAF9',
    overflow: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    backgroundColor: '#f9f9f9',
    borderBottom: '2px solid #e0e0e0',
  },
  tableHeader: {
    padding: isMobile ? '12px 8px' : '16px 16px',
    textAlign: 'left',
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: '600',
    color: '#101820',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s',
  },
  tableCell: {
    padding: isMobile ? '12px 8px' : '16px 16px',
    fontSize: isMobile ? '13px' : '14px',
    color: '#333',
    verticalAlign: 'top',
  },
  notificationTitle: {
    fontWeight: '600',
    color: '#101820',
    marginBottom: '4px',
  },
  notificationBody: {
    fontSize: isMobile ? '12px' : '13px',
    color: '#666',
    marginBottom: isMobile ? '6px' : '0',
  },
  mobileMeta: {
    fontSize: '11px',
    color: '#999',
    marginTop: '6px',
  },
  statsCell: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statsSuccess: {
    color: '#4caf50',
    fontWeight: '600',
    fontSize: isMobile ? '12px' : '13px',
  },
  statsFailed: {
    color: '#f44336',
    fontWeight: '600',
    fontSize: isMobile ? '12px' : '13px',
  },
  deleteButton: {
    padding: '6px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'all 0.2s',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '24px',
    padding: '16px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #FAEAF9',
  },
  paginationButton: {
    padding: '8px 16px',
    backgroundColor: '#ffd600',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#000',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  },
});
