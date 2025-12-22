import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlogList.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/blogs`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    // If timestamp is a unix timestamp (number), convert it
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getBannerUrl = (blog) => {
    // Handle Cloudinary or full URLs
    if (blog.banner && (blog.banner.startsWith('http://') || blog.banner.startsWith('https://'))) {
      return blog.banner;
    }
    if (blog.url && (blog.url.startsWith('http://') || blog.url.startsWith('https://'))) {
      return blog.url;
    }
    // Handle local paths
    if (blog.banner) {
      return `${API_BASE.replace('/api', '')}/blogs/${blog.blogid || blog.id}/${blog.banner}`;
    }
    return require('../assets/blogs.png');
  };

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  return (
    <div className="blog-list-container">
      {/* Header */}
      <header className="blog-list-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="header-brand">
          <img src={require('../assets/logo.png')} alt="Astrovaani" className="header-logo" />
          <span className="brand-text">Astrovaani</span>
        </div>
      </header>

      {/* Content */}
      <div className="blog-list-content">
        <h1 className="page-title">Latest from our Blog</h1>
        <p className="page-subtitle">Read interesting stories and articles about astrology</p>

        {loading ? (
          <div className="loading">Loading blogs...</div>
        ) : blogs.length > 0 ? (
          <div className="blog-grid">
            {blogs.map((blog) => (
              <div 
                className="blog-card" 
                key={blog._id || blog.id}
                onClick={() => handleBlogClick(blog._id || blog.id)}
              >
                <div className="blog-image">
                  <img 
                    src={getBannerUrl(blog)} 
                    alt={blog.title || blog.name}
                    onError={(e) => { e.target.src = require('../assets/blogs.png'); }}
                  />
                </div>
                <div className="blog-card-content">
                  <h3 className="blog-card-title">{blog.title || blog.name}</h3>
                  {(blog.excerpt || blog.article) && (
                    <p className="blog-card-excerpt">
                      {(blog.excerpt || blog.article).replace(/<[^>]*>/g, '').substring(0, 120)}...
                    </p>
                  )}
                  <p className="blog-card-date">{formatDate(blog.publishdate || blog.createdAt || blog.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-blogs">No blogs available</div>
        )}
      </div>
    </div>
  );
};

export default Blog;
