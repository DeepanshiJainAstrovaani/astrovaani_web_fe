import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import styles from './AdminTable.module.css';

const statusOptions = [
  { label: 'Unsettled', count: 253 },
  { label: 'Settled', count: 2 },
];

const payments = [
  {
    bookingId: '234',
    vendor: 'Raghuvendra',
    date: '20 Sep 2025 , 02:15 PM',
    amount: 45,
    finalPayment: 35,
  },
  {
    bookingId: '153',
    vendor: 'Deepika Dayal',
    date: '20 Sep 2025',
    amount: 125,
    finalPayment: 105,
  },
];

const PaymentsPage = () => {
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('Unsettled');

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
        Next Settlement: <span style={{ fontWeight: 600 }}>27 September 2025</span> - <span style={{ color: '#1976d2', fontWeight: 600 }}>₹5,435</span>
        <span style={{ marginLeft: 32, fontWeight: 600 }}>20 Sep - 27 Sep Payments :</span> <span style={{ color: '#1976d2', fontWeight: 600 }}>₹15,435</span>
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
          {payments.map((p, idx) => (
            <tr key={idx}>
              <td>{p.bookingId}</td>
              <td>{p.vendor}</td>
              <td>{p.date}</td>
              <td>{p.amount}</td>
              <td>{p.finalPayment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsPage;
