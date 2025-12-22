import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BlogDetail.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const CLOUDINARY_CLOUD_NAME = 'dzf7l80im';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogDetail();
  }, [id]);

  const fetchBlogDetail = async () => {
    try {
      const response = await fetch(`${API_BASE}/blogs/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Blog data received:', data);
        console.log('Banner URL will be:', data.banner || data.url);
        setBlog(data);
      } else {
        setError('Blog not found');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    // If timestamp is a unix timestamp (number), convert it
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Get the banner image URL
  const getBannerUrl = () => {
    if (!blog) return null;
    
    // Priority 1: Check if already a Cloudinary URL
    if (blog.url && blog.url.includes('cloudinary.com')) {
      console.log('Using existing Cloudinary URL:', blog.url);
      return blog.url;
    }
    
    if (blog.banner && blog.banner.includes('cloudinary.com')) {
      console.log('Using banner Cloudinary URL:', blog.banner);
      return blog.banner;
    }
    
    // Priority 2: Check url field for full URL
    if (blog.url && (blog.url.startsWith('http://') || blog.url.startsWith('https://'))) {
      console.log('Using url field:', blog.url);
      return blog.url;
    }
    
    // Priority 3: Check banner field for full URL
    if (blog.banner && (blog.banner.startsWith('http://') || blog.banner.startsWith('https://'))) {
      console.log('Using banner URL:', blog.banner);
      return blog.banner;
    }
    
    // Priority 4: Construct Cloudinary URL from banner filename
    if (blog.banner && blog.banner !== 'banner.jpg') {
      // Extract just the filename without path
      const filename = blog.banner.split('/').pop();
      const cloudinaryUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/blog_images/${filename}`;
      console.log('Constructed Cloudinary URL:', cloudinaryUrl);
      return cloudinaryUrl;
    }
    
    // Priority 5: Try to construct from blogid
    if (blog.blogid) {
      const cloudinaryUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/blog_${blog.blogid}`;
      console.log('Constructed Cloudinary URL from blogid:', cloudinaryUrl);
      return cloudinaryUrl;
    }
    
    console.log('No valid banner found for blog:', blog);
    return null;
  };

  if (loading) {
    return (
      <div className="blog-detail-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-detail-container">
        <div className="error">{error || 'Blog not found'}</div>
        <button className="back-btn" onClick={() => navigate('/blogs')}>
          Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="blog-detail-container">
      {/* Header */}
      <header className="blog-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="header-brand">
          <img src={require('../assets/logo.png')} alt="Astrovaani" className="header-logo" />
          <span className="brand-text">Astrovaani</span>
        </div>
      </header>

      {/* Blog Content */}
      <article className="blog-content">
        {/* Featured Image */}
        {getBannerUrl() && (
          <div className="blog-featured-image">
            <img 
              src={getBannerUrl()}
              alt={blog.title || blog.name}
              onError={(e) => { 
                console.error('Image failed to load:', getBannerUrl());
                e.target.style.display = 'none'; 
              }}
            />
          </div>
        )}

        {/* Blog Title */}
        <h1 className="blog-title">{blog.title || blog.name || blog.pagetitle}</h1>

        {/* Blog Meta */}
        <div className="blog-meta">
          <span className="blog-date">Published on {formatDate(blog.publishdate || blog.createdAt)}</span>
          {blog.author && <span className="blog-author">By {blog.author}</span>}
        </div>

        {/* Blog Description/Content */}
        <div className="blog-body">
          {blog.excerpt && (
            <div className="blog-excerpt">
              <p><em>{blog.excerpt}</em></p>
            </div>
          )}
          {blog.article && (
            <div className="blog-article" dangerouslySetInnerHTML={{ __html: blog.article }} />
          )}
        </div>
      </article>

      {/* Footer */}
      <footer className="blog-footer">
        <button className="back-to-blogs-btn" onClick={() => navigate('/blogs')}>
          View All Blogs
        </button>
      </footer>
    </div>
  );
};

export default BlogDetail;
