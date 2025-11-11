import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import styles from './AdminTable.module.css';

const customers = [
  { name: 'Sudhanshu', mobile: '9667356172', bookings: 43, spending: '5,562' },
  { name: 'Meena Rao', mobile: '9667356172', bookings: 63, spending: '6,284' },
  { name: 'Meena Rao', mobile: '9667356172', bookings: 122, spending: '19,534' },
  { name: 'Meena Rao', mobile: '9667356172', bookings: 77, spending: '9,460' },
  { name: 'Meena Rao', mobile: '9667356172', bookings: 2, spending: '75' },
  { name: 'Meena Rao', mobile: '9667356172', bookings: 53, spending: '623' },
  { name: 'Meena Rao', mobile: '9667356172', bookings: 88, spending: '853' },
];

const CustomersPage = () => {
  const [search, setSearch] = useState('');

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
      <button className={styles['status-btn']}>Customers (253)</button>

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
          {customers.map((c, i) => (
            <tr key={i}>
              <td>{c.name}</td>
              <td>{c.mobile}</td>
              <td>{c.bookings}</td>
              <td>{c.spending}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersPage;
