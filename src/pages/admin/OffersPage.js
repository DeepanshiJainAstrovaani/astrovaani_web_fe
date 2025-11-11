import React, { useState } from 'react';
import styles from './AdminTable.module.css';

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

function generateOfferCode(existingOffers) {
  const nextNum = (existingOffers.length + 1).toString().padStart(4, '0');
  return `OFF-${nextNum}`;
}

const phoneRegex = /^[6-9]\d{9}$/;

const OffersPage = () => {
  const [offers, setOffers] = useState([
    {
      offerCode: 'OFF-0001',
      user: 'Raghuvendra',
      mobile: '9667356172',
      chatCall: 'Chat',
      validFor: '45',
      expiryDate: '2025-09-27',
      amount: '35',
      timing: '09:00',
      promoText1: 'Promo1',
      promoText2: 'Promo2',
    },
    {
      offerCode: 'OFF-0002',
      user: 'Deepika Dayal',
      mobile: '9667356172',
      chatCall: 'Call',
      validFor: '125',
      expiryDate: '2025-09-27',
      amount: '105',
      timing: '18:00',
      promoText1: 'Promo1',
      promoText2: 'Promo2',
    },
  ]);
  const [form, setForm] = useState(initialForm);
  const [editIndex, setEditIndex] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  const isFormValid = Object.values(form).every(v => v.trim() !== '') && phoneRegex.test(form.mobile);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'mobile') {
      setPhoneError(phoneRegex.test(value) ? '' : 'Please enter a correct phone number');
    }
  };

  const handleAddOrUpdate = () => {
    if (!isFormValid) return;
    if (editIndex !== null) {
      // Update
      const updatedOffers = [...offers];
      updatedOffers[editIndex] = { ...form, offerCode: offers[editIndex].offerCode };
      setOffers(updatedOffers);
      setEditIndex(null);
    } else {
      // Add
      const offerCode = generateOfferCode(offers);
      setOffers([...offers, { ...form, offerCode }]);
    }
    setForm(initialForm);
    setPhoneError('');
  };

  const handleEdit = idx => {
    const { offerCode, ...rest } = offers[idx];
    setForm(rest);
    setEditIndex(idx);
    setPhoneError('');
  };

  return (
    <div className={styles['admin-container']}>
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
          {offers.map((o, idx) => (
            <tr key={idx}>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OffersPage;
