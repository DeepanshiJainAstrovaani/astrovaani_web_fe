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
  grid: { display: 'grid', gridTemplateColumns: 'minmax(260px,360px) 1fr minmax(260px,360px)', gap: 20, alignItems: 'start' },
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

  useEffect(() => {
    if (!vendorId) return;
    // fetch vendor details and confirmed slots (if backend exists)
    (async () => {
      try {
        const res = await fetch(`${API_URL}/vendors/${vendorId}`);
        if (res.ok) {
          const data = await res.json();
          setVendor(data.vendor || data);
        }
      } catch (e) {
        // ignore
      }

      try {
        const r2 = await fetch(`${API_URL}/vendors/${vendorId}/schedules`);
        if (r2.ok) {
          const d2 = await r2.json();
          // expect { proposed: [], confirmed: [] } or an array
          if (Array.isArray(d2)) {
            setConfirmed(d2.filter(s => s.status === 'confirmed' || s.status === 'accepted'));
            setSlots(d2.filter(s => !s.status || s.status === 'proposed'));
          } else {
            setConfirmed(d2.confirmed || []);
            setSlots(d2.proposed || []);
          }
        }
      } catch (e) {
        // ignore
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
      const payload = { slots, vendor: { id: vendorId, name: vendor?.name, email: vendor?.email, whatsapp: vendor?.whatsapp, phone: vendor?.phone } };
      const res = await fetch(`${API_URL}/vendors/${vendorId}/notify`, {
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
        <a href="/admin" style={styles.backLink} onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>Back to dashboard</a>
      </div>

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

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => saveSlots()} style={styles.btnPrimary}>{saving ? 'Saving...' : 'Save slots'}</button>
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
    </div>
  );
};

export default SchedulePage;
