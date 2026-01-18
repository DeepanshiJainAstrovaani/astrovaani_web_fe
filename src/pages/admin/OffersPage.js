import React, { useState, useEffect } from 'react';
import styles from './AdminTable.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const initialForm = {
  applicability: [], // new field
  vendor: '', // replaces user
  mobile: '',
  offerCode: '', // manual entry
  offerText: '',
  chat: 'No',
  call: 'No',
  amount: '',
  timing: '',
  expiryDate: '',
  validFor: '',
};

const applicabilityOptions = [
  'All vendors free for one customer',
  'One vendor free for one customer',
  'One vendor free for all customers',
];

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isFormValid =
    form.applicability.length > 0 &&
    (form.offerCode || '').trim() !== '' &&
    (form.offerText || '').trim() !== '' &&
    (form.amount || '').trim() !== '' &&
    (form.timing || '').trim() !== '' &&
    (form.expiryDate || '').trim() !== '' &&
    (form.validFor || '').trim() !== '' &&
    (form.vendor || '').trim() !== '' &&
    ((form.mobile || '').trim() === '' || /^[6-9]\d{9}$/.test(form.mobile || ''));

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
    const { name, value, options } = e.target;
    if (name === 'applicability') {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setForm({ ...form, applicability: selected });
    } else {
      setForm({ ...form, [name]: value });
      if (name === 'mobile') {
        setPhoneError(value.trim() === '' || /^[6-9]\d{9}$/.test(value) ? '' : 'Please enter a correct phone number');
      }
    }
  };

  const handleAddOrUpdate = async () => {
    if (!isFormValid) return;

    // Debug logs for duplicate check
    console.log('form.offerCode:', form.offerCode);
    offers.forEach((o, i) => {
      console.log(`Offer[${i}].offerCode:`, o.offerCode);
    });

    // Check for duplicate offerCode (only for add, not edit)
    if (!editId && form.offerCode && offers.some(o => o.offerCode && o.offerCode.trim().toLowerCase() === form.offerCode.trim().toLowerCase())) {
      setError('Offer code already exists. Please use a unique code.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (editId) {
        // Update existing offer
        const updatedOffer = { ...form, _id: editId };
        console.log('Sending update payload:', updatedOffer);
        const response = await fetch(`${API_URL}/offers/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedOffer)
        });
        const data = await response.json();
        console.log('Update response:', data);
        if (data.success) {
          setSuccess('Offer updated successfully!');
          await fetchOffers(); // Ensure table refreshes
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
    console.log('Editing offer:', offer);
    // Explicitly include offerCode and expiryDate in the form
    const { _id, createdAt, updatedAt, __v, ...rest } = offer;
    setForm({
      ...rest,
      offerCode: offer.offerCode || '',
      expiryDate: offer.expiryDate ? offer.expiryDate.split('T')[0] : '' // format for input type="date"
    });
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
      {error && error !== 'Offer code already exists. Please use a unique code.' && (
        <div style={{ background: '#f44336', color: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="mt-4" style={{ background: '#f7f7f7', padding: 24, borderRadius: 8, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 18 }}>Add new offer</h3>
        <form style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }} onSubmit={e => { e.preventDefault(); handleAddOrUpdate(); }}>
          <div className="col-12 mb-2 d-flex align-items-center flex-wrap">
            <label className="fw-bold me-3">Applicability:</label>
            {applicabilityOptions.map(opt => (
              <div key={opt} className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={form.applicability.includes(opt)}
                  onChange={e => {
                    setForm({
                      ...form,
                      applicability: e.target.checked
                        ? [...form.applicability, opt]
                        : form.applicability.filter(a => a !== opt)
                    });
                  }}
                  id={`applicability-${opt}`}
                />
                <label className="form-check-label" htmlFor={`applicability-${opt}`}>{opt}</label>
              </div>
            ))}
          </div>

          <div className="">
            <label className="form-label fw-bold">Vendor Name/Number</label>
            <input name="vendor" value={form.vendor} onChange={handleChange} placeholder="Vendor Name/Number" className="form-control" />
          </div>

          <div className="">
            <label className="form-label fw-bold">User Mobile no. (leave empty for all)</label>
            <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="User Mobile no." className="form-control" />
            {phoneError && <span className="text-danger small mt-1 d-block">{phoneError}</span>}
          </div>

          <div className="">
            <label className="form-label fw-bold">Offer Code</label>
            <input name="offerCode" value={form.offerCode} onChange={handleChange} placeholder="Offer Code (Ex: FREECHAT)" className="form-control" />
            {/* Show duplicate error below field */}
            {!editId && error === 'Offer code already exists. Please use a unique code.' && (
              <span className="text-danger small mt-1 d-block">{error}</span>
            )}
          </div>
          <div className="">
            <label className="form-label fw-bold">Offer Text</label>
            <input name="offerText" value={form.offerText} onChange={handleChange} placeholder="Offer Text" className="form-control" />
          </div>
          <div className="">
            <label className="form-label fw-bold">Chat</label>
            <select name="chat" value={form.chat} onChange={handleChange} className="form-select">
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="">
            <label className="form-label fw-bold">Call</label>
            <select name="call" value={form.call} onChange={handleChange} className="form-select">
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="">
            <label className="form-label fw-bold">Amount</label>
            <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount (Ex: 0, 10)" className="form-control" />
          </div>
          <div className="">
            <label className="form-label fw-bold">Offer Duration</label>
            <input name="timing" value={form.timing} onChange={handleChange} placeholder="Offer Duration (Ex: 5, 10, 25)" className="form-control" />
          </div>
          <div className="">
            <label className="form-label fw-bold">Expiry Date</label>
            <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} placeholder="Expiry Date" className="form-control" />
          </div>
          <div className="">
            <label className="form-label fw-bold">Timer Duration</label>
            <input name="validFor" value={form.validFor} onChange={handleChange} placeholder="Timer Duration (Ex: 5, 10, 30)" className="form-control" />
          </div>
          <div className="col-md-8 d-flex justify-content-end align-items-end" style={{ width: '100%' }}>
            <button type="submit" disabled={!isFormValid} className="btn btn-warning fw-bold px-4 py-2 mt-2">
              {editIndex !== null ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className={styles['admin-table']} style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Offer Code</th>
              <th>Offer Text</th>
              <th>Vendor</th>
              <th>Mobile</th>
              <th>Chat</th>
              <th>Call</th>
              <th>Amount</th>
              <th>Timing</th>
              <th>Valid For</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', padding: 24 }}>
                  Loading offers...
                </td>
              </tr>
            ) : offers.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', padding: 24 }}>
                  No offers found. Create your first offer above.
                </td>
              </tr>
            ) : (
              offers.map((o, idx) => (
                <tr key={o._id || idx}>
                  <td>{o.offerCode}</td>
                  <td>{o.offerText}</td>
                  <td>{o.vendor}</td>
                  <td>{o.mobile}</td>
                  <td>{o.chat}</td>
                  <td>{o.call}</td>
                  <td>{o.amount}</td>
                  <td>{o.timing}</td>
                  <td>{o.validFor}</td>
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
    </div>
  );
};

export default OffersPage;
