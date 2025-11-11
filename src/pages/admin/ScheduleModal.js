import React, { useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ScheduleModal = ({ vendor, onClose, onCreated }) => {
  const [slots, setSlots] = useState([]);
  const [dateTime, setDateTime] = useState(null); // Date object
  const [duration, setDuration] = useState(30);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addSlot = () => {
    setErrorMessage('');
    if (!dateTime) {
      setErrorMessage('Please choose date and time');
      return;
    }
    const newSlot = { scheduledAt: dateTime.toISOString(), duration: Number(duration) };

    // Check exact duplicate
    const isDuplicate = slots.some(s => s.scheduledAt === newSlot.scheduledAt && Number(s.duration) === newSlot.duration);
    if (isDuplicate) {
      setErrorMessage('This exact slot is already added.');
      return;
    }

    // Check overlap: newStart < existingEnd && existingStart < newEnd
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

  const removeSlot = (idx) => {
    setSlots(s => s.filter((_, i) => i !== idx));
    if (errorMessage) setErrorMessage('');
  };

  const saveSlots = async () => {
    if (!vendor) return;
    if (slots.length === 0) return alert('Add at least one slot');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/vendors/${vendor._id || vendor.id}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save slots');
      }
      const data = await res.json();
      console.log('Slots saved', data);
      if (onCreated) onCreated(data);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving slots: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

  const styles = {
    modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
    modal: { width: 720, maxWidth: '95%', background: '#fff', borderRadius: 10, padding: 22, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' },
    formRow: { display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 12 },
    labelCol: { display: 'flex', flexDirection: 'column', fontSize: 14, minWidth: 300 },
    smallLabel: { marginTop: 6, fontSize: 12, color: '#6b7280' },
    durationInput: { marginTop: 6, padding: 8, width: 120, borderRadius: 6, border: '1px solid #d1d5db' },
    addButton: { background: '#2563eb', color: '#fff', padding: '8px 14px', border: 'none', borderRadius: 8, cursor: 'pointer' },
    cancelButton: { padding: '8px 14px', borderRadius: 8, background: '#fff', border: '1px solid #d1d5db', cursor: 'pointer' },
    saveButton: { padding: '8px 14px', borderRadius: 8, background: '#059669', color: '#fff', border: 'none', cursor: 'pointer' },
    slotRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' },
    removeBtn: { background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }
  };

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Schedule interview for {vendor?.name || 'vendor'}</h3>
          <button onClick={onClose} aria-label="close" style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#374151' }}>✕</button>
        </div>

        <div style={styles.formRow}>
          <label style={styles.labelCol}>
            <div style={{ fontSize: 14, color: '#111827' }}>Date & time</div>
            <div style={{ marginTop: 8 }}>
              <Flatpickr
                value={dateTime}
                onChange={dates => setDateTime(dates[0] || null)}
                options={{
                  enableTime: true,
                  time_24hr: false,
                  minuteIncrement: 15,
                  dateFormat: 'd/m/Y h:i K',
                  minDate: 'today'
                }}
                className="form-control"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <div style={styles.smallLabel}>Timezone: {timezone}</div>
            </div>
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label style={{ fontSize: 14, color: '#111827' }}>Duration (minutes)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} min={5} style={styles.durationInput} />
            <div style={{ marginTop: 12 }}>
              <button onClick={addSlot} style={styles.addButton} disabled={!dateTime}>
                Add slot
              </button>
              {errorMessage && <div style={{ marginTop: 8, color: '#b91c1c', fontSize: 13 }}>{errorMessage}</div>}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong style={{ display: 'block', marginBottom: 8, fontSize: 16, color: '#0f172a' }}>Proposed slots</strong>
          <div style={{ marginTop: 4 }}>
            {slots.length === 0 && <div style={{ color: '#6b7280', fontSize: 15 }}>No slots added yet.</div>}
            {slots.map((s, idx) => (
              <div key={idx} style={styles.slotRow}>
                <div style={{ color: '#111827' }}>{new Date(s.scheduledAt).toLocaleString()} — <span style={{ color: '#6b7280' }}>{s.duration} min</span></div>
                <div>
                  <button onClick={() => removeSlot(idx)} style={styles.removeBtn}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} style={styles.cancelButton}>Cancel</button>
          <button onClick={saveSlots} disabled={saving} style={{ ...styles.saveButton, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save slots'}</button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
