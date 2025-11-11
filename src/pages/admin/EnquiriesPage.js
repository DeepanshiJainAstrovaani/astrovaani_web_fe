import React from 'react';
import styles from './AdminTable.module.css';

const EnquiriesPage = () => (
  <div className={styles['admin-container']}>
    <h2>Enquiries</h2>
    <div className={styles['search-bar']}>Search Bar Placeholder</div>
    <div>
      <button className={styles['status-btn']}>All Enquiries</button>
    </div>
    <table className={styles['admin-table']}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Message</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>John Doe</td>
          <td>john@example.com</td>
          <td>Need help with booking</td>
          <td>20 Sep 2025</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default EnquiriesPage;
