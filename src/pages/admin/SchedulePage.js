import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const cardBase = {
  background: '#fff',
  borderRadius: 12,
  padding: 18,
  boxShadow: '0 6px 18px rgba(0,0,0,0.04)'
};

const styles = {
  page: { padding: 20, background: '#f3f4f6', minHeight: '100vh' },
  backLink: { color: '#0ea5e9', fontSize: 14, display: 'inline-block', marginBottom: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(240px,320px) minmax(400px,1fr) minmax(240px,300px)', gap: 20, alignItems: 'start' },
  cardTitle: { marginTop: 0, marginBottom: 6, fontSize: 20, fontWeight: 700, color: '#0f172a' },
  vendorSubtitle: { color: '#6b7280', marginBottom: 10, fontSize: 13, lineHeight: 1.3, overflowWrap: 'break-word' },
  label: { marginBottom: 8, color: '#111827', fontSize: 14 },
  input: { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 },
  btnPrimary: { background: '#059669', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 14 },
  btnAccent: { background: '#ffd400', color: '#111827', border: 'none', padding: '8px 18px', borderRadius: 24, cursor: 'pointer', fontSize: 14 },
  notifyBtn: { background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 24, cursor: 'pointer', fontSize: 14 },
  slotCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbea', border: '1px solid #fde68a', padding: 12, borderRadius: 10, marginBottom: 12 },
  slotDate: { fontWeight: 700, fontSize: 15 },
  slotTime: { marginTop: 6, fontSize: 13, color: '#374151' }
};

const SchedulePage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [dateTime, setDateTime] = useState(null);
  const [duration, setDuration] = useState(30);
  const [slots, setSlots] = useState([]); // proposed slots (local)
  const [confirmed, setConfirmed] = useState([]); // confirmed slots from backend
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) return;
    
    console.log('🔍 Loading vendor data for ID:', vendorId);
    console.log('🌐 API URL:', API_URL);
    
    // fetch vendor details and confirmed slots (if backend exists)
    (async () => {
      try {
        console.log('📡 Fetching vendor from:', `${API_URL}/vendors/${vendorId}`);
        const res = await fetch(`${API_URL}/vendors/${vendorId}`);
        console.log('📥 Vendor response status:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('✅ Vendor data received:', data);
          setVendor(data.vendor || data);
        } else {
          const errorText = await res.text();
          console.error('❌ Failed to fetch vendor:', res.status, errorText);
          setErrorMessage(`Failed to load vendor: ${res.status} ${res.statusText}`);
        }
      } catch (e) {
        console.error('❌ Error fetching vendor:', e);
        setErrorMessage(`Error connecting to server: ${e.message}`);
      }

      try {
        console.log('📡 Fetching schedules from:', `${API_URL}/vendors/${vendorId}/schedules`);
        const r2 = await fetch(`${API_URL}/vendors/${vendorId}/schedules`);
        console.log('📥 Schedules response status:', r2.status);
        
        if (r2.ok) {
          const d2 = await r2.json();
          console.log('✅ Schedules data received:', d2);
          console.log('📊 Schedules structure:', JSON.stringify(d2, null, 2));
          
          // expect { proposed: [], confirmed: [] } or an array
          if (Array.isArray(d2)) {
            const confirmedSlots = d2.filter(s => s.status === 'confirmed' || s.status === 'accepted');
            const proposedSlots = d2.filter(s => !s.status || s.status === 'proposed');
            console.log('✅ Confirmed slots found:', confirmedSlots.length, confirmedSlots);
            console.log('✅ Proposed slots found:', proposedSlots.length, proposedSlots);
            setConfirmed(confirmedSlots);
            setSlots(proposedSlots);
          } else {
            const confirmedSlots = d2.confirmed || [];
            const proposedSlots = d2.proposed || [];
            console.log('✅ Confirmed slots from object:', confirmedSlots.length, confirmedSlots);
            console.log('✅ Proposed slots from object:', proposedSlots.length, proposedSlots);
            setConfirmed(confirmedSlots);
            setSlots(proposedSlots);
          }
        } else {
          console.error('❌ Failed to fetch schedules:', r2.status);
        }
      } catch (e) {
        console.error('❌ Error fetching schedules:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [vendorId]);

  const addSlot = () => {
    setErrorMessage('');
    if (!dateTime) {
      setErrorMessage('Please pick a date and time');
      return;
    }
    const newSlot = { scheduledAt: dateTime.toISOString(), duration: Number(duration) };
    const isDuplicate = slots.some(s => s.scheduledAt === newSlot.scheduledAt && Number(s.duration) === newSlot.duration);
    if (isDuplicate) {
      setErrorMessage('This exact slot is already added.');
      return;
    }
    const newStart = new Date(newSlot.scheduledAt);
    const newEnd = new Date(newStart.getTime() + newSlot.duration * 60000);
    const overlapping = slots.find(s => {
      const sStart = new Date(s.scheduledAt);
      const sEnd = new Date(sStart.getTime() + Number(s.duration) * 60000);
      return newStart < sEnd && sStart < newEnd;
    });
    if (overlapping) {
      setErrorMessage('This slot overlaps with an existing slot at ' + new Date(overlapping.scheduledAt).toLocaleString());
      return;
    }
    setSlots(s => [...s, newSlot]);
    setDateTime(null);
  };

  const removeSlot = async (idx) => {
    const slotToRemove = slots[idx];
    
    // If slot has an _id, it's already saved in backend, so delete it from backend
    if (slotToRemove && slotToRemove._id) {
      try {
        const res = await fetch(`${API_URL}/vendors/${vendorId}/schedules/${slotToRemove._id}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error('Failed to delete slot from backend:', text);
          // Still remove from frontend UI
        }
      } catch (e) {
        console.error('Error deleting slot:', e);
        // Still remove from frontend UI
      }
    }
    
    // Remove from frontend state
    setSlots(s => s.filter((_, i) => i !== idx));
    if (errorMessage) setErrorMessage('');
  };

  const clearAllSlots = async () => {
    if (!vendorId) return;
    
    // Confirm action
    if (!window.confirm(`Are you sure you want to clear all ${slots.length} slot(s)?`)) {
      return;
    }
    
    setSaving(true);
    setErrorMessage('');
    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}/schedules`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        let errMsg = 'Failed to clear slots';
        try {
          const parsed = JSON.parse(text || '{}');
          errMsg = parsed.message || parsed.error || text || errMsg;
        } catch (e) {
          errMsg = text || errMsg;
        }
        throw new Error(errMsg);
      }
      
      const data = await res.json();
      setSlots([]);
      alert(data.message || 'All slots cleared successfully');
    } catch (e) {
      console.error('Clear all slots error:', e);
      setErrorMessage(e.message || 'Failed to clear slots');
    } finally {
      setSaving(false);
    }
  };

  const saveSlots = async () => {
    if (!vendorId) return setErrorMessage('Missing vendor');
    if (slots.length === 0) return setErrorMessage('Add at least one slot');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/vendors/${vendorId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots })
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        let errMsg = 'Failed to save slots';
        try {
          const parsed = JSON.parse(text || '{}');
          errMsg = parsed.message || parsed.error || text || errMsg;
        } catch (e) {
          errMsg = text || errMsg;
        }
        console.error('Save slots failed response:', res.status, errMsg);
        throw new Error(errMsg);
      }
      const data = await res.json();
      // refresh confirmed/proposed
      if (data.proposed || data.confirmed) {
        setSlots(data.proposed || []);
        setConfirmed(data.confirmed || []);
      }
      setErrorMessage('');
      alert('Slots saved');
    } catch (e) {
      console.error(e);
      setErrorMessage(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const notifyVendor = async () => {
    if (!vendorId) return setErrorMessage('Missing vendor');
    if (!slots || slots.length === 0) return setErrorMessage('Add at least one slot before notifying');
    setSaving(true);
    setErrorMessage('');
    try {
      // First, save the slots to the database
      console.log('📝 Saving slots before notifying...');
      const saveRes = await fetch(`${API_URL}/vendors/${vendorId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots })
      });
      
      if (!saveRes.ok) {
        const text = await saveRes.text().catch(() => '');
        let errMsg = 'Failed to save slots';
        try {
          const parsed = JSON.parse(text || '{}');
          errMsg = parsed.message || parsed.error || text || errMsg;
        } catch (e) {
          errMsg = text || errMsg;
        }
        throw new Error(errMsg);
      }
      
      const saveData = await saveRes.json();
      console.log('✅ Slots saved successfully');
      
      // Update local state with saved slots
      if (saveData.proposed || saveData.confirmed) {
        setSlots(saveData.proposed || []);
        setConfirmed(saveData.confirmed || []);
      }
      
      // Now send the WhatsApp notification
      console.log('📱 Sending WhatsApp notification...');
      const payload = { slots, vendor: { id: vendorId, name: vendor?.name, email: vendor?.email, whatsapp: vendor?.whatsapp, phone: vendor?.phone } };
      const res = await fetch(`${API_URL}/vendors/${vendorId}/notify-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        let errMsg = 'Notify failed';
        try { errMsg = JSON.parse(text).message || text || errMsg; } catch(e){ errMsg = text || errMsg; }
        throw new Error(errMsg);
      }
      const data = await res.json().catch(() => ({}));
      // show success inline
      setErrorMessage('');
      alert(data.message || 'Vendor notified');
    } catch (e) {
      console.error('Notify error', e);
      setErrorMessage(e.message || 'Notify failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 12 }}>
        <a href="/admindashboard" style={styles.backLink} onClick={(e) => { e.preventDefault(); navigate('/admindashboard'); }}>Back to dashboard</a>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          <div style={{ fontSize: 18, marginBottom: 10 }}>Loading vendor data...</div>
          <div style={{ fontSize: 14 }}>Please wait</div>
        </div>
      ) : (
        <div style={styles.grid}>
          <div style={{ ...cardBase }}>
          <h3 style={styles.cardTitle}>Scheduling Interview</h3>
          <div style={styles.vendorSubtitle}>{vendor ? `With ${vendor.name || vendor.fullName || vendor.vendorName}` : 'Select a vendor'}</div>

          <div style={{ marginBottom: 12 }}>
            <div style={styles.label}>Date & time</div>
            <Flatpickr
              value={dateTime}
              onChange={(d) => setDateTime(d[0] || null)}
              options={{ enableTime: true, time_24hr: false, minuteIncrement: 15, dateFormat: 'd-m-Y h:i K', minDate: 'today' }}
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={styles.label}>Duration (minutes)</div>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} min={5} style={{ width: 120, ...styles.input }} />
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={addSlot} style={styles.btnAccent}>Add</button>
            <button onClick={notifyVendor} style={{ ...styles.notifyBtn, opacity: (saving || !slots.length) ? 0.65 : 1 }} disabled={saving || slots.length === 0}>{saving ? 'Sending...' : '🔔 Notify Vendor'}</button>
          </div>

          {errorMessage && <div style={{ marginTop: 12, color: '#b91c1c', fontSize: 13 }}>{errorMessage}</div>}
        </div>

        <div style={{ ...cardBase }}>
          <h3 style={styles.cardTitle}>Scheduled Dates</h3>
          <div style={styles.vendorSubtitle}>For {vendor ? (vendor.name || vendor.fullName || vendor.vendorName) : 'vendor' } Interview</div>

          <div>
            {(slots.length === 0) && <div style={{ color: '#6b7280' }}>No proposed slots</div>}
            {slots.map((s, i) => (
              <div key={i} style={styles.slotCard}>
                <div>
                  <div style={styles.slotDate}>{new Date(s.scheduledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                  <div style={styles.slotTime}>{new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div>
                  <button onClick={() => removeSlot(i)} style={{ background: '#ffccd5', borderRadius: 20, border: 'none', width: 36, height: 36, cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              {slots.length > 0 && (
                <button 
                  onClick={clearAllSlots} 
                  style={{ 
                    background: '#ef4444', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '10px 16px', 
                    borderRadius: 10, 
                    cursor: 'pointer', 
                    fontSize: 14,
                    opacity: saving ? 0.65 : 1 
                  }}
                  disabled={saving}
                >
                  Clear All
                </button>
              )}
              <button onClick={() => saveSlots()} style={{ ...styles.btnPrimary, marginLeft: 'auto' }}>{saving ? 'Saving...' : 'Save slots'}</button>
            </div>
          </div>
        </div>

        <div style={{ ...cardBase }}>
          <h3 style={styles.cardTitle}>Already Scheduled Dates</h3>
          <div style={{ color: '#6b7280', marginTop: 6 }}>
            {confirmed.length === 0 && <div style={{ color: '#6b7280' }}>No confirmed dates</div>}
            {confirmed.map((c, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{new Date(c.scheduledAt).toLocaleDateString()}</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>{new Date(c.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;