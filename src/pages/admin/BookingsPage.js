import React, { useState } from 'react';
import styles from './AdminTable.module.css';

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
              <th>Booking Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>No bookings found.</td>
              </tr>
            ) : (
              filteredBookings.map(b => (
                <tr key={b._id}>
                  <td>{b._id}</td>
                  <td>{b.user_id?.name || b.user_id?.mobile || '-'}</td>
                  <td>{new Date(b.booking_date).toLocaleString()}</td>
                  <td>{b.total_amount}</td>
                  <td>{b.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingsPage;
