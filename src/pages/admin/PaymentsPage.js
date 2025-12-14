import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { fetchBookings } from '../../api/bookingApi';
import styles from './AdminTable.module.css';

const PaymentsPage = () => {
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('Unsettled');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchBookings();
        const bookings = data.bookings || [];
        
        // Transform bookings to payment records
        const paymentRecords = bookings
          .filter(b => b.status === 'completed') // Only completed bookings
          .map(b => ({
            bookingId: b._id || '',
            vendor: b.vendor_id?.name || 'Unknown',
            date: b.booking_date ? new Date(b.booking_date).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) : '',
            amount: Number(b.total_amount || 0),
            finalPayment: Number(b.total_amount || 0) * 0.85, // 85% after 15% commission
            payment_status: b.payment_status || 'pending',
            createdAt: b.createdAt,
          }));

        setPayments(paymentRecords);
        
        // Debug: Check payment statuses
        const statusCounts = paymentRecords.reduce((acc, p) => {
          acc[p.payment_status] = (acc[p.payment_status] || 0) + 1;
          return acc;
        }, {});
        console.log('Payment status breakdown:', statusCounts);
        
        // Show sample of each status
        Object.keys(statusCounts).forEach(status => {
          const sample = paymentRecords.find(p => p.payment_status === status);
          console.log(`Sample ${status}:`, sample);
        });
      } catch (e) {
        console.error('Error loading payments:', e);
        setPayments([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const unsettledPayments = payments.filter(p => p.payment_status === 'pending' || p.payment_status === 'failed');
  const settledPayments = payments.filter(p => p.payment_status === 'completed' || p.payment_status === 'paid' || p.payment_status === 'settled');
  
  const statusOptions = [
    { label: 'Unsettled', count: unsettledPayments.length },
    { label: 'Settled', count: settledPayments.length },
  ];

  const displayedPayments = activeStatus === 'Unsettled' ? unsettledPayments : settledPayments;
  const filteredPayments = displayedPayments.filter(p => 
    p.bookingId.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate totals
  const nextSettlementAmount = unsettledPayments.reduce((sum, p) => sum + p.finalPayment, 0);
  const weekTotal = payments
    .filter(p => {
      const paymentDate = new Date(p.createdAt);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return paymentDate >= weekAgo;
    })
    .reduce((sum, p) => sum + p.finalPayment, 0);

  const nextSettlementDate = new Date();
  nextSettlementDate.setDate(nextSettlementDate.getDate() + 7);
  const formattedSettlementDate = nextSettlementDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={styles['admin-container']}>
      {/* Search Bar */}
      <div className={styles['search-bar']}>
        <FaSearch color="#222" size={20} />
        <input
          type="text"
          placeholder="Search any booking status by booking id"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Status Buttons */}
      <div>
        {statusOptions.map(opt => (
          <button
            key={opt.label}
            className={
              activeStatus === opt.label
                ? `${styles['status-btn']} ${styles['status-btn-active']}`
                : `${styles['status-btn']} ${styles['status-btn-inactive']}`
            }
            onClick={() => setActiveStatus(opt.label)}
          >
            {opt.label} ({opt.count})
          </button>
        ))}
      </div>

      {/* Settlement Info */}
      <div style={{ margin: '18px 0 10px 0', fontWeight: 500 }}>
        Next Settlement: <span style={{ fontWeight: 600 }}>{formattedSettlementDate}</span> - <span style={{ color: '#1976d2', fontWeight: 600 }}>₹{nextSettlementAmount.toLocaleString('en-IN')}</span>
        <span style={{ marginLeft: 32, fontWeight: 600 }}>Last 7 Days Payments:</span> <span style={{ color: '#1976d2', fontWeight: 600 }}>₹{weekTotal.toLocaleString('en-IN')}</span>
        <button type="button" className={styles['action-btn']} style={{ color: '#d32f2f', marginLeft: 16 }}>Filter</button>
      </div>

      {/* Payments Table */}
      <table className={styles['admin-table']}>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Vendor</th>
            <th>Booking Date</th>
            <th>Amount</th>
            <th>Final Payment</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5}>Loading...</td></tr>
          ) : filteredPayments.length === 0 ? (
            <tr><td colSpan={5}>No payments found</td></tr>
          ) : (
            filteredPayments.map((p, idx) => (
              <tr key={idx}>
                <td>{p.bookingId}</td>
                <td>{p.vendor}</td>
                <td>{p.date}</td>
                <td>₹{p.amount.toLocaleString('en-IN')}</td>
                <td>₹{p.finalPayment.toLocaleString('en-IN')}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsPage;
