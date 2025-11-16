import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Verify OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  // Handle phone number submission
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    // Send OTP
    const result = await sendOTP(phoneNumber);
    setLoading(false);

    if (result.success) {
      // TEMPORARY: Log OTP for testing (remove in production)
      if (result.data?.otp) {
        console.log('🔐 OTP for testing:', result.data.otp);
        alert(`Testing Mode: Your OTP is ${result.data.otp}`);
      }
      setStep(2); // Move to OTP verification step
    } else {
      setError(result.error);
    }
  };

  // Handle OTP verification
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate OTP (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    // Verify OTP
    const result = await verifyOTP(phoneNumber, otp);
    setLoading(false);

    if (result.success) {
      navigate('/admin'); // Redirect to admin dashboard
    } else {
      setError(result.error);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    const result = await sendOTP(phoneNumber);
    setLoading(false);

    if (result.success) {
      alert('OTP sent successfully!');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Astrovaani</h1>
          <p>Admin Panel</p>
        </div>

        {step === 1 ? (
          // Step 1: Enter Phone Number
          <div className="login-step">
            <h2>Login to admin panel</h2>
            <form onSubmit={handlePhoneSubmit}>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength="10"
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button 
                type="submit" 
                className="btn-continue"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>
          </div>
        ) : (
          // Step 2: Verify OTP
          <div className="login-step">
            <h2>Verify OTP</h2>
            <p className="otp-sent-message">
              OTP has been sent to WhatsApp number ending with ***{phoneNumber.slice(-4)}
            </p>
            
            <form onSubmit={handleOTPSubmit}>
              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="tel"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button 
                type="submit" 
                className="btn-continue"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <div className="secondary-actions">
                <button 
                  type="button" 
                  className="btn-link"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Resend OTP
                </button>

                <button 
                  type="button" 
                  className="btn-link"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                  }}
                  disabled={loading}
                >
                  Change Number
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
