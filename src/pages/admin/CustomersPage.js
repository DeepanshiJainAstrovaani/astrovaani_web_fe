import React, { useState, useEffect } from 'react';
import { fetchBookings } from '../../api/bookingApi';
import { FaSearch } from 'react-icons/fa';
import styles from './AdminTable.module.css';




const CustomersPage = () => {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchBookings();
        const bookings = data.bookings || [];
        
        // Group by user_id
        const customerMap = {};
        bookings.forEach(b => {
          // user_id is populated with user data
          const user = b.user_id;
          if (!user || !user._id) return;
          
          const id = user._id;
          if (!customerMap[id]) {
            customerMap[id] = {
              name: user.name || 'Unknown',
              mobile: user.mobile || '',
              bookings: 0,
              spending: 0,
            };
          }
          customerMap[id].bookings += 1;
          customerMap[id].spending += Number(b.total_amount || 0);
        });
        setCustomers(Object.values(customerMap));
      } catch (e) {
        console.error('Error loading customers:', e);
        setCustomers([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = customers.filter(c =>
    c.mobile && c.mobile.toString().includes(search.trim())
  );

  return (
    <div className={styles['admin-container']}>
      {/* Search Bar */}
      <div className={styles['search-bar']}>
        <FaSearch color="#222" size={20} />
        <input
          type="text"
          placeholder="Search any customer by mobile number"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Status Button */}
      <button className={styles['status-btn']}>
        Customers ({customers.length})
      </button>

      {/* Customers Table */}
      <table className={styles['admin-table']}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile No.</th>
            <th>Bookings</th>
            <th>Spending</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4}>Loading...</td></tr>
          ) : filtered.length === 0 ? (
            <tr><td colSpan={4}>No customers found</td></tr>
          ) : (
            filtered.map((c, i) => (
              <tr key={i}>
                <td>{c.name}</td>
                <td>{c.mobile}</td>
                <td>{c.bookings}</td>
                <td>{c.spending.toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersPage;
