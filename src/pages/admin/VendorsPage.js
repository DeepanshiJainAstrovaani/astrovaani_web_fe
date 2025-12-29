import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AdminTable.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  const [deleteModal, setDeleteModal] = useState({ show: false, vendor: null });
  const [rejectModal, setRejectModal] = useState({ show: false, vendor: null, reason: '', customReason: '' });
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

  const handleDeleteClick = (vendor) => {
    setDeleteModal({ show: true, vendor });
  };

  const handleDeleteConfirm = async () => {
    const vendorId = deleteModal.vendor?._id || deleteModal.vendor?.id;
    if (!vendorId) return;

    try {
      const response = await fetch(`${API_URL}/vendors/${vendorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete vendor');

      // Remove vendor from local state
      setVendors(vendors.filter(v => (v._id || v.id) !== vendorId));
      setDeleteModal({ show: false, vendor: null });
    } catch (err) {
      console.error('Error deleting vendor:', err);
      alert('Failed to delete vendor: ' + err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, vendor: null });
  };

  const handleRejectClick = (vendor) => {
    setRejectModal({ show: true, vendor, reason: '', customReason: '' });
  };

  const handleRejectConfirm = async () => {
    const vendorId = rejectModal.vendor?._id || rejectModal.vendor?.id;
    const { reason } = rejectModal;
    
    if (!vendorId) return;
    
    // Validate reason selection
    if (!reason) {
      alert('Please select a rejection reason');
      return;
    }

    try {
      // Update vendor status to inactive
      const response = await fetch(`${API_URL}/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'inactive' }),
      });

      if (!response.ok) throw new Error('Failed to reject vendor');

      // Send WhatsApp notification
      const vendor = rejectModal.vendor;
      const mobile = vendor.whatsapp || vendor.phone;
      const name = vendor.name || 'Vendor';
      
      if (mobile) {
        try {
          // Determine message based on rejection reason
          let whatsappMessage = '';
          let templateName = '';
          let variables = [];
          
          if (reason === 'agreement') {
            // Agreement rejection template
            templateName = 'vendor_agreement_rejected';
            variables = [name];
            whatsappMessage = JSON.stringify(variables);
          } else {
            // Onboarding rejection template
            templateName = 'vendor_onboarding_rejected';
            variables = [name]; // Only vendor name, reason is already in template
            whatsappMessage = JSON.stringify(variables);
          }
          
          console.log('📱 Sending rejection WhatsApp:', { mobile, templateName, variables });
          
          // Send WhatsApp via backend
          await fetch(`${API_URL}/vendors/${vendorId}/reject-notify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mobile,
              templateName,
              message: whatsappMessage,
              reason: reason === 'onboarding' ? 'Skills/experience mismatch' : 'Agreement signature missing'
            }),
          });
          
          console.log('✅ Rejection notification sent');
        } catch (whatsappErr) {
          console.error('⚠️ WhatsApp notification failed:', whatsappErr);
          // Don't block the rejection if WhatsApp fails
        }
      }

      // Update vendor status in local state
      setVendors(vendors.map(v => 
        (v._id || v.id) === vendorId ? { ...v, status: 'inactive' } : v
      ));
      setRejectModal({ show: false, vendor: null, reason: '', customReason: '' });
    } catch (err) {
      console.error('Error rejecting vendor:', err);
      alert('Failed to reject vendor: ' + err.message);
    }
  };

  const handleRejectCancel = () => {
    setRejectModal({ show: false, vendor: null, reason: '', customReason: '' });
  };

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
            <col style={{ width: '25%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: 280 }} />
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
              const photoUrl = v.photo || DEFAULT_PHOTO;
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
                  <td style={{ verticalAlign: 'middle', padding: '8px', minWidth: 280 }}>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
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
                        <button 
                          className={styles['action-btn-reject']} 
                          title="Reject" 
                          style={{ margin: 0 }} 
                          onClick={() => handleRejectClick(v)}
                        >
                          Reject
                        </button>
                      )}
                      {/* Delete button - only show in New tab */}
                      {activeStatus === 'New' && (
                        <button 
                          className={styles['action-btn-delete']} 
                          title="Delete" 
                          style={{ margin: 0 }} 
                          onClick={() => handleDeleteClick(v)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className={styles['modal-overlay']} onClick={handleDeleteCancel}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles['modal-title']}>Delete Vendor</h2>
            <p className={styles['modal-message']}>
              Are you sure you want to delete <strong>{deleteModal.vendor?.name}</strong>?
              <br />
              This action cannot be undone.
            </p>
            <div className={styles['modal-actions']}>
              <button 
                className={styles['modal-btn-cancel']} 
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button 
                className={styles['modal-btn-confirm']} 
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectModal.show && (
        <div className={styles['modal-overlay']} onClick={handleRejectCancel}>
          <div 
            className={styles['modal-content']} 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              margin: 'auto'
            }}
          >
            <h2 className={styles['modal-title']} style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Reject Vendor</h2>
            <p className={styles['modal-message']} style={{ margin: '0 0 20px 0', padding: '0 20px', color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
              Are you sure you want to reject <strong>{rejectModal.vendor?.name}</strong>?
              <br />
              This will move them to the Inactive tab and send them a WhatsApp notification.
            </p>
            
            {/* Rejection Reason Selection */}
            <div style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'left', padding: '0 20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                Rejection Reason *
              </label>
              <select
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  marginBottom: '12px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Select Reason --</option>
                <option value="onboarding">Onboarding Rejection</option>
                <option value="agreement">Agreement Rejection</option>
              </select>
            </div>
            
            <div className={styles['modal-actions']} style={{ padding: '0 20px 20px 20px', gap: '12px' }}>
              <button 
                className={styles['modal-btn-cancel']} 
                onClick={handleRejectCancel}
              >
                Cancel
              </button>
              <button 
                className={styles['modal-btn-confirm']} 
                onClick={handleRejectConfirm}
                disabled={!rejectModal.reason}
                style={{
                  opacity: !rejectModal.reason ? 0.5 : 1,
                  cursor: !rejectModal.reason ? 'not-allowed' : 'pointer'
                }}
              >
                Reject & Notify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduling now handled on separate page: /admin/schedule/:vendorId */}
    </div>
  );
};

export default VendorsPage;
