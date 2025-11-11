import React, { useState } from 'react';
import styles from './AdminTable.module.css';

const statusOptions = [
  { label: 'In Process', count: 253 },
  { label: 'Completed', count: 2 },
  { label: 'Cancelled', count: 2 },
];

const BookingsPage = () => {
  const [activeStatus, setActiveStatus] = useState('In Process');

  return (
    <div className={styles['admin-container']}>
      <div className={styles['search-bar']}>Search Bar Placeholder</div>
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
          <tr>
            <td>234</td>
            <td>Raghuvendra</td>
            <td>20 Sep 2025 , 02:15 PM</td>
            <td>45</td>
            <td>Waiting for vendor</td>
          </tr>
          <tr>
            <td>153</td>
            <td>Deepika Dayal</td>
            <td>20 Sep 2025</td>
            <td>125</td>
            <td>Waiting for vendor</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BookingsPage;
