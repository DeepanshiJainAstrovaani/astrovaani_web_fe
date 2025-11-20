import React, { useState, useEffect, useRef } from 'react';
import styles from './AdminTable.module.css';

const initialForm = {
  targetType: 'all',
  targetUsers: [],
  title: '',
  body: '',
  category: '',
  zodiac: '',
  screen: '',
  link: '',
  priority: 'high',
  sound: 'default',
  imageUrl: '',
  imageFile: null,
  imagePreview: null
};

const NotificationsPage = () => {
  const [form, setForm] = useState(initialForm);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const isFormValid = form.title && form.body;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/notifications/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    
    setForm({
      ...form,
      imageFile: file,
      imagePreview: preview
    });

    // Upload immediately
    await uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5000/api/notifications/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setForm(prev => ({
          ...prev,
          imageUrl: data.imageUrl
        }));
        console.log('✅ Image uploaded:', data.imageUrl);
      } else {
        setError(data.message || 'Failed to upload image');
        setForm(prev => ({
          ...prev,
          imageFile: null,
          imagePreview: null
        }));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Make sure backend is running.');
      setForm(prev => ({
        ...prev,
        imageFile: null,
        imagePreview: null
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (form.imagePreview) {
      URL.revokeObjectURL(form.imagePreview);
    }
    setForm({
      ...form,
      imageFile: null,
      imagePreview: null,
      imageUrl: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setSending(true);
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      
      const notificationData = {
        title: form.title,
        body: form.body,
        targetType: form.targetType,
        priority: form.priority,
        sound: form.sound,
        data: {
          screen: form.screen || '',
          category: form.category || '',
          zodiac: form.zodiac || '',
          link: form.link || ''
        }
      };

      // Add image if uploaded
      if (form.imageUrl) {
        notificationData.imageUrl = form.imageUrl;
      }

      // If targeting specific users
      if (form.targetType === 'specific' && form.targetUsers.length > 0) {
        notificationData.targetUsers = form.targetUsers;
      }

      const response = await fetch('http://localhost:5000/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notificationData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSent(true);
        fetchStats(); // Refresh stats
        setTimeout(() => {
          setSent(false);
          setForm(initialForm);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 3000);
      } else {
        setError(data.message || 'Failed to send notification');
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      setError('Network error. Make sure backend is running.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles['admin-container']}>
      <div style={{ background: '#f7f7f7', padding: 32, borderRadius: 12, maxWidth: 1000, margin: '32px auto' }}>
        <h2 style={{ marginBottom: 8 }}>📱 Send Push Notification</h2>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
          Send rich notifications with images, custom data, and targeting options
        </p>

        {/* Stats Card */}
        {stats && (
          <div style={{ background: '#e7f3ff', padding: 16, borderRadius: 8, marginBottom: 24, display: 'flex', justifyContent: 'space-around', textAlign: 'center', flexWrap: 'wrap' }}>
            <div style={{ margin: '8px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#2196F3' }}>{stats.totalDevices || 0}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Registered Devices</div>
            </div>
            <div style={{ margin: '8px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4CAF50' }}>{stats.totalSent || 0}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Total Sent</div>
            </div>
            <div style={{ margin: '8px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#FF9800' }}>{stats.activeUsers || 0}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Active Users</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Target Type */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>📍 Send To:</label>
            <select 
              name="targetType" 
              value={form.targetType} 
              onChange={handleChange}
              style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
            >
              <option value="all">All Users</option>
              <option value="segment">Specific Segment</option>
              <option value="specific">Specific Users</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>🖼️ Image (Optional):</label>
            <div style={{ border: '2px dashed #ccc', borderRadius: 8, padding: 20, textAlign: 'center', background: '#fafafa' }}>
              {form.imagePreview ? (
                <div>
                  <img 
                    src={form.imagePreview} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: 12 }}
                  />
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
                    {uploading ? (
                      <span style={{ color: '#2196F3', fontSize: 14 }}>⏳ Uploading...</span>
                    ) : (
                      <span style={{ color: '#4CAF50', fontSize: 14 }}>✅ Image uploaded</span>
                    )}
                    <button 
                      type="button"
                      onClick={handleRemoveImage}
                      style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#f44336', color: 'white', cursor: 'pointer', fontSize: 13 }}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                    id="imageUpload"
                  />
                  <label 
                    htmlFor="imageUpload"
                    style={{ 
                      display: 'inline-block',
                      padding: '12px 24px', 
                      background: '#2196F3', 
                      color: 'white', 
                      borderRadius: 6, 
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600
                    }}
                  >
                    Choose Image
                  </label>
                  <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#999' }}>
                    JPEG, PNG, GIF, or WebP (max 5MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>📌 Title:</label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              placeholder="Welcome to Astrovaani! 🌟" 
              style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }} 
              required
            />
          </div>

          {/* Body */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>📝 Message:</label>
            <textarea
              name="body" 
              value={form.body} 
              onChange={handleChange} 
              placeholder="Your daily horoscope is ready! Tap to view..." 
              rows="4"
              style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14, resize: 'vertical' }} 
              required
            />
          </div>

          {/* Additional Fields Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {/* Category */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333', fontSize: 13 }}>📂 Category:</label>
              <input 
                name="category" 
                value={form.category} 
                onChange={handleChange} 
                placeholder="e.g., daily, weekly" 
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }} 
              />
            </div>

            {/* Zodiac */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333', fontSize: 13 }}>♈ Zodiac:</label>
              <select 
                name="zodiac" 
                value={form.zodiac} 
                onChange={handleChange}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
              >
                <option value="">All Signs</option>
                <option value="aries">Aries ♈</option>
                <option value="taurus">Taurus ♉</option>
                <option value="gemini">Gemini ♊</option>
                <option value="cancer">Cancer ♋</option>
                <option value="leo">Leo ♌</option>
                <option value="virgo">Virgo ♍</option>
                <option value="libra">Libra ♎</option>
                <option value="scorpio">Scorpio ♏</option>
                <option value="sagittarius">Sagittarius ♐</option>
                <option value="capricorn">Capricorn ♑</option>
                <option value="aquarius">Aquarius ♒</option>
                <option value="pisces">Pisces ♓</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333', fontSize: 13 }}>⚡ Priority:</label>
              <select 
                name="priority" 
                value={form.priority} 
                onChange={handleChange}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
              >
                <option value="default">Default</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Sound */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333', fontSize: 13 }}>🔔 Sound:</label>
              <select 
                name="sound" 
                value={form.sound} 
                onChange={handleChange}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
              >
                <option value="default">Default</option>
                <option value="none">None</option>
                <option value="chime">Chime</option>
                <option value="bell">Bell</option>
              </select>
            </div>
          </div>

          {/* Screen & Link */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Screen */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>📱 Screen (Optional):</label>
              <input 
                name="screen"
                value={form.screen} 
                onChange={handleChange}
                placeholder="horoscope, profile, etc." 
                style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }} 
              />
            </div>

            {/* Link */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>🔗 Link (Optional):</label>
              <input 
                name="link"
                type="text"
                value={form.link} 
                onChange={handleChange}
                placeholder="https://astrovaani.com/..." 
                style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }} 
              />
            </div>
          </div>

          {/* Send Button */}
          <button 
            type="submit" 
            disabled={!isFormValid || sending || uploading} 
            style={{ 
              background: (sending || uploading) ? '#ccc' : (isFormValid ? '#ffd600' : '#e0e0e0'), 
              color: '#111', 
              border: 'none', 
              borderRadius: 8, 
              fontWeight: 600, 
              fontSize: 18, 
              cursor: (isFormValid && !sending && !uploading) ? 'pointer' : 'not-allowed', 
              padding: '16px 0', 
              marginTop: 12,
              transition: 'all 0.3s',
              boxShadow: isFormValid ? '0 4px 12px rgba(255, 214, 0, 0.3)' : 'none'
            }}
          >
            {uploading ? '📤 Uploading Image...' : sending ? '🚀 Sending...' : '🚀 Send Notification'}
          </button>

          {/* Success Message */}
          {sent && (
            <div style={{ background: '#d4edda', color: '#155724', padding: 16, borderRadius: 8, border: '1px solid #c3e6cb' }}>
              <strong>✅ Notification sent successfully!</strong>
              <div style={{ marginTop: 8, fontSize: 14 }}>
                Your notification has been delivered to all registered devices.
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div style={{ background: '#f8d7da', color: '#721c24', padding: 16, borderRadius: 8, border: '1px solid #f5c6cb' }}>
              <strong>❌ Error:</strong> {error}
            </div>
          )}
        </form>

        {/* Instructions */}
        <div style={{ marginTop: 32, padding: 20, background: '#fff3cd', borderRadius: 8, border: '1px solid #ffc107' }}>
          <h4 style={{ marginTop: 0, marginBottom: 12, color: '#856404' }}>📝 How to use:</h4>
          <ul style={{ marginLeft: 20, color: '#856404', fontSize: 14, lineHeight: 1.8, paddingLeft: 0 }}>
            <li>✨ <strong>Upload an image</strong> - Click "Choose Image" to add a visual to your notification</li>
            <li>📌 <strong>Enter title and message</strong> - Required fields for the notification content</li>
            <li>🎯 <strong>Add optional data</strong> - Category, zodiac sign, screen navigation, or web link</li>
            <li>⚡ <strong>Set priority</strong> - High priority for important notifications</li>
            <li>🚀 <strong>Send</strong> - Notification will be delivered via Expo, FCM, and APNs</li>
          </ul>
          <p style={{ color: '#856404', fontSize: 13, marginTop: 16, marginBottom: 0 }}>
            <strong>💡 Tips:</strong> Images make notifications 3x more engaging! Use high-quality images under 1MB for best results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
