import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AdminTable.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const COMMUNITY_BASE_URL = 'https://astrovaani.com/community/';

const DEFAULT_PHOTO = 'https://ui-avatars.com/api/?name=Vendor&background=eee&color=222&size=64';

const STATUS_LABELS = ['New', 'In Process', 'Active', 'Inactive'];

// Map stored vendor.status value to a human label used by tabs
const mapStatusToLabel = (status) => {
  if (!status) return 'New';
  const s = String(status).toLowerCase();
  if (s === 'inreview') return 'New';
  if (s === 'inprocess') return 'In Process';
  if (s === 'active') return 'Active';
  if (s === 'inactive') return 'Inactive';
  // fallback
  return 'New';
};

const VendorsPage = () => {
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('Active');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  // Apply status filtering based on activeStatus tab
  const statusFilteredVendors = filteredVendors.filter(v => {
    if (!activeStatus) return true;
    return mapStatusToLabel(v.status) === activeStatus;
  });

  // Compute dynamic counts for each status label
  const counts = vendors.reduce((acc, v) => {
    const lbl = mapStatusToLabel(v.status);
    acc[lbl] = (acc[lbl] || 0) + 1;
    return acc;
  }, {});

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
        {STATUS_LABELS.map(label => (
          <button
            key={label}
            className={
              activeStatus === label
                ? `${styles['status-btn']} ${styles['status-btn-active']}`
                : `${styles['status-btn']} ${styles['status-btn-inactive']}`
            }
            onClick={() => setActiveStatus(label)}
          >
            {label} ({counts[label] || 0})
          </button>
        ))}
      </div>

      {/* Loading/Error */}
      {loading && <div>Loading vendors...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {/* Vendors Table */}
      {!loading && !error && (
        <table className={styles['admin-table']} style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 80 }} />
            <col style={{ width: '40%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: 220 }} />
          </colgroup>
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
            {statusFilteredVendors.map((v, i) => {
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
                  <td style={{ verticalAlign: 'middle', padding: '8px', minWidth: 220 }}>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
                      {v.id && (
                        <Link to={`/admin/edit-vendor/${v.id}`}>
                          <button className={styles['action-btn']} title="Edit" style={{ margin: 0 }}>Edit</button>
                        </Link>
                      )}
                      <button className={styles['action-btn']} title="Schedule" style={{ margin: 0 }} onClick={() => { navigate(`/admin/schedule/${v._id || v.id}`); }}>Schedule</button>
                      <button className={styles['action-btn-reject']} title="Reject" style={{ margin: 0 }}>Reject</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {/* Scheduling now handled on separate page: /admin/schedule/:vendorId */}
    </div>
  );
};

export default VendorsPage;
