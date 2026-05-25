import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './AdminTable.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const InterviewFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    skillsRating: '',
    communicationRating: '',
    adaptability: '',
    notes: ''
  });

  useEffect(() => {
    fetchVendorDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/vendors/${id}`);
      const data = await response.json();
      setVendor(data);
      
      // Populate form with existing feedback data if available
      setFeedback({
        rating: data.interviewRating || '',
        notes: data.interviewNotes || '',
        interviewStatus: data.interviewStatus || 'completed',
        onboardingDecision: data.onboardingstatus || ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      setLoading(false);
      alert('Failed to load vendor details');
    }
  };

  const getConfirmedSlot = () => {
    if (!vendor?.schedules) return null;
    return vendor.schedules.find(s => s.status === 'confirmed');
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.skillsRating) {
      alert('Please provide a Skills Rating');
      return;
    }
    if (!feedback.communicationRating) {
      alert('Please provide a Communication Rating');
      return;
    }
    if (!feedback.adaptability) {
      alert('Please provide Adaptability');
      return;
    }
    try {
      setSubmitting(true);
      // Update vendor with interview feedback
      const response = await fetch(`${API_URL}/vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillsRating: feedback.skillsRating,
          communicationRating: feedback.communicationRating,
          adaptability: feedback.adaptability,
          interviewNotes: feedback.notes,
          interviewStatus: 'completed',
          onboardingstatus: 'inprocess',
          status: 'inprocess',
          interviewCompletedAt: new Date().toISOString()
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const message = vendor.interviewCompletedAt 
          ? 'Interview feedback updated successfully!' 
          : 'Interview feedback saved successfully!';
        alert(message);
        navigate('/admindashboard/interviews');
      } else {
        alert(data.message || 'Failed to save feedback');
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      alert('Failed to save interview feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure? Unsaved changes will be lost.')) {
      navigate('/admindashboard/interviews');
    }
  };

  if (loading) {
    return (
      <div className={styles['admin-container']} style={{ 
        padding: 'clamp(12px, 3vw, 20px)',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: 'clamp(40px, 10vw, 60px) clamp(16px, 4vw, 20px)', 
          color: '#666',
          fontSize: 'clamp(14px, 3.5vw, 16px)'
        }}>
          Loading vendor details...
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className={styles['admin-container']} style={{ 
        padding: 'clamp(12px, 3vw, 20px)',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: 'clamp(40px, 10vw, 60px) clamp(16px, 4vw, 20px)', 
          color: '#d32f2f' 
        }}>
          <h2 style={{ 
            fontSize: 'clamp(18px, 5vw, 22px)',
            marginBottom: 'clamp(12px, 3vw, 20px)'
          }}>
            Vendor not found
          </h2>
          <button 
            onClick={() => navigate('/admindashboard/interviews')}
            className={styles['action-btn']}
            style={{ 
              marginTop: 'clamp(12px, 3vw, 20px)',
              padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
              fontSize: 'clamp(13px, 3.5vw, 14px)'
            }}
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  const confirmedSlot = getConfirmedSlot();

  return (
    <div className={styles['admin-container']} style={{ 
      padding: 'clamp(12px, 3vw, 20px)',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ 
          fontSize: 'clamp(20px, 5vw, 24px)', 
          fontWeight: '600', 
          marginBottom: '8px', 
          color: '#101820' 
        }}>
          Interview Feedback Form
        </h1>
        <p style={{ 
          fontSize: 'clamp(12px, 3vw, 14px)', 
          color: '#666',
          wordBreak: 'break-word'
        }}>
          {vendor.interviewCompletedAt 
            ? `Editing feedback for ${vendor.name} (Last saved: ${new Date(vendor.interviewCompletedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })})`
            : `Complete the interview feedback for ${vendor.name}`
          }
        </p>
        {vendor.interviewCompletedAt && (
          <div style={{
            marginTop: '12px',
            padding: '10px 16px',
            backgroundColor: '#e3f2fd',
            border: '1px solid #90caf9',
            borderRadius: '6px',
            fontSize: 'clamp(11px, 2.5vw, 13px)',
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '16px' }}>ℹ️</span>
            <span>This vendor already has saved feedback. You can edit and update it.</span>
          </div>
        )}
      </div>

      {/* Vendor Info Card */}
      <div style={{
        background: '#f9f9f9',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: 'clamp(12px, 3vw, 20px)',
        marginBottom: '24px'
      }}>
        <h3 style={{ 
          fontSize: 'clamp(14px, 3.5vw, 16px)', 
          fontWeight: '600', 
          marginBottom: '16px', 
          color: '#101820' 
        }}>
          Vendor Information
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: 'clamp(12px, 3vw, 16px)' 
        }}>
          <div>
            <p style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: '#666', marginBottom: '4px' }}>Name</p>
            <p style={{ 
              fontSize: 'clamp(12px, 3vw, 14px)', 
              fontWeight: '500', 
              color: '#222',
              wordBreak: 'break-word'
            }}>{vendor.name}</p>
          </div>
          <div>
            <p style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: '#666', marginBottom: '4px' }}>Category</p>
            <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: '500', color: '#222' }}>{vendor.category || 'N/A'}</p>
          </div>
          <div>
            <p style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: '#666', marginBottom: '4px' }}>Phone</p>
            <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: '500', color: '#222' }}>{vendor.phone || 'N/A'}</p>
          </div>
          <div>
            <p style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: '#666', marginBottom: '4px' }}>Interview Time</p>
            <p style={{ 
              fontSize: 'clamp(12px, 3vw, 14px)', 
              fontWeight: '500', 
              color: '#222',
              wordBreak: 'break-word'
            }}>
              {confirmedSlot ? formatDate(confirmedSlot.scheduledAt) : 'Not scheduled'}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: 'clamp(16px, 4vw, 24px)'
        }}>
          <h3 style={{ 
            fontSize: 'clamp(14px, 3.5vw, 16px)', 
            fontWeight: '600', 
            marginBottom: '20px', 
            color: '#101820' 
          }}>
            Interview Feedback
          </h3>

          {/* Rating */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: 'clamp(12px, 3vw, 14px)', 
              fontWeight: '500', 
              marginBottom: '8px', 
              color: '#222' 
            }}>
              Skills Rating <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <select
              value={feedback.skillsRating}
              onChange={(e) => setFeedback({ ...feedback, skillsRating: e.target.value })}
              style={{
                width: '100%',
                padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 12px)',
                fontSize: 'clamp(12px, 3vw, 14px)',
                border: '1px solid #ccc',
                borderRadius: '6px',
                outline: 'none'
              }}
              required
            >
              <option value="">Select rating</option>
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Good</option>
              <option value="3">⭐⭐⭐ Average</option>
              <option value="2">⭐⭐ Below Average</option>
              <option value="1">⭐ Poor</option>
            </select>
          </div>

          {/* Communication Rating */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#222'
            }}>
              Communication Rating <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <select
              value={feedback.communicationRating}
              onChange={(e) => setFeedback({ ...feedback, communicationRating: e.target.value })}
              style={{
                width: '100%',
                padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 12px)',
                fontSize: 'clamp(12px, 3vw, 14px)',
                border: '1px solid #ccc',
                borderRadius: '6px',
                outline: 'none'
              }}
              required
            >
              <option value="">Select rating</option>
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Good</option>
              <option value="3">⭐⭐⭐ Average</option>
              <option value="2">⭐⭐ Below Average</option>
              <option value="1">⭐ Poor</option>
            </select>
          </div>

          {/* Adaptability */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#222'
            }}>
              Adaptability <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <select
              value={feedback.adaptability}
              onChange={(e) => setFeedback({ ...feedback, adaptability: e.target.value })}
              style={{
                width: '100%',
                padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 12px)',
                fontSize: 'clamp(12px, 3vw, 14px)',
                border: '1px solid #ccc',
                borderRadius: '6px',
                outline: 'none'
              }}
              required
            >
              <option value="">Select adaptability</option>
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Good</option>
              <option value="3">⭐⭐⭐ Average</option>
              <option value="2">⭐⭐ Below Average</option>
              <option value="1">⭐ Poor</option>
            </select>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: 'clamp(12px, 3vw, 14px)', 
              fontWeight: '500', 
              marginBottom: '8px', 
              color: '#222' 
            }}>
              Interview Notes or Review
            </label>
            <textarea
              value={feedback.notes}
              onChange={(e) => setFeedback({ ...feedback, notes: e.target.value })}
              placeholder="Enter your observations, strengths, weaknesses, etc."
              rows="6"
              style={{
                width: '100%',
                padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 12px)',
                fontSize: 'clamp(12px, 3vw, 14px)',
                border: '1px solid #ccc',
                borderRadius: '6px',
                outline: 'none',
                fontFamily: '"Roboto", sans-serif',
                resize: 'vertical'
              }}
            />
          </div>


          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row',
            justifyContent: 'flex-end', 
            gap: 'clamp(0.75rem, 2vw, 1rem)', 
            marginTop: 'clamp(1.5rem, 4vw, 2rem)',
            paddingTop: 'clamp(1rem, 3vw, 1.5rem)',
            borderTop: '1px solid #e0e0e0',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              style={{
                padding: 'clamp(0.6rem, 2vw, 0.75rem) clamp(1.2rem, 4vw, 2rem)',
                backgroundColor: '#fff',
                color: '#666',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                minWidth: 'clamp(100px, 25vw, 120px)',
                opacity: submitting ? 0.6 : 1,
                flex: '1 1 auto',
                maxWidth: '200px'
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.target.style.backgroundColor = '#f5f5f5';
                  e.target.style.borderColor = '#999';
                  e.target.style.color = '#333';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.borderColor = '#ddd';
                  e.target.style.color = '#666';
                }
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!feedback.skillsRating || !feedback.communicationRating || !feedback.adaptability || submitting}
              style={{
                padding: 'clamp(0.6rem, 2vw, 0.75rem) clamp(1.2rem, 4vw, 2rem)',
                backgroundColor: (feedback.skillsRating && feedback.communicationRating && feedback.adaptability && !submitting) ? '#ffd600' : '#e0e0e0',
                color: (feedback.skillsRating && feedback.communicationRating && feedback.adaptability && !submitting) ? '#000' : '#999',
                border: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                fontWeight: '600',
                cursor: (feedback.skillsRating && feedback.communicationRating && feedback.adaptability && !submitting) ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                minWidth: 'clamp(140px, 35vw, 160px)',
                flex: '1 1 auto',
                maxWidth: '250px'
              }}
              onMouseEnter={(e) => {
                if (feedback.skillsRating && feedback.communicationRating && feedback.adaptability && !submitting) {
                  e.target.style.backgroundColor = '#ffed4e';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 214, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (feedback.skillsRating && feedback.communicationRating && feedback.adaptability && !submitting) {
                  e.target.style.backgroundColor = '#ffd600';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {submitting 
                ? 'Saving...' 
                : vendor.interviewCompletedAt 
                  ? 'Update Feedback' 
                  : 'Save Feedback'
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InterviewFeedback;
