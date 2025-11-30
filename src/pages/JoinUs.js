import React, { useState } from 'react';
import Modal from 'react-modal';
import styles from './JoinUs.module.css';
import Header from '../components/Header';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const initialForm = {
  name: '',
  whatsapp: '',
  altmobile: '',
  gender: '',
  age: '',
  email: '',
  qualifications: '',
  skills: '',
  languages: '',
  experience: '',
  state: '',
  city: '',
  pincode: '',
  category: '',
  reason: '',
  photo: null,
  photoPreview: null
};

const GENDERS = ['Male', 'Female', 'Other'];
const CATEGORIES = ['Astrologer', 'Numerologist', 'Tarot Reader'];
const REASONS = ['Not Getting Enough Clients', 'Want to Grow Professionally', 'Other'];
const AGES = Array.from({ length: 83 }, (_, i) => i + 18); // 18-100
const EXPERIENCES = ['<1 year', '1-3 years', '3-5 years', '5+ years'];

export default function JoinUs() {
    // Handle OTP input change
    const handleOtpChange = (value, idx) => {
      if (!/^[0-9]?$/.test(value)) return;
      const newOtp = [...otp];
      newOtp[idx] = value;
      setOtp(newOtp);
      // Auto-focus next input if value entered
      if (value && idx < 5) {
        const nextInput = document.getElementById(`otp-input-${idx + 1}`);
        if (nextInput) nextInput.focus();
      }
      // Auto-focus previous input if deleted
      if (!value && idx > 0) {
        const prevInput = document.getElementById(`otp-input-${idx - 1}`);
        if (prevInput) prevInput.focus();
      }
    };

    // Handle OTP verification
    const handleVerifyOtpModal = async () => {
      setOtpVerifying(true);
      setOtpError('');
      const enteredOtp = otp.join('');
      if (enteredOtp.length !== 6) {
        setOtpError('Please enter all 6 digits.');
        setOtpVerifying(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: form.whatsapp, otp: enteredOtp })
        });
        const data = await res.json();
        if (data.success) {
          setOtpVerified(true);
          setSuccess(true);
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
            setOtpModalOpen(false);
          }, 1200);
        } else {
          setOtpError(data.message || 'Invalid OTP.');
        }
      } catch (err) {
        setOtpError('Failed to verify OTP.');
      }
      setOtpVerifying(false);
    };
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setForm(f => ({ ...f, photo: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};
    // Regex patterns
    const nameRegex = /^[A-Za-z ]{2,}$/;
    const whatsappRegex = /^\d{10}$/;
    const emailRegex = /^\S+@\S+\.\S+$/;
    const pincodeRegex = /^\d{6}$/;

    if (!form.name || !nameRegex.test(form.name)) newErrors.name = 'Please enter your full name (letters only).';
    if (!form.whatsapp || !whatsappRegex.test(form.whatsapp)) newErrors.whatsapp = 'Please enter a valid 10-digit WhatsApp number.';
    if (!form.gender) newErrors.gender = 'Please select your gender.';
    if (!form.age) newErrors.age = 'Please select your age.';
    if (!form.email || !emailRegex.test(form.email)) newErrors.email = 'Please enter a valid email address.';
    if (!form.qualifications) newErrors.qualifications = 'Please enter your qualifications.';
    if (!form.skills) newErrors.skills = 'Please enter your skills.';
    if (!form.languages) newErrors.languages = 'Please enter the languages you know.';
    if (!form.experience) newErrors.experience = 'Please select your experience.';
    if (!form.state) newErrors.state = 'Please enter your state.';
    if (!form.city) newErrors.city = 'Please enter your city.';
    if (!form.pincode || !pincodeRegex.test(form.pincode)) newErrors.pincode = 'Please enter a valid 6-digit pincode.';
    if (!form.category) newErrors.category = 'Please select your category.';
    if (!form.reason) newErrors.reason = 'Please select your reason to join.';
    if (!form.photo) newErrors.photo = 'Please upload your photo.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error field
      const errorFields = [
        'name', 'whatsapp', 'gender', 'age', 'email', 'qualifications', 'skills', 'languages', 'experience', 'state', 'city', 'pincode', 'category', 'reason', 'photo'
      ];
      for (const field of errorFields) {
        if (newErrors[field]) {
          const el = document.querySelector(`[name='${field}']`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          }
          break;
        }
      }
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setOtp(['', '', '', '', '', '']);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpError('');
    try {
      // First, check for duplicate before sending OTP
      const dupRes = await fetch(`${API_URL}/vendors/check-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp: form.whatsapp, email: form.email })
      });
      if (dupRes.status === 409) {
        const data = await dupRes.json();
        let errorObj = {};
        if (data.message && data.message.toLowerCase().includes('whatsapp')) {
          errorObj.whatsapp = data.message;
          // Scroll to WhatsApp field
          const el = document.querySelector("[name='whatsapp']");
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          }
        } else if (data.message && data.message.toLowerCase().includes('email')) {
          errorObj.email = data.message;
          // Scroll to Email field
          const el = document.querySelector("[name='email']");
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          }
        } else {
          errorObj.submit = data.message || 'WhatsApp or email already exists.';
        }
        setErrors(prev => ({ ...prev, ...errorObj }));
        return;
      }
      // If not duplicate, send OTP using JoinUs template
      const res = await fetch(`${API_URL}/auth/whatsapp/joinus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: form.whatsapp })
      });
      // Only open OTP modal if OTP sent successfully
      setOtpModalOpen(true);
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: 'Failed to send OTP. Please try again.' }));
    }
  }
  return (
      <>
        <Header />
        <div className={styles.pageBg}>
          <div className={styles.container}>
            <h1 className={styles.title}>Join Astrovaani</h1>
            <p className={styles.subtitle}>As an astrologer, tarot reader or numerologist</p>
            <div className={styles.stepsRow}>
              {[{
                img: require('../assets/form.png'),
                title: 'Fill the Form',
                desc: 'Submit your details for onboarding',
                number: 1,
                viewForm: true
              }, {
                img: require('../assets/interview.png'),
                title: 'Live Interview',
                desc: 'Our team will take your interview to verify your skills',
                number: 2
              }, {
                img: require('../assets/customers.png'),
                title: 'Getting Customers',
                desc: `After onboarding you'll start getting consultations`,
                number: 3
              }].map((step, idx) => (
                <div className={styles.stepBox} key={step.title}>
                  <img src={step.img} alt={step.title} className={styles.stepImg} />
                  <h2 className={styles.stepTitle}>{step.title}</h2>
                  <p className={styles.stepDesc}>{step.desc}</p>
                  {step.viewForm && <span className={styles.viewForm} onClick={() => {
                    document.getElementById('joinus-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}>view form</span>}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.container}>
            <form className={styles.formCard} id="joinus-form" onSubmit={handleSubmit}>
              <h2 className={styles.formTitle}>Your Joining Form</h2>
              <p className={styles.formSubtitle}>Fill the details</p>
              <div className={styles.formGrid}>
                <>
                  <div>
                    <label>Your Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Enter here" className={styles.input} />
                    {errors.name && <span className={styles.error}>{errors.name}</span>}
                  </div>
                  <div>
                    <label>Whatsapp Number (without +91) *</label>
                    <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="Enter here" className={styles.input} inputMode="numeric" pattern="[0-9]*" />
                    {errors.whatsapp && <span className={styles.error}>{errors.whatsapp}</span>}
                  </div>
                  <div>
                    <label>Alternate Mobile no. <span style={{ color: 'red' }}>(Optional)</span></label>
                    <input name="altmobile" value={form.altmobile} onChange={handleChange} placeholder="Enter here" className={styles.input} />
                  </div>
                  <div>
                    <label>Gender *</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className={styles.input}>
                      <option value="">Select</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {errors.gender && <span className={styles.error}>{errors.gender}</span>}
                  </div>
                  <div>
                    <label>Age *</label>
                    <select name="age" value={form.age} onChange={handleChange} className={styles.input}>
                      <option value="">Select</option>
                      {AGES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    {errors.age && <span className={styles.error}>{errors.age}</span>}
                  </div>
                  <div>
                    <label>Email Address *</label>
                    <input name="email" value={form.email} onChange={handleChange} placeholder="Enter here" className={styles.input} />
                    {errors.email && <span className={styles.error}>{errors.email}</span>}
                  </div>
                  <div>
                    <label>Qualifications *</label>
                    <input name="qualifications" value={form.qualifications} onChange={handleChange} placeholder="Enter here" className={styles.input} />
                    {errors.qualifications && <span className={styles.error}>{errors.qualifications}</span>}
                  </div>
                  <div>
                    <label>Skills (Ex- Astrology, Tarot reading) *</label>
                    <input name="skills" value={form.skills} onChange={handleChange} placeholder="Enter here" className={styles.input} />
                    {errors.skills && <span className={styles.error}>{errors.skills}</span>}
                  </div>
                  <div>
                    <label>Languages You Know *</label>
                    <input name="languages" value={form.languages} onChange={handleChange} placeholder="Enter here" className={styles.input} />
                    {errors.languages && <span className={styles.error}>{errors.languages}</span>}
                  </div>
                  <div>
                    <label>Experience *</label>
                    <select name="experience" value={form.experience} onChange={handleChange} className={styles.input}>
                      <option value="">Select</option>
                      {EXPERIENCES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    {errors.experience && <span className={styles.error}>{errors.experience}</span>}
                  </div>
                  <div>
                    <label>Your State *</label>
                    <input name="state" value={form.state} onChange={handleChange} placeholder="Select" className={styles.input} />
                    {errors.state && <span className={styles.error}>{errors.state}</span>}
                  </div>
                  <div>
                    <label>City *</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="Enter here" className={styles.input} />
                    {errors.city && <span className={styles.error}>{errors.city}</span>}
                  </div>
                  <div>
                    <label>Pincode *</label>
                    <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Enter here" className={styles.input} />
                    {errors.pincode && <span className={styles.error}>{errors.pincode}</span>}
                  </div>
                  <div>
                    <label>Choose your Category *</label>
                    <select name="category" value={form.category} onChange={handleChange} className={styles.input}>
                      <option value="">Select</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <span className={styles.error}>{errors.category}</span>}
                  </div>
                  <div>
                    <label>Reason to join Astrovaani *</label>
                    <select name="reason" value={form.reason} onChange={handleChange} className={styles.input}>
                      <option value="">Select</option>
                      {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {errors.reason && <span className={styles.error}>{errors.reason}</span>}
                  </div>
                  <div className={styles.photoRow} style={{ gridColumn: '1 / -1' }}>
                    <label>Upload your Photo *</label>
                    <div className={styles.photoUploadWrap}>
                      <span style={{ color: 'red', fontSize: '0.95em', display: 'block' }}>
                        Make sure your photo should be clear, you should look professional and the background in photo should be minimal/plain
                      </span>
                      <div className={styles.photoPreviewBox}>
                        {form.photoPreview ? (
                          <img src={form.photoPreview} alt="Preview" className={styles.photoPreviewImg} />
                        ) : (
                          <span className={styles.photoPreviewPlaceholder}>Preview</span>
                        )}
                      </div>
                      <input
                        type="file"
                        name="photo"
                        accept="image/*"
                        onChange={e => {
                          handleChange(e);
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = ev => {
                              setForm(f => ({ ...f, photoPreview: ev.target.result }));
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          } else {
                            setForm(f => ({ ...f, photoPreview: null }));
                          }
                        }}
                        className={styles.input}
                      />
                    </div>
                    {errors.photo && <span className={styles.error}>{errors.photo}</span>}
                  </div>
                </>
              </div>
                {success ? (
                  <div style={{ color: '#22c55e', fontWeight: 600, marginTop: 32, fontSize: 18, textAlign: 'center' }}>
                    🎉 Form submitted successfully! We will contact you soon.
                  </div>
                ) : (
                  <button type="submit" className={styles.submitBtn} disabled={submitting} style={{ marginTop: 32 }}>Submit</button>
                )}
                {errors.submit && <div className={styles.error} style={{ marginTop: 12 }}>{errors.submit}</div>}
            </form>
          </div>
        </div>
        {/* OTP Modal */}
        <Modal
          isOpen={otpModalOpen}
          onRequestClose={() => setOtpModalOpen(false)}
          style={{ content: { maxWidth: 400, margin: 'auto', padding: 32, borderRadius: 16, boxShadow: '0 2px 16px #0002', height: '21rem' } }}
          ariaHideApp={false}
        >
          <h2 style={{ textAlign: 'center' }}>OTP Sent</h2>
          <p style={{ textAlign: 'center' }}>OTP has been sent to your WhatsApp number.<br />Please enter the 6-digit OTP below.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '16px 0' }}>
            {otp.map((val, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={val}
                onChange={e => handleOtpChange(e.target.value, idx)}
                style={{ width: 40, height: 40, fontSize: 24, textAlign: 'center', border: '2px solid #ccc', borderRadius: 8 }}
              />
            ))}
          </div>
          {otpError && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: 8 }}>{otpError}</div>}
          <button type="button" onClick={handleVerifyOtpModal} disabled={otpVerifying} style={{ width: '100%', padding: 10, fontSize: 18, borderRadius: 8, background: '#ffd600', fontWeight: 600 }}>
            Verify OTP
          </button>
        </Modal>
        {/* Success Modal with animation */}
        <Modal
          isOpen={showSuccessModal}
          style={{ content: { maxWidth: 300, margin: 'auto', padding: 32, borderRadius: 16, boxShadow: '0 2px 16px #0002', textAlign: 'center' } }}
          ariaHideApp={false}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="30" fill="#22c55e" opacity="0.2" />
              <circle cx="32" cy="32" r="28" fill="#22c55e" opacity="0.4" />
              <path d="M20 34 L30 44 L44 24" stroke="#22c55e" strokeWidth="4" fill="none" strokeDasharray="40" strokeDashoffset="0">
                <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.7s" fill="freeze" />
              </path>
            </svg>
            <h3 style={{ color: '#22c55e', marginTop: 16 }}>Verified Successfully!</h3>
          </div>
        </Modal>
        
        {/* OTP Modal */}
        < Modal
          isOpen={otpModalOpen}
          onRequestClose={() => setOtpModalOpen(false)
          }
          style={{ content: { maxWidth: 400, margin: 'auto', padding: 32, borderRadius: 16, boxShadow: '0 2px 16px #0002' } }}
          ariaHideApp={false}
        >
          <h2 style={{ textAlign: 'center' }}>OTP Sent</h2>
          <p style={{ textAlign: 'center' }}>OTP has been sent to your WhatsApp number.<br />Please enter the 6-digit OTP below.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '16px 0' }}>
            {otp.map((val, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={val}
                onChange={e => handleOtpChange(e.target.value, idx)}
                style={{ width: 40, height: 40, fontSize: 24, textAlign: 'center', border: '2px solid #ccc', borderRadius: 8 }}
              />
            ))}
          </div>
          {otpError && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: 8 }}>{otpError}</div>}
          <button type="button" onClick={handleVerifyOtpModal} disabled={otpVerifying} style={{ width: '100%', padding: 10, fontSize: 18, borderRadius: 8, background: '#ffd600', fontWeight: 600, border: 'none' }}>
            Verify OTP
          </button>
        </Modal >
        {/* Success Modal with animation */}
        < Modal
          isOpen={showSuccessModal}
          style={{ content: { maxWidth: 300, margin: 'auto', padding: 32, borderRadius: 16, boxShadow: '0 2px 16px #0002', textAlign: 'center' } }}
          ariaHideApp={false}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="30" fill="#22c55e" opacity="0.2" />
              <circle cx="32" cy="32" r="28" fill="#22c55e" opacity="0.4" />
              <path d="M20 34 L30 44 L44 24" stroke="#22c55e" strokeWidth="4" fill="none" strokeDasharray="40" strokeDashoffset="0">
                <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.7s" fill="freeze" />
              </path>
            </svg>
            <h3 style={{ color: '#22c55e', marginTop: 16 }}>Verified Successfully!</h3>
          </div>
        </Modal >
      </>
    );
}
