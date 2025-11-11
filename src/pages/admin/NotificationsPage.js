import React, { useState, useRef } from 'react';
import styles from './AdminTable.module.css';

const initialForm = {
  photo: null,
  receiver: '',
  title: '',
  zodiac: '',
  mainText: '',
  link: '',
};

const NotificationsPage = () => {
  const [form, setForm] = useState(initialForm);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [sent, setSent] = useState(false);
  const fileInputRef = useRef();

  const isFormValid = Object.values(form).every(v => v && v !== '');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSend = e => {
    e.preventDefault();
    if (!isFormValid) return;
    setSent(true);
    setTimeout(() => setSent(false), 2000);
    setForm(initialForm);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={styles['admin-container']}>
      <div style={{ background: '#f7f7f7', padding: 32, borderRadius: 12, maxWidth: 900, margin: '32px auto' }}>
        <h2 style={{ marginBottom: 24 }}>Send Push Notification</h2>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Photo upload */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <label htmlFor="photo-upload" style={{ width: 120, height: 120, background: '#ddd', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
              ) : (
                <span style={{ color: '#888' }}>Photo</span>
              )}
              <input id="photo-upload" ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </label>
          </div>
          {/* Row: Receiver, Title, Zodiac */}
          <div style={{ display: 'flex', gap: 12 }}>
            <input name="receiver" value={form.receiver} onChange={handleChange} placeholder="Receiver" style={{ flex: 1, padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
            <input name="title" value={form.title} onChange={handleChange} placeholder="Title" style={{ flex: 1, padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
            <input name="zodiac" value={form.zodiac} onChange={handleChange} placeholder="Zodiac" style={{ flex: 1, padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
          </div>
          {/* Main text */}
          <input name="mainText" value={form.mainText} onChange={handleChange} placeholder="Main text" style={{ padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
          {/* Link */}
          <input name="link" value={form.link} onChange={handleChange} placeholder="Link" style={{ padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
          {/* Send button */}
          <button type="submit" disabled={!isFormValid} style={{ background: '#ffd600', color: '#111', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 20, cursor: isFormValid ? 'pointer' : 'not-allowed', padding: '16px 0', marginTop: 12 }}>
            Send
          </button>
          {sent && <span style={{ color: 'green', fontWeight: 500, marginTop: 8 }}>Notification sent!</span>}
        </form>
      </div>
    </div>
  );
};

export default NotificationsPage;
