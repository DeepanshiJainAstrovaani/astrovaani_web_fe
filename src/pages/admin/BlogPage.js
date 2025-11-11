import React from 'react';
import styles from './AdminTable.module.css';

const BlogPage = () => (
  <div className={styles['admin-container']}>
    <h2>Blog</h2>
    <div className={styles['search-bar']}>Search Bar Placeholder</div>
    <div>
      <button className={styles['status-btn']}>All Posts</button>
    </div>
    <table className={styles['admin-table']}>
      <thead>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Sample Blog Post</td>
          <td>Admin</td>
          <td>20 Sep 2025</td>
          <td>Published</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default BlogPage;
