import React, { useEffect, useState } from 'react';
import { getAnalytics, formatFileSize } from '../utils/api';

const Hero = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAnalytics().then(data => setStats(data));
  }, []);

  return (
    <section className="hero">
      <div className="container hero-content">
        <h1 className="hero-title animate-slide-up">
          Smart Document Processing for <span className="gradient-text">Students</span>
        </h1>
        <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Compress, convert, and merge your PDFs and assignments in seconds. Stop worrying about file size limits.
        </p>
        
        {stats && (
          <div className="hero-stats animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="stat-badge">
              <span className="stat-value">{stats.totalJobs}</span>
              <span className="stat-label">Files Processed</span>
            </div>
            <div className="stat-badge">
              <span className="stat-value">{formatFileSize(stats.totalBytesSaved)}</span>
              <span className="stat-label">Storage Saved</span>
            </div>
          </div>
        )}

        <div className="hero-actions animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <a href="#tools" className="btn btn-primary">Get Started</a>
          <a href="#about" className="btn btn-secondary">Learn More</a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
