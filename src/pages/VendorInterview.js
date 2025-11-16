import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import logo from '../assets/logo_dark.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Responsive helper hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

export default function VendorInterview() {
  const [searchParams] = useSearchParams();
  const interviewCode = searchParams.get('code');
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInterview = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/vendors/interview/${interviewCode}`);
      const data = await response.json();

      console.log('📥 Interview data received:', {
        success: data.success,
        isScheduled: data.isScheduled,
        availableSlots: data.availableSlots?.length,
        confirmedSlot: data.confirmedSlot ? 'Yes' : 'No',
        onboardingstatus: data.vendor?.onboardingstatus
      });

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load interview details');
      }

      setInterview(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching interview:', err);
      setError(err.message || 'Failed to load interview details');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!interviewCode) {
      setError('Invalid interview link. Please check your WhatsApp message.');
      setLoading(false);
      return;
    }
    fetchInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewCode]);

  const handleSelectSlot = async (e) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch(`${API_URL}/vendors/interview/${interviewCode}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slotId: selectedSlot }),
      });

      const data = await response.json();

      console.log('✅ Slot selection response:', {
        success: data.success,
        confirmedSlot: data.confirmedSlot,
        removedSlots: data.removedSlots
      });

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to confirm slot');
      }

      // Update interview state with confirmed slot and scheduled status
      setInterview({ 
        ...interview, 
        confirmedSlot: data.confirmedSlot, 
        isScheduled: true,
        availableSlots: [] // Clear available slots since interview is now scheduled
      });
    } catch (err) {
      console.error('Error selecting slot:', err);
      setError(err.message || 'Failed to confirm slot');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div style={getStyles(isMobile).container}>
        <div style={getStyles(isMobile).card}>
          <div style={getStyles(isMobile).loader}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div style={getStyles(isMobile).container}>
        <div style={getStyles(isMobile).card}>
          <div style={getStyles(isMobile).errorBox}>
            <h2 style={getStyles(isMobile).errorTitle}>⚠️ Error</h2>
            <p style={getStyles(isMobile).errorMessage}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div style={getStyles(isMobile).container}>
        <div style={getStyles(isMobile).card}>
          <div style={getStyles(isMobile).errorBox}>
            <h2 style={getStyles(isMobile).errorTitle}>⚠️ Not Found</h2>
            <p style={getStyles(isMobile).errorMessage}>Interview not found. Please check your link.</p>
          </div>
        </div>
      </div>
    );
  }

  // If already scheduled, show confirmation
  if (interview.isScheduled && interview.confirmedSlot) {
    // Check if interview is completed (vendor status is inprocess or active)
    const isInterviewCompleted = interview.vendor.onboardingstatus === 'inprocess' || 
                                  interview.vendor.onboardingstatus === 'active';
    
    if (isInterviewCompleted) {
      // Show completion message
      return (
        <div style={getStyles(isMobile).container}>
          <div style={getStyles(isMobile).header}>
            <img src={logo} alt="Astrovaani" style={getStyles(isMobile).logo} />
          </div>
          
          <div style={getStyles(isMobile).card}>
            <div style={getStyles(isMobile).successBox}>
              <h1 style={getStyles(isMobile).successTitle}>🎉 Interview Completed!</h1>
              <p style={getStyles(isMobile).successMessage}>
                Thank you for attending your interview with Astrovaani. Our team has reviewed your profile and interview performance.
              </p>

              <div style={{...getStyles(isMobile).confirmedSlotBox, backgroundColor: '#e3f2fd', borderColor: '#90caf9'}}>
                <div style={getStyles(isMobile).infoRow}>
                  <span style={getStyles(isMobile).icon}>✅</span>
                  <div>
                    <p style={getStyles(isMobile).label}>Status</p>
                    <p style={getStyles(isMobile).value}>Interview Completed Successfully</p>
                  </div>
                </div>

                <div style={getStyles(isMobile).infoRow}>
                  <span style={getStyles(isMobile).icon}>📄</span>
                  <div>
                    <p style={getStyles(isMobile).label}>Next Steps</p>
                    <p style={getStyles(isMobile).value}>
                      You will receive an agreement document via WhatsApp shortly. Please review and sign it to proceed with the onboarding process.
                    </p>
                  </div>
                </div>

                <div style={getStyles(isMobile).infoRow}>
                  <span style={getStyles(isMobile).icon}>📞</span>
                  <div>
                    <p style={getStyles(isMobile).label}>Need Help?</p>
                    <p style={getStyles(isMobile).value}>
                      Contact us at support@astrovaani.com for any queries.
                    </p>
                  </div>
                </div>
              </div>

              <p style={{...getStyles(isMobile).note, color: '#1976d2'}}>
                We appreciate your patience and look forward to having you on our platform! 🌟
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    // Show scheduled confirmation (interview not completed yet)
    return (
      <div style={getStyles(isMobile).container}>
        <div style={getStyles(isMobile).header}>
          <img src={logo} alt="Astrovaani" style={getStyles(isMobile).logo} />
        </div>
        
        <div style={getStyles(isMobile).card}>
          <div style={getStyles(isMobile).successBox}>
            <h1 style={getStyles(isMobile).successTitle}>✅ Interview Scheduled Successfully!</h1>
            <p style={getStyles(isMobile).successMessage}>
              Your interview has been confirmed. Be prepared and available at the selected time.
            </p>

            <div style={getStyles(isMobile).confirmedSlotBox}>
              <div style={getStyles(isMobile).infoRow}>
                <span style={getStyles(isMobile).icon}>👤</span>
                <div>
                  <p style={getStyles(isMobile).label}>Vendor Name</p>
                  <p style={getStyles(isMobile).value}>{interview.vendor.name}</p>
                </div>
              </div>

              <div style={getStyles(isMobile).infoRow}>
                <span style={getStyles(isMobile).icon}>🕐</span>
                <div>
                  <p style={getStyles(isMobile).label}>Interview Time</p>
                  <p style={getStyles(isMobile).value}>{formatDate(interview.confirmedSlot.scheduledAt)}</p>
                </div>
              </div>

              <div style={getStyles(isMobile).infoRow}>
                <span style={getStyles(isMobile).icon}>⏱️</span>
                <div>
                  <p style={getStyles(isMobile).label}>Duration</p>
                  <p style={getStyles(isMobile).value}>{interview.confirmedSlot.duration} minutes</p>
                </div>
              </div>
            </div>

            <p style={getStyles(isMobile).note}>
              Good luck with your interview! 🎉
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show slot selection
  return (
    <div style={getStyles(isMobile).container}>
      <div style={getStyles(isMobile).header}>
        <img src={logo} alt="Astrovaani" style={getStyles(isMobile).logo} />
      </div>

      <div style={getStyles(isMobile).contentWrapper}>
        <div style={getStyles(isMobile).loginPanel}>
          <h1 style={getStyles(isMobile).title}>Select a time for your interview</h1>
          <p style={getStyles(isMobile).subtitle}>
            Showing available slots below. Select carefully you can't change the interview timing once scheduled
          </p>

          {error && (
            <div style={getStyles(isMobile).errorMessageBox}>
              {error}
            </div>
          )}

          <div style={getStyles(isMobile).paymentBase}>
            {interview.availableSlots.length === 0 ? (
              <div style={getStyles(isMobile).errorBox}>
                <p style={getStyles(isMobile).errorMessage}>No slots available. Please contact support.</p>
              </div>
            ) : (
              <form onSubmit={handleSelectSlot}>
                <div style={getStyles(isMobile).slotsGrid}>
                  {interview.availableSlots.map((slot) => (
                    <div key={slot.id} style={getStyles(isMobile).slotWrapper}>
                      <label
                        style={{
                          ...getStyles(isMobile).slotCard,
                          ...(selectedSlot === slot.id ? getStyles(isMobile).slotCardSelected : {})
                        }}
                        onClick={() => setSelectedSlot(slot.id)}
                      >
                        <div style={getStyles(isMobile).slotContent}>
                          <div style={getStyles(isMobile).calendarIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={getStyles(isMobile).calendarSvg}>
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </div>
                          <h3 style={getStyles(isMobile).timeLimit}>{formatDate(slot.scheduledAt)}</h3>
                        </div>
                        <div style={getStyles(isMobile).radioWrapper}>
                          <input
                            type="radio"
                            name="timing"
                            value={slot.id}
                            checked={selectedSlot === slot.id}
                            onChange={(e) => setSelectedSlot(e.target.value)}
                            style={getStyles(isMobile).radioInput}
                          />
                          <span style={getStyles(isMobile).radioSpan}></span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                <div style={getStyles(isMobile).buttonWrapper}>
                  <br />
                  <button
                    type="submit"
                    disabled={!selectedSlot || submitting}
                    style={{
                      ...getStyles(isMobile).submitButton,
                      ...((!selectedSlot || submitting) ? getStyles(isMobile).submitButtonDisabled : {})
                    }}
                  >
                    {submitting ? 'Scheduling...' : 'Schedule'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p style={getStyles(isMobile).supportText}>
            Need help? Contact us at <a href="mailto:support@astrovaani.com" style={getStyles(isMobile).link}>support@astrovaani.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

const getStyles = (isMobile) => ({
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '0',
    fontFamily: '"Roboto", sans-serif',
    lineHeight: '1.5',
    fontSize: isMobile ? '14px' : '15px',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  header: {
    backgroundColor: '#fff',
    padding: isMobile ? '12px 16px' : '16px 20px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  logo: {
    height: isMobile ? '28px' : '32px',
    objectFit: 'contain',
  },
  contentWrapper: {
    padding: isMobile ? '8px' : '12px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loginPanel: {
    background: '#ffffff',
    border: 'solid 1px #FAEAF9',
    padding: isMobile ? '12px 16px' : '16px 20px',
    borderRadius: isMobile ? '8px' : '12px',
    width: '100%',
  },
  title: {
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '600',
    marginTop: isMobile ? '2vh' : '3vh',
    marginBottom: '0vh',
    color: '#101820',
    lineHeight: '110%',
  },
  subtitle: {
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: '400',
    marginTop: '0.5vh',
    marginBottom: '0vh',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  paymentBase: {
    background: '#ffffff',
    marginTop: '2vh',
    borderRadius: '5px',
    padding: '0px',
    width: '100%',
  },
  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: isMobile ? '12px' : '20px',
    marginBottom: isMobile ? '16px' : '20px',
  },
  slotWrapper: {
    width: '100%',
  },
  slotCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: isMobile ? '12px 14px' : '15px 20px',
    border: 'solid 1px #e0e0e0',
    borderRadius: isMobile ? '6px' : '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#fafafa',
    minHeight: isMobile ? '56px' : 'auto',
  },
  slotCardSelected: {
    border: 'solid 1px #ffea00',
    backgroundColor: '#fffef0',
  },
  slotContent: {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '10px',
    flex: 1,
  },
  calendarIcon: {
    backgroundColor: '#ffd600',
    borderRadius: isMobile ? '6px' : '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isMobile ? '32px' : '35px',
    height: isMobile ? '32px' : '35px',
    flexShrink: 0,
  },
  calendarSvg: {
    width: isMobile ? '20px' : '24px',
    height: isMobile ? '20px' : '24px',
    color: '#000',
  },
  timeLimit: {
    fontSize: isMobile ? '13px' : '15px',
    fontWeight: '500',
    margin: 0,
    color: '#101820',
    lineHeight: '1.4',
  },
  radioWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '0.8vh',
  },
  radioInput: {
    width: isMobile ? '20px' : '18px',
    height: isMobile ? '20px' : '18px',
    cursor: 'pointer',
    accentColor: '#ffea00',
  },
  radioSpan: {
    marginLeft: '5px',
  },
  buttonWrapper: {
    width: '100%',
    marginTop: isMobile ? '16px' : '20px',
  },
  submitButton: {
    padding: isMobile ? '14px 28px' : '12px 32px',
    background: '#ffd600',
    border: 'none',
    borderRadius: isMobile ? '6px' : '8px',
    fontSize: isMobile ? '15px' : '16px',
    fontWeight: '600',
    color: '#000',
    cursor: 'pointer',
    transition: 'all 0.2s',
    float: 'left',
    width: isMobile ? '100%' : 'auto',
    minHeight: isMobile ? '48px' : 'auto',
  },
  submitButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  supportText: {
    marginTop: isMobile ? '5rem' : '32px',
    textAlign: 'center',
    fontSize: isMobile ? '13px' : '15px',
    color: '#666',
  },
  link: {
    color: '#ffd600',
    textDecoration: 'none',
    fontWeight: '500',
  },
  loader: {
    textAlign: 'center',
    fontSize: isMobile ? '16px' : '18px',
    color: '#666',
    fontWeight: '500',
    padding: isMobile ? '40px 16px' : '60px 20px',
  },
  errorBox: {
    padding: isMobile ? '20px 16px' : '32px',
    backgroundColor: '#fff3f3',
    border: '1px solid #ffcdd2',
    borderRadius: isMobile ? '6px' : '8px',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: isMobile ? '18px' : '20px',
    color: '#d32f2f',
    marginBottom: '12px',
    fontWeight: '600',
  },
  errorMessage: {
    fontSize: isMobile ? '14px' : '16px',
    color: '#d32f2f',
    margin: '12px 0',
    lineHeight: '1.5',
  },
  errorMessageBox: {
    padding: isMobile ? '10px 12px' : '12px 16px',
    backgroundColor: '#fff3f3',
    border: '1px solid #ffcdd2',
    borderRadius: isMobile ? '6px' : '8px',
    color: '#d32f2f',
    fontSize: isMobile ? '13px' : '14px',
    marginTop: '12px',
  },
  card: {
    background: '#ffffff',
    padding: isMobile ? '16px' : '24px',
    borderRadius: isMobile ? '8px' : '12px',
    maxWidth: '800px',
    margin: '16px auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  successBox: {
    textAlign: 'center',
  },
  successTitle: {
    fontSize: isMobile ? '18px' : '24px',
    color: '#2e7d32',
    marginBottom: isMobile ? '12px' : '16px',
    fontWeight: '600',
    lineHeight: '1.3',
  },
  successMessage: {
    fontSize: isMobile ? '14px' : '16px',
    color: '#666',
    marginBottom: isMobile ? '24px' : '32px',
    lineHeight: '1.6',
  },
  confirmedSlotBox: {
    backgroundColor: '#e8f5e9',
    border: '1px solid #81c784',
    borderRadius: isMobile ? '6px' : '8px',
    padding: isMobile ? '16px' : '24px',
    marginBottom: isMobile ? '16px' : '24px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '12px' : '16px',
    marginBottom: isMobile ? '12px' : '16px',
    textAlign: 'left',
  },
  icon: {
    fontSize: isMobile ? '24px' : '28px',
    lineHeight: 1,
  },
  label: {
    fontSize: isMobile ? '12px' : '14px',
    color: '#666',
    margin: 0,
    fontWeight: '500',
  },
  value: {
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: '600',
    color: '#222',
    margin: '4px 0 0 0',
    lineHeight: '1.4',
  },
  note: {
    fontSize: isMobile ? '14px' : '16px',
    color: '#2e7d32',
    fontWeight: '600',
    marginTop: isMobile ? '12px' : '16px',
  },
});
