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
  const [rejectModal, setRejectModal] = useState({ show: false, vendor: null });
  const [agreementModal, setAgreementModal] = useState({ show: false, vendor: null, agreementUrl: '' });
  const [onboardModal, setOnboardModal] = useState({ show: false, vendor: null });
  const [agreementRejectModal, setAgreementRejectModal] = useState({ show: false, vendor: null });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

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

  useEffect(() => {
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
    setRejectModal({ show: true, vendor });
  };

  const handleRejectConfirm = async () => {
    const vendorId = rejectModal.vendor?._id || rejectModal.vendor?.id;

    if (!vendorId) return;

    try {
      // Send WhatsApp notification for onboarding rejection
      const vendor = rejectModal.vendor;
      const mobile = vendor.whatsapp || vendor.phone;
      const name = vendor.name || 'Vendor';

      if (mobile) {
        try {
          console.log('📱 Sending onboarding rejection WhatsApp:', { mobile, name });

          // Send WhatsApp via backend
          await fetch(`${API_URL}/vendors/${vendorId}/reject-notify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mobile,
              templateName: 'vendor_onboarding_rejected',
              message: name,
              reason: 'Onboarding Rejection'
            }),
          });

          console.log('✅ Rejection notification sent');
        } catch (whatsappErr) {
          console.error('⚠️ WhatsApp notification failed:', whatsappErr);
        }
      }

      // Delete vendor from database
      const response = await fetch(`${API_URL}/vendors/${vendorId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete vendor');

      // Remove vendor from local state
      setVendors(vendors.filter(v => (v._id || v.id) !== vendorId));
      setRejectModal({ show: false, vendor: null });
      alert('Vendor rejected and deleted successfully. Notification sent via WhatsApp.');
    } catch (err) {
      console.error('Error rejecting vendor:', err);
      alert('Failed to reject vendor: ' + err.message);
    }
  };

  const handleViewAgreement = (vendor) => {
    console.log('📄 Agreement URL:', vendor.agreement);
    console.log('📄 Vendor data:', vendor);

    // Clean up URL - convert filename to Cloudinary URL if needed
    let cleanUrl = vendor.agreement;
    if (cleanUrl && !cleanUrl.startsWith('http')) {
      // It's just a filename, construct Cloudinary URL
      const filename = cleanUrl.replace(/\s+/g, '').trim();
      cleanUrl = `https://res.cloudinary.com/df8sx5hv4/raw/upload/vendor_agreements/${filename}`;
      console.log('🔧 Constructed Cloudinary URL:', cleanUrl);
    }

    setAgreementModal({ show: true, vendor, agreementUrl: cleanUrl });
  };

  const handleAgreementApprove = async () => {
    const vendorId = agreementModal.vendor?._id || agreementModal.vendor?.id;
    if (!vendorId) return;

    try {
      const response = await fetch(`${API_URL}/vendors/${vendorId}/approve-agreement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to approve agreement');

      // Update vendor in local state
      setVendors(vendors.map(v =>
        (v._id || v.id) === vendorId ? { ...v, agreementStatus: 'approved' } : v
      ));

      setAgreementModal({ show: false, vendor: null, agreementUrl: '' });
      showToast('Agreement approved successfully!', 'success');
      fetchVendors();
    } catch (err) {
      console.error('Error approving agreement:', err);
      showToast('Failed to approve agreement', 'error');
    }
  };

  const handleRejectCancel = () => {
    setRejectModal({ show: false, vendor: null });
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };
  const handleAgreementModalClose = () => {
    setAgreementModal({ show: false, vendor: null, agreementUrl: '' });
  };

  const handleAgreementRejectClick = () => {
    setAgreementRejectModal({ show: true, vendor: agreementModal.vendor });
  };

  const handleAgreementRejectCancel = () => {
    setAgreementRejectModal({ show: false, vendor: null });
  };

  const handleAgreementReject = async () => {
    const vendorId = agreementRejectModal.vendor?._id || agreementRejectModal.vendor?.id;
    if (!vendorId) return;

    try {
      // Send WhatsApp notification for agreement rejection
      const vendor = agreementRejectModal.vendor;
      const mobile = vendor.whatsapp || vendor.phone;
      const name = vendor.name || 'Vendor';

      if (mobile) {
        try {
          console.log('📱 Sending agreement rejection WhatsApp:', { mobile, name });

          await fetch(`${API_URL}/vendors/${vendorId}/reject-notify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mobile,
              templateName: 'vendor_agreement_rejected',
              message: name,
              reason: 'Agreement Rejection'
            }),
          });

          console.log('✅ Agreement rejection notification sent');
        } catch (whatsappErr) {
          console.error('⚠️ WhatsApp notification failed:', whatsappErr);
        }
      }

      // Update agreement status to rejected
      const response = await fetch(`${API_URL}/vendors/${vendorId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              agreementStatus: 'rejected',
              agreementRejectedAt: new Date().toISOString(),
              $inc: { agreementRejectionCount: 1 }
            }),
          });

          if (!response.ok) throw new Error('Failed to reject agreement');

          // Update vendor in local state
          setVendors(vendors.map(v =>
            (v._id || v.id) === vendorId ? {
              ...v,
              agreementStatus: 'rejected',
              agreementRejectionCount: (v.agreementRejectionCount || 0) + 1
            } : v
          ));

          setAgreementModal({ show: false, vendor: null, agreementUrl: '' });
          setAgreementRejectModal({ show: false, vendor: null });
          showToast('Agreement rejected successfully', 'success');
          fetchVendors();
        } catch (err) {
          console.error('Error rejecting agreement:', err);
          showToast('Failed to reject agreement', 'error');
        }
      };

      const handleOnboardClick = (vendor) => {
        // Check if vendor has completed all steps
        if (!vendor.agreementStatus || vendor.agreementStatus !== 'approved') {
          alert('Agreement must be approved first');
          return;
        }
        if (!vendor.accountholder || !vendor.accountno || !vendor.ifsc) {
          alert('Vendor has not completed bank details yet');
          return;
        }
        if (!vendor.agree) {
          alert('Vendor has not accepted terms yet');
          return;
        }
        setOnboardModal({ show: true, vendor });
      };

      const handleOnboardConfirm = async () => {
        const vendorId = onboardModal.vendor?._id || onboardModal.vendor?.id;
        if (!vendorId) return;

        try {
          // Call the new onboard endpoint
          const response = await fetch(`${API_URL}/vendors/${vendorId}/onboard`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to onboard vendor');
          }

          // Update vendor in local state
          setVendors(vendors.map(v =>
            (v._id || v.id) === vendorId ? { 
              ...v, 
              status: 'active', 
              onboardingstatus: 'completed',
              onboardedAt: data.data?.onboardedAt 
            } : v
          ));

          setOnboardModal({ show: false, vendor: null });
          showToast('Vendor onboarded successfully! WhatsApp notification sent.', 'success');
          fetchVendors(); // Refresh to update tabs
        } catch (err) {
          console.error('Error onboarding vendor:', err);
          showToast('Failed to onboard vendor: ' + err.message, 'error');
        }
      };

      const handleOnboardCancel = () => {
        setOnboardModal({ show: false, vendor: null });
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
                          {(v._id || v.id) && (
                            <Link to={`/admin/edit-vendor/${v._id || v.id}`}>
                              <button className={styles['action-btn']} title="Edit" style={{ margin: 0 }}>Edit</button>
                            </Link>
                          )}
                          {/* Only show Schedule button if activeStatus is 'New' */}
                          {activeStatus === 'New' && (
                            <button className={styles['action-btn']} title="Schedule" style={{ margin: 0 }} onClick={() => { navigate(`/admin/schedule/${v._id || v.id}`); }}>Schedule</button>
                          )}
                          {/* Show View Agreement button if agreement uploaded and NOT in Active/Inactive tabs */}
                          {v.agreement && v.agreement !== '' && activeStatus !== 'Active' && activeStatus !== 'Inactive' && (
                            <button className={styles['action-btn']} title="View Agreement" style={{ margin: 0 }} onClick={() => handleViewAgreement(v)}>View Agreement</button>
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
                          {/* Show Onboard button if status is 'In Process' and all conditions met */}
                          {activeStatus === 'In Process' &&
                            v.agreementStatus === 'approved' &&
                            v.accountholder &&
                            v.accountno &&
                            v.ifsc &&
                            v.agree && (
                              <button
                                className={styles['action-btn']}
                                title="Onboard"
                                style={{ margin: 0, background: '#28a745', color: 'white' }}
                                onClick={() => handleOnboardClick(v)}
                              >
                                Onboard
                              </button>
                            )}
                          <button className={styles['action-btn-delete']} title="Delete" style={{ margin: 0 }} onClick={() => handleDeleteClick(v)}>Delete</button>
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
                <h2 className={styles['modal-title']} style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Delete Vendor</h2>
                <p className={styles['modal-message']} style={{ margin: '0 0 20px 0', padding: '0 20px', color: '#666', fontSize: '14px' }}>
                  Are you sure you want to delete <strong>{deleteModal.vendor?.name}</strong>?
                  <br />
                  This action cannot be undone.
                </p>

                <div className={styles['modal-actions']} style={{ padding: '0 20px 20px 20px', gap: '12px' }}>
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
                <h2 className={styles['modal-title']} style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#dc3545' }}>⚠️ Reject Vendor</h2>
                <p className={styles['modal-message']} style={{ margin: '0 0 20px 0', padding: '0 20px', color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                  Are you sure you want to reject <strong>{rejectModal.vendor?.name}</strong>?
                  <br /><br />
                  <strong style={{ color: '#dc3545' }}>This action cannot be undone!</strong>
                  <br /><br />
                  This will:
                  <ul style={{ textAlign: 'left', marginTop: '10px', color: '#dc3545' }}>
                    <li>❌ Permanently delete the vendor from database</li>
                    <li>📱 Send onboarding rejection notification via WhatsApp</li>
                    <li>🚫 Remove all vendor data from the system</li>
                  </ul>
                </p>

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
                    style={{ background: '#dc3545' }}
                  >
                    Reject & Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Agreement Preview Modal */}
          {agreementModal.show && (
            <div className={styles['modal-overlay']} onClick={handleAgreementModalClose}>
              <div
                className={styles['modal-content']}
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '900px',
                  width: '95%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  margin: 'auto'
                }}
              >
                {/* Modal Title */}
                <h2 className={styles['modal-title']} style={{ margin: '0 0 20px 0', fontSize: '22px', textAlign: 'center', padding: '20px 20px 0 20px', flexShrink: 0 }}>
                  Agreement Preview - {agreementModal.vendor?.name}
                </h2>

                {/* Scrollable Content Area */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px' }}>
                  {/* Agreement Document Preview */}
                  <div style={{ marginBottom: '20px' }}>
                    {agreementModal.agreementUrl ? (
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <a
                          href={agreementModal.agreementUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block',
                            padding: '16px 32px',
                            background: '#007bff',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          📥 Open Agreement in New Tab
                        </a>
                        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                          Click the button above to view the agreement document
                        </p>
                      </div>
                    ) : (
                      <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No agreement uploaded yet</p>
                    )}
                  </div>

                  {/* Agreement Status and History */}
                  <div style={{ marginBottom: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>Agreement Information</h3>

                    <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                      <strong>Upload Date:</strong> {agreementModal.vendor?.agreementuploaddate ?
                        new Date(agreementModal.vendor.agreementuploaddate).toLocaleString('en-IN') :
                        'Not available'
                      }
                    </p>

                    <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                      <strong>Current Status:</strong>
                      <span style={{
                        marginLeft: '8px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: agreementModal.vendor?.agreementStatus === 'approved' ? '#d4edda' :
                          agreementModal.vendor?.agreementStatus === 'rejected' ? '#f8d7da' : '#fff3cd',
                        color: agreementModal.vendor?.agreementStatus === 'approved' ? '#155724' :
                          agreementModal.vendor?.agreementStatus === 'rejected' ? '#721c24' : '#856404'
                      }}>
                        {(agreementModal.vendor?.agreementStatus || 'Pending Review').toUpperCase()}
                      </span>
                    </p>

                    {agreementModal.vendor?.agreementRejectionCount > 0 && (
                      <p style={{ margin: '0 0 8px 0', color: '#dc3545', fontSize: '14px' }}>
                        <strong>Rejection History:</strong> Rejected {agreementModal.vendor.agreementRejectionCount} time(s)
                      </p>
                    )}

                    {agreementModal.vendor?.agreementApprovedAt && (
                      <p style={{ margin: '0 0 8px 0', color: '#28a745', fontSize: '14px' }}>
                        <strong>Approved At:</strong> {new Date(agreementModal.vendor.agreementApprovedAt).toLocaleString('en-IN')}
                      </p>
                    )}

                    {agreementModal.vendor?.agreementRejectedAt && (
                      <p style={{ margin: '0 0 8px 0', color: '#dc3545', fontSize: '14px' }}>
                        <strong>Last Rejected At:</strong> {new Date(agreementModal.vendor.agreementRejectedAt).toLocaleString('en-IN')}
                      </p>
                    )}

                    {(agreementModal.vendor?.agreementStatus === 'approved' || agreementModal.vendor?.agreementStatus === 'rejected') && (
                      <div style={{
                        marginTop: '12px',
                        padding: '10px',
                        background: '#fff',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: '#666'
                      }}>
                        <strong>ℹ️ Note:</strong> This agreement has already been {agreementModal.vendor?.agreementStatus}.
                        Actions are disabled until vendor uploads a new agreement.
                      </div>
                    )}
                  </div>
                </div>

                {/* Fixed Action Buttons at Bottom */}
                <div className={styles['modal-actions']} style={{ padding: '16px 20px', gap: '10px', justifyContent: 'space-between', borderTop: '1px solid #eee', flexShrink: 0 }}>
                  <button
                    className={styles['modal-btn-cancel']}
                    onClick={handleAgreementModalClose}
                    style={{ padding: '8px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}
                  >
                    Close
                  </button>
                  {agreementModal.vendor?.agreementStatus !== 'approved' && agreementModal.vendor?.agreementStatus !== 'rejected' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className={styles['modal-btn-confirm']}
                        onClick={handleAgreementRejectClick}
                        style={{ background: '#dc3545', padding: '8px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}
                      >
                        Reject
                      </button>
                      <button
                        className={styles['modal-btn-confirm']}
                        onClick={handleAgreementApprove}
                        style={{ background: '#28a745', padding: '8px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Onboard Confirmation Modal */}
          {onboardModal.show && (
            <div className={styles['modal-overlay']} onClick={handleOnboardCancel}>
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
                <h2 className={styles['modal-title']} style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Onboard Vendor</h2>
                <p className={styles['modal-message']} style={{ margin: '0 0 20px 0', padding: '0 20px', color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                  Are you sure you want to onboard <strong>{onboardModal.vendor?.name}</strong>?
                  <br /><br />
                  This will:
                  <ul style={{ textAlign: 'left', marginTop: '10px' }}>
                    <li>✅ Set vendor status to <strong>Active</strong></li>
                    <li>✅ Allow vendor to start taking bookings</li>
                    <li>✅ Enable vendor in customer app</li>
                  </ul>
                </p>

                {/* Verification Checklist */}
                <div style={{ padding: '0 20px', marginBottom: '20px', textAlign: 'left' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Verification Checklist:</p>
                  <ul style={{ fontSize: '13px', color: '#666' }}>
                    <li>✅ Agreement Approved</li>
                    <li>✅ Bank Details Submitted</li>
                    <li>✅ Terms Accepted</li>
                  </ul>
                </div>

                <div className={styles['modal-actions']} style={{ padding: '0 20px 20px 20px', gap: '12px' }}>
                  <button
                    className={styles['modal-btn-cancel']}
                    onClick={handleOnboardCancel}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles['modal-btn-confirm']}
                    onClick={handleOnboardConfirm}
                    style={{ background: '#28a745' }}
                  >
                    Onboard Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Agreement Reject Confirmation Modal */}
          {agreementRejectModal.show && (
            <div className={styles['modal-overlay']} onClick={handleAgreementRejectCancel}>
              <div
                className={styles['modal-content']}
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '450px',
                  width: '90%',
                  margin: 'auto',
                  animation: 'slideDown 0.3s ease-out'
                }}
              >
                <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#dc3545', textAlign: 'center' }}>
                  ⚠️ Reject Agreement
                </h2>
                <p style={{ margin: '0 0 20px 0', padding: '0 20px', color: '#666', fontSize: '14px', lineHeight: '1.6', textAlign: 'center' }}>
                  Are you sure you want to reject the agreement for <strong>{agreementRejectModal.vendor?.name}</strong>?
                  <br /><br />
                  This will notify the vendor via WhatsApp to upload a new agreement.
                </p>

                <div style={{ display: 'flex', gap: '12px', padding: '0 20px 20px 20px', justifyContent: 'center' }}>
                  <button
                    onClick={handleAgreementRejectCancel}
                    style={{
                      padding: '10px 24px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      background: 'white',
                      color: '#666',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAgreementReject}
                    style={{
                      padding: '10px 24px',
                      fontSize: '14px',
                      border: 'none',
                      background: '#dc3545',
                      color: 'white',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Yes, Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toast.show && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 10000,
              minWidth: '300px',
              padding: '16px 20px',
              background: toast.type === 'success' ? '#28a745' : '#dc3545',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'slideInRight 0.3s ease-out',
              fontSize: '15px',
              fontWeight: '500'
            }}>
              <span style={{ fontSize: '24px' }}>
                {toast.type === 'success' ? '✓' : '✕'}
              </span>
              <span>{toast.message}</span>
            </div>
          )}

          {/* Add animation keyframes */}
          <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

          {/* Scheduling now handled on separate page: /admin/schedule/:vendorId */}
        </div>
      );
    };

    export default VendorsPage;
