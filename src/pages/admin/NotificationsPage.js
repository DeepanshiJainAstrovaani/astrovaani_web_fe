import React, { useState, useEffect, useRef } from 'react';
import styles from './AdminTable.module.css';

const initialForm = {
  targetType: 'all', // 'all', 'specific', 'segment'
  targetUsers: [],
  title: '',
  body: '',
  imageUrl: '',
  imageFile: null,
  data: {
    link: '',
    screen: '',
    category: '',
    zodiac: ''
  },
  priority: 'high',
  sound: 'default',
  badge: 1
};

const NotificationsPage = () => {
  const [form, setForm] = useState(initialForm);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const isFormValid = form.title && form.body;

  // Fetch registered users/devices count on load
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to backend/Firebase
    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/notifications/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setForm({ ...form, imageUrl: data.imageUrl, imageFile: file });
      } else {
        setError(data.message || 'Failed to upload image');
        setImagePreview(null);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setForm({ ...form, imageUrl: '', imageFile: null });
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
      
      // Prepare the notification data
      const notificationData = {
        title: form.title,
        body: form.body,
        targetType: form.targetType,
        priority: form.priority,
        sound: form.sound,
        badge: parseInt(form.badge) || 1,
        imageUrl: form.imageUrl || '',
        data: {
          link: form.data.link || '',
          screen: form.data.screen || '',
          category: form.data.category || '',
          zodiac: form.data.zodiac || ''
        },
        platform: 'firebase' // Use Firebase FCM
      };

      // If targeting specific users, add targetUsers
      if (form.targetType === 'specific' && form.targetUsers.length > 0) {
        notificationData.targetUsers = form.targetUsers;
      }

      console.log('📤 Sending notification:', notificationData);

      // Send to backend
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
        setStats(data.data.stats); // Update stats with response
        setTimeout(() => {
          setSent(false);
          setForm(initialForm);
          setImagePreview(null);
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
      <div style={{ background: '#f7f7f7', padding: 32, borderRadius: 12, maxWidth: 900, margin: '32px auto' }}>
        <h2 style={{ marginBottom: 8 }}>📱 Send Push Notification</h2>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
          Send notifications to all app users or specific segments
        </p>

        {/* Stats Card */}
        {stats && (
          <div style={{ background: '#e7f3ff', padding: 16, borderRadius: 8, marginBottom: 24, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#2196F3' }}>{stats.totalDevices || 0}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Registered Devices</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4CAF50' }}>{stats.totalSent || 0}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Total Sent</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#FF9800' }}>{stats.activeUsers || 0}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Active Users</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Image Upload */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Notification Image (Optional):</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {imagePreview ? (
                <div style={{ position: 'relative', width: 120, height: 120 }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '2px solid #ddd' }} 
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    style={{ 
                      position: 'absolute', 
                      top: -8, 
                      right: -8, 
                      background: '#ff4444', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '50%', 
                      width: 24, 
                      height: 24, 
                      cursor: 'pointer',
                      fontSize: 16,
                      lineHeight: '24px',
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label 
                  htmlFor="image-upload"
                  style={{ 
                    width: 120, 
                    height: 120, 
                    background: '#f0f0f0', 
                    border: '2px dashed #ccc', 
                    borderRadius: 8, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e7f3ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f0f0f0'}
                >
                  <span style={{ fontSize: 32, color: '#999' }}>📷</span>
                  <span style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </span>
                </label>
              )}
              <input 
                id="image-upload"
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageChange}
                disabled={uploadingImage}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                  Add an image to your notification (Max 5MB)
                </p>
                <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0 0' }}>
                  Supports: JPG, PNG, GIF, WEBP
                </p>
              </div>
            </div>
          </div>

          {/* Target Type Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Send To:</label>
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

          {/* Notification Title */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Title:</label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              placeholder="Welcome to Astrovaani! 🌟" 
              style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }} 
              required
            />
          </div>

          {/* Notification Body */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Message:</label>
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
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Category (Optional):</label>
              <input 
                type="text"
                value={form.data.category || ''} 
                onChange={(e) => setForm({...form, data: {...form.data, category: e.target.value}})}
                placeholder="Horoscope, Astrology, etc." 
                style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Zodiac (Optional):</label>
              <select 
                value={form.data.zodiac || ''} 
                onChange={(e) => setForm({...form, data: {...form.data, zodiac: e.target.value}})}
                style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
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
          </div>

          {/* Priority and Sound */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Priority:</label>
              <select 
                name="priority" 
                value={form.priority} 
                onChange={handleChange}
                style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
              >
                <option value="default">Default</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Sound:</label>
              <select 
                name="sound" 
                value={form.sound} 
                onChange={handleChange}
                style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
              >
                <option value="default">Default</option>
                <option value="custom">Custom</option>
                <option value="none">Silent</option>
              </select>
            </div>
          </div>

          {/* Screen and Link */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Screen to Open (Optional):</label>
              <input 
                type="text"
                value={form.data.screen || ''} 
                onChange={(e) => setForm({...form, data: {...form.data, screen: e.target.value}})}
                placeholder="horoscope, booking, profile" 
                style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Web Link (Optional):</label>
              <input 
                type="text"
                value={form.data.link || ''} 
                onChange={(e) => setForm({...form, data: {...form.data, link: e.target.value}})}
                placeholder="https://astrovaani.com/horoscope" 
                style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }} 
              />
            </div>
          </div>

          {/* Send button */}
          <button 
            type="submit" 
            disabled={!isFormValid || sending} 
            style={{ 
              background: sending ? '#ccc' : (isFormValid ? '#ffd600' : '#e0e0e0'), 
              color: '#111', 
              border: 'none', 
              borderRadius: 8, 
              fontWeight: 600, 
              fontSize: 18, 
              cursor: isFormValid && !sending ? 'pointer' : 'not-allowed', 
              padding: '16px 0', 
              marginTop: 12,
              transition: 'all 0.3s'
            }}
          >
            {sending ? '📤 Sending...' : '🚀 Send Notification'}
          </button>

          {/* Success/Error Messages */}
          {sent && (
            <div style={{ background: '#d4edda', color: '#155724', padding: 16, borderRadius: 8, border: '1px solid #c3e6cb' }}>
              <strong>✅ Notification sent successfully!</strong>
              {stats && (
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  Sent to {stats.successCount} devices ({stats.failureCount} failed)
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div style={{ background: '#f8d7da', color: '#721c24', padding: 16, borderRadius: 8, border: '1px solid #f5c6cb' }}>
              <strong>❌ Error:</strong> {error}
            </div>
          )}
        </form>

        {/* Instructions */}
        <div style={{ marginTop: 32, padding: 20, background: '#fff3cd', borderRadius: 8, border: '1px solid #ffc107' }}>
          <h4 style={{ marginTop: 0, marginBottom: 12, color: '#856404' }}>📝 How it works:</h4>
          <ol style={{ marginLeft: 20, color: '#856404', fontSize: 14, lineHeight: 1.8 }}>
            <li>Users install your mobile app and grant notification permissions</li>
            <li>App automatically registers device tokens with the backend</li>
            <li>Tokens are stored in the <code>devicetokens</code> database collection</li>
            <li>Use this panel to send notifications to all registered users</li>
            <li>Notifications are delivered via Expo Push Service</li>
          </ol>
          <p style={{ color: '#856404', fontSize: 13, marginTop: 12, marginBottom: 0 }}>
            <strong>Note:</strong> Make sure your backend server is running at <code>http://localhost:5000</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
