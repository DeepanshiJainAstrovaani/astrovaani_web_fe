import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './AdminTable.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const COMMUNITY_BASE_URL = 'https://astrovaani.com/community/';

const DEFAULT_PHOTO = 'https://ui-avatars.com/api/?name=Vendor&background=eee&color=222&size=64';

const statusOptions = [
  { label: 'New', count: 53 },
  { label: 'In Process', count: 2 },
  { label: 'Active', count: 242 },
  { label: 'Inactive', count: 61 },
];

const VendorsPage = () => {
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('Active');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/vendors`);
        if (!response.ok) throw new Error('Failed to fetch vendors');
        const data = await response.json();
        setVendors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles['admin-container']}>
      {/* Search Bar */}
      <div className={styles['search-bar']}>
        <FaSearch color="#222" size={20} />
        <input
          type="text"
          placeholder="Search any vendor by name or category"
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

      {/* Loading/Error */}
      {loading && <div>Loading vendors...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {/* Vendors Table */}
      {!loading && !error && (
        <table className={styles['admin-table']}>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Category</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((v, i) => {
              const photoUrl = v.photo ? `${COMMUNITY_BASE_URL}${v.photo}` : DEFAULT_PHOTO;
              let joinedDisplay = '-';
              if (v.joined) {
                // Try to format as date if possible
                const date = new Date(v.joined);
                joinedDisplay = isNaN(date.getTime()) ? v.joined : date.toLocaleDateString();
              } else {
                joinedDisplay = 'Not available';
              }
              return (
                <tr key={v._id || i}>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '8px' }}>
                    <img
                      src={photoUrl}
                      alt={v.name}
                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%', background: '#f5f5f5' }}
                      onError={e => { e.target.onerror = null; e.target.src = DEFAULT_PHOTO; }}
                    />
                  </td>
                  <td style={{ verticalAlign: 'middle', padding: '8px' }}>{v.name}</td>
                  <td style={{ verticalAlign: 'middle', padding: '8px' }}>{v.category}</td>
                  <td style={{ verticalAlign: 'middle', padding: '8px' }}>{joinedDisplay}</td>
                  <td style={{ verticalAlign: 'middle', padding: '8px', minWidth: 180 }}>
                    {v.id && (
                      <Link to={`/admindashboard/edit-vendor/${v.id}`}>
                        <button className={styles['action-btn']} title="Edit">Edit</button>
                      </Link>
                    )}
                    <button className={styles['action-btn']} title="Schedule">Schedule</button>
                    <button className={styles['action-btn-reject']} title="Reject">Reject</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VendorsPage;
