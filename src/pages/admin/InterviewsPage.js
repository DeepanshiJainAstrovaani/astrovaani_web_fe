import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import styles from './AdminTable.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const InterviewsPage = () => {
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('Scheduled');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSendLinkModal, setShowSendLinkModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  const [meetingLink, setMeetingLink] = useState('');

  // Fetch all vendors with interview schedules
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/vendors`);
      const data = await response.json();
      
      console.log('📦 Raw vendor data from API:', data);
      console.log('📦 First vendor:', data[0]);
      console.log('📦 First vendor ID field:', data[0]?._id);
      
      // Filter vendors who have interview schedules AND exclude active/inprocess vendors
      const vendorsWithSchedules = data.filter(vendor => 
        vendor.schedules && 
        vendor.schedules.length > 0 && 
        vendor.status !== 'active' && 
        vendor.status !== 'inprocess'
      );

      console.log('📋 Vendors with schedules:', vendorsWithSchedules.length);
      console.log('📋 First vendor with schedule:', vendorsWithSchedules[0]);

      setVendors(vendorsWithSchedules);

      // Count scheduled vs pending (exclude active and inprocess vendors)
      const scheduled = vendorsWithSchedules.filter(v => 
        v.status !== 'active' &&
        v.status !== 'inprocess' &&
        (v.onboardingstatus === 'interview scheduled' || 
        v.schedules.some(s => s.status === 'confirmed'))
      ).length;
      
      const pending = vendorsWithSchedules.filter(v => 
        v.status !== 'active' &&
        v.status !== 'inprocess' &&
        v.onboardingstatus !== 'interview scheduled' && 
        !v.schedules.some(s => s.status === 'confirmed')
      ).length;

      setScheduledCount(scheduled);
      setPendingCount(pending);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setLoading(false);
    }
  };

  // Categorize vendors into Scheduled and Pending
  const categorizedVendors = vendors.filter(vendor => {
    // Exclude vendors with active or inprocess status (they're approved/in agreement process)
    if (vendor.status === 'active' || vendor.status === 'inprocess') return false;
    
    const hasConfirmedSlot = vendor.schedules.some(s => s.status === 'confirmed');
    const isScheduled = vendor.onboardingstatus === 'interview scheduled' || hasConfirmedSlot;

    if (activeStatus === 'Scheduled') {
      return isScheduled;
    } else {
      return !isScheduled;
    }
  });

  // Filter by search
  const filteredVendors = categorizedVendors.filter(vendor =>
    vendor.name?.toLowerCase().includes(search.toLowerCase()) ||
    vendor.category?.toLowerCase().includes(search.toLowerCase())
  );

  // Get confirmed slot for a vendor
  const getConfirmedSlot = (vendor) => {
    return vendor.schedules?.find(s => s.status === 'confirmed');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const statusOptions = [
    { label: 'Scheduled', count: scheduledCount },
    { label: 'Pending', count: pendingCount },
  ];

  // Helper function to get vendor ID (handles both _id and id)
  const getVendorId = (vendor) => {
    return vendor._id || vendor.id;
  };

  // Action Handlers

  // 1. Start Interview - Opens interview feedback page
  const handleStartInterview = (vendor) => {
    // In PHP: Opens interview.php?vendorid=X
    // TODO: Create InterviewFeedback page component
    const vendorId = getVendorId(vendor);
    window.open(`/admindashboard/interview/${vendorId}`, '_blank');
  };

  // 2. Edit Vendor - Opens edit vendor page
  const handleEdit = (vendor) => {
    // In PHP: Opens editvendor.php?id=X
    console.log('🔍 Edit vendor clicked:', vendor);
    console.log('Vendor ID (_id):', vendor._id);
    console.log('Vendor ID (id):', vendor.id);
    console.log('All vendor keys:', Object.keys(vendor));
    
    // Use _id or id as fallback
    const vendorId = getVendorId(vendor);
    
    if (!vendorId) {
      console.error('❌ No vendor ID found!');
      alert('Error: Could not find vendor ID');
      return;
    }
    
    window.location.href = `/admin/edit-vendor/${vendorId}`;
  };

  // 3. Send Meeting Link
  const handleSendLink = (vendor) => {
    setSelectedVendor(vendor);
    setShowSendLinkModal(true);
  };

  const sendMeetingLink = async () => {
    if (!meetingLink || !selectedVendor) {
      alert('Please enter a meeting link');
      return;
    }

    try {
      const confirmedSlot = selectedVendor.schedules.find(s => s.status === 'confirmed');
      const vendorId = getVendorId(selectedVendor);
      
      const response = await fetch(`${API_URL}/vendors/${vendorId}/send-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          meetingLink,
          slotId: confirmedSlot._id
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Meeting link sent successfully!');
        setShowSendLinkModal(false);
        setMeetingLink('');
        fetchVendors();
      } else {
        alert(data.message || 'Failed to send link');
      }
    } catch (error) {
      console.error('Error sending link:', error);
      alert('Failed to send meeting link');
    }
  };

  // 4. Notify Vendor (for scheduled interviews)
  const handleNotify = (vendor) => {
    setSelectedVendor(vendor);
    setShowNotifyModal(true);
  };

  const confirmNotify = async () => {
    try {
      const vendorId = getVendorId(selectedVendor);
      const response = await fetch(`${API_URL}/vendors/${vendorId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Interview reminder sent successfully via WhatsApp!');
        setShowNotifyModal(false);
      } else {
        alert(data.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    }
  };

  // 5. Schedule - Opens scheduling modal
  const handleSchedule = (vendor) => {
    setSelectedVendor(vendor);
    setScheduleSlots(vendor.schedules || []);
    setShowScheduleModal(true);
  };

  const addSlot = () => {
    if (!newSlot.date || !newSlot.time) {
      alert('Please select both date and time');
      return;
    }

    const dateTimeString = `${newSlot.date}T${newSlot.time}:00`;
    const newSchedule = {
      scheduledAt: new Date(dateTimeString),
      duration: 30, // Default 30 minutes
      status: 'proposed',
      tempId: Date.now() // Temporary ID for UI
    };

    setScheduleSlots([...scheduleSlots, newSchedule]);
    setNewSlot({ date: '', time: '' });
  };

  const removeSlot = (index) => {
    const updated = scheduleSlots.filter((_, i) => i !== index);
    setScheduleSlots(updated);
  };

  const saveSchedules = async () => {
    if (scheduleSlots.length === 0) {
      alert('Please add at least one time slot');
      return;
    }

    try {
      const vendorId = getVendorId(selectedVendor);
      const response = await fetch(`${API_URL}/vendors/${vendorId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: scheduleSlots }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Schedules saved successfully! Interview code generated.');
        setShowScheduleModal(false);
        setScheduleSlots([]);
        fetchVendors();
      } else {
        alert(data.message || 'Failed to save schedules');
      }
    } catch (error) {
      console.error('Error saving schedules:', error);
      alert('Failed to save schedules');
    }
  };

  // 6. Send Reminder (for pending vendors)
  const handleReminder = async (vendor) => {
    if (!window.confirm(`Send reminder to ${vendor.name} to select interview slot?`)) {
      return;
    }

    try {
      const vendorId = getVendorId(vendor);
      const response = await fetch(`${API_URL}/vendors/${vendorId}/reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Reminder sent successfully!');
      } else {
        alert(data.message || 'Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder');
    }
  };

  // 7. Cancel Interview
  const handleCancel = (vendor) => {
    setSelectedVendor(vendor);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      const vendorId = getVendorId(selectedVendor);
      const response = await fetch(`${API_URL}/vendors/${vendorId}/cancel-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Interview cancelled successfully');
        setShowCancelModal(false);
        fetchVendors();
      } else {
        alert(data.message || 'Failed to cancel interview');
      }
    } catch (error) {
      console.error('Error cancelling interview:', error);
      alert('Failed to cancel interview');
    }
  };

  return (
    <div className={styles['admin-container']}>
      {/* Search Bar */}
      <div className={styles['search-bar']}>
        <FaSearch color="#222" size={20} />
        <input
          type="text"
          placeholder="Search by name or category"
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

      {/* Loading State */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading interviews...
        </div>
      ) : (
        <>
          {/* Interviews Table */}
          <table className={styles['admin-table']}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Scheduled Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    {search ? 'No interviews found matching your search' : `No ${activeStatus.toLowerCase()} interviews`}
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor, idx) => {
                  const confirmedSlot = getConfirmedSlot(vendor);
                  const vendorId = getVendorId(vendor);
                  return (
                    <tr key={vendorId || idx}>
                      <td>{vendor.name}</td>
                      <td>{vendor.category}</td>
                      <td>
                        {activeStatus === 'Scheduled' && confirmedSlot
                          ? formatDate(confirmedSlot.scheduledAt)
                          : activeStatus === 'Pending'
                          ? 'Pending selection'
                          : 'Not scheduled'}
                      </td>
                      <td>
                        {activeStatus === 'Scheduled' ? (
                          <>
                            <button type="button" className={styles['action-btn']} onClick={() => handleStartInterview(vendor)}>Start Interview</button>
                            <button type="button" className={styles['action-btn']} onClick={() => handleEdit(vendor)}>Edit</button>
                            <button type="button" className={styles['action-btn']} onClick={() => handleSendLink(vendor)}>Send Link</button>
                            <button type="button" className={styles['action-btn']} onClick={() => handleNotify(vendor)}>Notify</button>
                            <button type="button" className={styles['action-btn']} style={{ color: '#d32f2f' }} onClick={() => handleCancel(vendor)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button type="button" className={styles['action-btn']} onClick={() => handleEdit(vendor)}>Edit</button>
                            <button type="button" className={styles['action-btn']} onClick={() => handleSchedule(vendor)}>Schedule</button>
                            <button type="button" className={styles['action-btn']} onClick={() => handleReminder(vendor)}>Reminder</button>
                            <button type="button" className={styles['action-btn']} style={{ color: '#d32f2f' }} onClick={() => handleCancel(vendor)}>Cancel</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className={styles['modal-overlay']} onClick={() => setShowScheduleModal(false)}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              <h2>Schedule Interview</h2>
              <p>For {selectedVendor?.name}</p>
            </div>
            
            <div className={styles['modal-body']}>
              <div className={styles['field-group']}>
                <label>Date</label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  className={styles['input-field']}
                />
              </div>

              <div className={styles['field-group']}>
                <label>Time</label>
                <input
                  type="time"
                  value={newSlot.time}
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                  className={styles['input-field']}
                />
              </div>

              <button onClick={addSlot} className={styles['add-btn']}>Add Slot</button>

              <div className={styles['slots-list']}>
                <h3>Scheduled Slots ({scheduleSlots.length})</h3>
                {scheduleSlots.map((slot, index) => (
                  <div key={index} className={styles['slot-item']}>
                    <span>{new Date(slot.scheduledAt).toLocaleString('en-GB')}</span>
                    <button onClick={() => removeSlot(index)} className={styles['remove-btn']}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles['modal-actions']}>
              <button onClick={() => setShowScheduleModal(false)} className={styles['cancel-btn']}>Close</button>
              <button onClick={saveSchedules} className={styles['confirm-btn']}>Save & Notify Vendor</button>
            </div>
          </div>
        </div>
      )}

      {/* Send Link Modal */}
      {showSendLinkModal && (
        <div className={styles['modal-overlay']} onClick={() => setShowSendLinkModal(false)}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              <h2>Send Meeting Link</h2>
              <p>To {selectedVendor?.name}</p>
            </div>
            
            <div className={styles['modal-body']}>
              <div className={styles['field-group']}>
                <label>Meeting Link (Google Meet/Zoom)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className={styles['input-field']}
                />
              </div>
            </div>

            <div className={styles['modal-actions']}>
              <button onClick={() => setShowSendLinkModal(false)} className={styles['cancel-btn']}>Cancel</button>
              <button onClick={sendMeetingLink} className={styles['send-link-btn']}>Send Link</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className={styles['modal-overlay']} onClick={() => setShowCancelModal(false)}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              <h2>Cancel Interview</h2>
              <p>Confirm cancellation</p>
            </div>
            
            <div className={styles['modal-body']}>
              <p style={{ color: '#333', marginBottom: '12px' }}>
                Are you sure you want to cancel the interview with <strong>{selectedVendor?.name}</strong>?
              </p>
              <p style={{ color: '#d32f2f', fontSize: '14px', margin: 0 }}>
                This action will remove all scheduled slots and interview code.
              </p>
            </div>

            <div className={styles['modal-actions']}>
              <button onClick={() => setShowCancelModal(false)} className={styles['cancel-btn']}>No, Keep It</button>
              <button onClick={confirmCancel} className={styles['delete-btn']}>Yes, Cancel Interview</button>
            </div>
          </div>
        </div>
      )}

      {/* Notify Modal */}
      {showNotifyModal && (
        <div className={styles['modal-overlay']} onClick={() => setShowNotifyModal(false)}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              <h2>Send Interview Reminder</h2>
              <p>To {selectedVendor?.name}</p>
            </div>
            
            <div className={styles['modal-body']}>
              <p style={{ color: '#333', marginBottom: '12px' }}>
                Send interview reminder via WhatsApp to <strong>{selectedVendor?.name}</strong>?
              </p>
              <div style={{ 
                background: '#f9f9f9', 
                border: '1px solid #e0e0e0', 
                borderRadius: '6px', 
                padding: '12px',
                fontSize: '13px',
                color: '#555',
                lineHeight: '1.6'
              }}>
                <strong>Message Preview:</strong><br/>
                <em>
                  "Dear {selectedVendor?.name}, this is a reminder about your upcoming interview with Astrovaani. 
                  Please be available at the scheduled time. Interview details and meeting link have been shared earlier. 
                  Contact support@astrovaani.com for any queries."
                </em>
              </div>
            </div>

            <div className={styles['modal-actions']}>
              <button onClick={() => setShowNotifyModal(false)} className={styles['cancel-btn']}>Cancel</button>
              <button onClick={confirmNotify} className={styles['confirm-btn']}>Send Reminder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewsPage;
