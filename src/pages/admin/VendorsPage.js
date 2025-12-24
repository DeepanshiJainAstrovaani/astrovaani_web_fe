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
  if (s === 'pending' || s === 'inreview') return 'New';
  if (s === 'inprocess') return 'In Process';
  if (s === 'active') return 'Active';
  if (s === 'inactive') return 'Inactive';
  // fallback for any unknown status
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
        console.log('Fetching vendors from:', `${API_URL}/vendors`);
        const response = await fetch(`${API_URL}/vendors`);
        console.log('Response status:', response.status);
        if (!response.ok) throw new Error('Failed to fetch vendors');
        const data = await response.json();
        console.log('Raw API response:', data);
        console.log('Type of data:', typeof data, 'Is array:', Array.isArray(data));
        
        // Handle different response structures
        let vendorsArray = [];
        if (Array.isArray(data)) {
          vendorsArray = data;
        } else if (data.vendors && Array.isArray(data.vendors)) {
          vendorsArray = data.vendors;
        } else if (data.data && Array.isArray(data.data)) {
          vendorsArray = data.data;
        }
        
        console.log('Vendors array length:', vendorsArray.length);
        console.log('First vendor:', vendorsArray[0]);
        setVendors(vendorsArray);
      } catch (err) {
        console.error('Error fetching vendors:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(v => {
    const name = v.name || '';
    const category = v.category || '';
    return name.toLowerCase().includes(search.toLowerCase()) ||
           category.toLowerCase().includes(search.toLowerCase());
  });

  // Apply status filtering based on activeStatus tab
  const statusFilteredVendors = filteredVendors.filter(v => {
    if (!activeStatus) return true;
    const label = mapStatusToLabel(v.status);
    console.log(`Vendor "${v.name}" status: ${v.status} → label: ${label}, activeStatus: ${activeStatus}, match: ${label === activeStatus}`);
    return label === activeStatus;
  });

  console.log('Total vendors:', vendors.length);
  console.log('After search filter:', filteredVendors.length);
  console.log('After status filter:', statusFilteredVendors.length);
  console.log('Active status tab:', activeStatus);

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
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {statusFilteredVendors.map((v, i) => {
              const photoUrl = v.photo ? `${COMMUNITY_BASE_URL}${v.photo}` : DEFAULT_PHOTO;
              let joinedDisplay = 'Not available';
              
              // The API returns 'joineddate' field (e.g., "07 January 2024")
              if (v.joineddate) {
                joinedDisplay = v.joineddate;
              } else if (v.createdAt || v.updatedAt) {
                // Fallback to createdAt/updatedAt if joineddate not available
                const date = new Date(v.createdAt || v.updatedAt);
                if (!isNaN(date.getTime())) {
                  joinedDisplay = date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                }
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
                      {/* Only show Schedule button if activeStatus is 'New' */}
                      {activeStatus === 'New' && (
                        <button className={styles['action-btn']} title="Schedule" style={{ margin: 0 }} onClick={() => { navigate(`/admin/schedule/${v._id || v.id}`); }}>Schedule</button>
                      )}
                      {/* Only show Reject button if NOT Active/Inactive */}
                      {activeStatus !== 'Active' && activeStatus !== 'Inactive' && (
                        <button className={styles['action-btn-reject']} title="Reject" style={{ margin: 0 }}>Reject</button>
                      )}
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
