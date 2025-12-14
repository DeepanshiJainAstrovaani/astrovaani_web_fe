import React, { useState } from 'react';
import styles from './AdminTable.module.css';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';

const statusOptions = [
  { label: 'In Process', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];


const API_BASE = process.env.REACT_APP_API_URL;

const BookingsPage = () => {
  const [activeStatus, setActiveStatus] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // WhatsApp notification modal state
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [whatsappError, setWhatsappError] = useState('');
  const [whatsappSuccess, setWhatsappSuccess] = useState('');

  const fetchBookings = async (status) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/booking`, {
        params: status !== 'all' ? { status } : {},
      });
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBookings(activeStatus);
  }, [activeStatus]);

  const handleNotifyClick = (booking) => {
    setSelectedBooking(booking);
    setWhatsappMessage('');
    setWhatsappError('');
    setWhatsappSuccess('');
    setShowNotifyModal(true);
  };

  const handleSendWhatsapp = async () => {
    if (!whatsappMessage.trim()) {
      setWhatsappError('Message is required');
      return;
    }

    if (!selectedBooking?.user_id?.mobile) {
      setWhatsappError('User mobile number not available');
      return;
    }

    setSendingWhatsapp(true);
    setWhatsappError('');
    setWhatsappSuccess('');

    try {
      // Send through backend API to avoid CORS issues
      const response = await axios.post(
        `${API_BASE}/booking/${selectedBooking._id}/notify`,
        {
          message: whatsappMessage,
          templateName: 'sendotp'
        }
      );

      if (response.data?.success) {
        setWhatsappSuccess('WhatsApp message sent successfully!');
        setTimeout(() => {
          setShowNotifyModal(false);
        }, 2000);
      } else {
        setWhatsappError(response.data?.message || 'Failed to send WhatsApp message');
      }
    } catch (err) {
      setWhatsappError(err.response?.data?.message || err.response?.data?.error || 'Failed to send WhatsApp message');
    } finally {
      setSendingWhatsapp(false);
    }
  };

  // Filter bookings by search term
  const filteredBookings = bookings.filter(b => {
    const values = [
      b._id,
      b.user_id?.name,
      b.user_id?.mobile,
      b.booking_date && new Date(b.booking_date).toLocaleString(),
      b.total_amount,
      b.status
    ];
    return values.some(val =>
      val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className={styles['admin-container']}>
      <div className={styles['search-bar']}>
        <input
          type="text"
          placeholder="Search any booking"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', fontSize: '16px' }}
        />
      </div>
      <div>
        {statusOptions.map(opt => (
          <button
            key={opt.label}
            className={
              activeStatus === opt.value
                ? `${styles['status-btn']} ${styles['status-btn-active']}`
                : `${styles['status-btn']} ${styles['status-btn-inactive']}`
            }
            onClick={() => setActiveStatus(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div>Loading bookings...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table className={styles['admin-table']}>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Duration</th>
              <th>Booking Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center' }}>No bookings found.</td>
              </tr>
            ) : (
              filteredBookings.map(b => (
                <tr key={b._id}>
                  <td>{b._id}</td>
                  <td>{b.user_id?.name || b.user_id?.mobile || '-'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{b.bookingtype || '-'}</td>
                  <td>{b.duration ? `${b.duration} min` : '-'}</td>
                  <td>{new Date(b.booking_date).toLocaleString()}</td>
                  <td>{b.total_amount}</td>
                  <td>{b.status}</td>
                  <td>
                    <button
                      className={styles['action-btn']}
                      onClick={() => handleNotifyClick(b)}
                      title="Send WhatsApp notification"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FaBell size={14} /> Notify
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* WhatsApp Notification Modal */}
      {showNotifyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            <h3 style={{ marginTop: 0 }}>Send WhatsApp Notification</h3>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              To: <strong>{selectedBooking?.user_id?.name || 'Customer'}</strong> ({selectedBooking?.user_id?.mobile})
            </p>
            
            {whatsappError && (
              <div style={{ padding: '12px', background: '#fee', color: '#c33', borderRadius: '4px', marginBottom: '12px' }}>
                {whatsappError}
              </div>
            )}
            
            {whatsappSuccess && (
              <div style={{ padding: '12px', background: '#efe', color: '#363', borderRadius: '4px', marginBottom: '12px' }}>
                {whatsappSuccess}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Message *</label>
              <textarea
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                placeholder="Enter your personalized message..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setShowNotifyModal(false)}
                disabled={sendingWhatsapp}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendWhatsapp}
                disabled={sendingWhatsapp}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#25D366',
                  color: '#fff',
                  cursor: sendingWhatsapp ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {sendingWhatsapp ? 'Sending...' : 'Send WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
