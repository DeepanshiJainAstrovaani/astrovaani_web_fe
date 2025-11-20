import React, { useState, useEffect } from 'react';
import styles from './AdminTable.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const initialForm = {
  user: '',
  mobile: '',
  chatCall: 'Chat',
  validFor: '',
  expiryDate: '',
  amount: '',
  timing: '',
  promoText1: '',
  promoText2: '',
};

const phoneRegex = /^[6-9]\d{9}$/;

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isFormValid = Object.values(form).every(v => typeof v === 'string' ? v.trim() !== '' : v !== '' && v !== null && v !== undefined) && phoneRegex.test(form.mobile);

  // Fetch all offers on component mount
  useEffect(() => {
    fetchOffers();
  }, []);

  // Fetch offers from backend
  const fetchOffers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/offers`);
      const data = await response.json();
      
      if (data.success) {
        setOffers(data.data);
      } else {
        setError(data.message || 'Failed to fetch offers');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'mobile') {
      setPhoneError(phoneRegex.test(value) ? '' : 'Please enter a correct phone number');
    }
  };

  const handleAddOrUpdate = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (editId) {
        // Update existing offer
        const response = await fetch(`${API_URL}/offers/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        
        const data = await response.json();
        
        if (data.success) {
          setSuccess('Offer updated successfully!');
          fetchOffers(); // Refresh the list
          setForm(initialForm);
          setEditId(null);
          setEditIndex(null);
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(data.message || 'Failed to update offer');
        }
      } else {
        // Create new offer
        const response = await fetch(`${API_URL}/offers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        
        const data = await response.json();
        
        if (data.success) {
          setSuccess('Offer created successfully!');
          fetchOffers(); // Refresh the list
          setForm(initialForm);
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(data.message || 'Failed to create offer');
        }
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error saving offer:', err);
    } finally {
      setLoading(false);
    }
    
    setPhoneError('');
  };

  const handleEdit = (idx) => {
    const offer = offers[idx];
    const { _id, offerCode, createdAt, updatedAt, __v, ...rest } = offer;
    setForm(rest);
    setEditId(_id);
    setEditIndex(idx);
    setPhoneError('');
  };

  return (
    <div className={styles['admin-container']}>
      {/* Success Message */}
      {success && (
        <div style={{ background: '#4caf50', color: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ background: '#f44336', color: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="mt-4" style={{ background: '#f7f7f7', padding: 24, borderRadius: 8, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 18 }}>Add new offer</h3>
        <form style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }} onSubmit={e => { e.preventDefault(); handleAddOrUpdate(); }}>
          {/* User Name */}
          <input name="user" value={form.user} onChange={handleChange} placeholder="User Name" style={{ flex: '1 1 160px', padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
          
          {/* Mobile Number */}
          <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column' }}>
            <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="User Mobile no." style={{ padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
            {phoneError && <span style={{ color: 'red', fontSize: 13, marginTop: 2 }}>{phoneError}</span>}
          </div>
          {/* Chat/Call Dropdown */}
          <select name="chatCall" value={form.chatCall} onChange={handleChange} style={{ flex: '1 1 160px', padding: 12, borderRadius: 6, border: '1px solid #ccc' }}>
            <option value="Chat">Chat</option>
            <option value="Call">Call</option>
          </select>
          {/* Valid For */}
          <input name="validFor" value={form.validFor} onChange={handleChange} placeholder="Valid for" style={{ flex: '1 1 160px', padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
          {/* Expiry Date */}
          <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} placeholder="Expiry Date" style={{ flex: '1 1 160px', padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
          {/* Amount */}
          <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" style={{ flex: '1 1 160px', padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
          {/* Timing */}
          <input name="timing" type="time" value={form.timing} onChange={handleChange} placeholder="Timing" style={{ flex: '1 1 160px', padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
          {/* Promo Texts in one row */}
          <div style={{ display: 'flex', flex: '2 1 320px', gap: 12 }}>
            <input name="promoText1" value={form.promoText1} onChange={handleChange} placeholder="Promo text 1" style={{ flex: 1, padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
            <input name="promoText2" value={form.promoText2} onChange={handleChange} placeholder="Promo text 2" style={{ flex: 1, padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
          </div>
          <button type="submit" disabled={!isFormValid} style={{ flex: '1 1 120px', background: '#ffd600', color: '#111', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 18, cursor: isFormValid ? 'pointer' : 'not-allowed', padding: 12 }}>
            {editIndex !== null ? 'Update' : 'Add'}
          </button>
        </form>
      </div>
      <table className={styles['admin-table']}>
        <thead>
          <tr>
            <th>Offer Code</th>
            <th>User</th>
            <th>Mobile</th>
            <th>Chat/Call</th>
            <th>Valid for</th>
            <th>Expiry Date</th>
            <th>Amount</th>
            <th>Timing</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center', padding: 24 }}>
                Loading offers...
              </td>
            </tr>
          ) : offers.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center', padding: 24 }}>
                No offers found. Create your first offer above.
              </td>
            </tr>
          ) : (
            offers.map((o, idx) => (
              <tr key={o._id || idx}>
                <td>{o.offerCode}</td>
                <td>{o.user}</td>
                <td>{o.mobile}</td>
                <td>{o.chatCall}</td>
                <td>{o.validFor}</td>
                <td>{o.expiryDate}</td>
                <td>{o.amount}</td>
                <td>{o.timing}</td>
                <td>
                  <button type="button" className={styles['action-btn']} onClick={() => handleEdit(idx)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OffersPage;
