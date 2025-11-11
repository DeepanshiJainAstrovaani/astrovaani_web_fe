import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import styles from './AdminTable.module.css';

const statusOptions = [
  { label: 'Scheduled', count: 253 },
  { label: 'Pending', count: 2 },
];

const interviews = [
  {
    name: 'Raghuvendra',
    type: 'Astrologer',
    time: '20 Sep 2025 , 02:15 PM',
  },
  {
    name: 'Deepika Dayal',
    type: 'Tarot',
    time: '20 Sep 2025',
  },
];

const InterviewsPage = () => {
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('Scheduled');

  return (
    <div className={styles['admin-container']}>
      {/* Search Bar */}
      <div className={styles['search-bar']}>
        <FaSearch color="#222" size={20} />
        <input
          type="text"
          placeholder="Search any interview by date"
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

      {/* Interviews Table */}
      <table className={styles['admin-table']}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Schedules Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {interviews.map((i, idx) => (
            <tr key={idx}>
              <td>{i.name}</td>
              <td>{i.type}</td>
              <td>{i.time}</td>
              <td>
                <button type="button" className={styles['action-btn']}>Start</button>
                <button type="button" className={styles['action-btn']}>Send Link</button>
                <button type="button" className={styles['action-btn']}>Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InterviewsPage;
