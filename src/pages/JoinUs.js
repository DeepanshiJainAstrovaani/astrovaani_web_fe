import React, { useState } from 'react';
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
  photo: null
};

const GENDERS = ['Male', 'Female', 'Other'];
const CATEGORIES = ['Astrologer', 'Numerologist', 'Tarot Reader'];
const REASONS = ['Not Getting Enough Clients', 'Want to Grow Professionally', 'Other'];
const AGES = Array.from({ length: 83 }, (_, i) => i + 18); // 18-100
const EXPERIENCES = ['<1 year', '1-3 years', '3-5 years', '5+ years'];

export default function JoinUs() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
    if (!form.name) newErrors.name = 'Required';
    if (!form.whatsapp || !/^\d{10}$/.test(form.whatsapp)) newErrors.whatsapp = 'Valid 10-digit WhatsApp required';
    if (!form.gender) newErrors.gender = 'Required';
    if (!form.age) newErrors.age = 'Required';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Valid email required';
    if (!form.qualifications) newErrors.qualifications = 'Required';
    if (!form.skills) newErrors.skills = 'Required';
    if (!form.languages) newErrors.languages = 'Required';
    if (!form.experience) newErrors.experience = 'Required';
    if (!form.state) newErrors.state = 'Required';
    if (!form.city) newErrors.city = 'Required';
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) newErrors.pincode = 'Valid 6-digit pincode required';
    if (!form.category) newErrors.category = 'Required';
    if (!form.reason) newErrors.reason = 'Required';
    if (!form.photo) newErrors.photo = 'Photo required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSuccess(false);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'photo') {
          if (value) formData.append('photo', value);
        } else {
          formData.append(key, value);
        }
      });
      const res = await fetch(`${API_URL}/joinus`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

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
              <div>
                <label>Your Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Enter here" className={styles.input} />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
              </div>
              <div>
                <label>Whatsapp Number (without +91) *</label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="Enter here" className={styles.input} />
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
            </div>
            <button type="submit" className={styles.submitBtn} disabled={submitting} style={{ marginTop: 32 }}>Submit</button>
            {errors.submit && <div className={styles.error} style={{ marginTop: 12 }}>{errors.submit}</div>}
            {success && <div style={{ color: '#22c55e', fontWeight: 600, marginTop: 12 }}>Form submitted successfully!</div>}
          </form>
        </div>
      </div>
    </>
  );
}
