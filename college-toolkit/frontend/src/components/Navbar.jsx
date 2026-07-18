import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar glass">
      <div className="navbar-container container">
        <div className="navbar-brand">
          <div className="logo-icon">🚀</div>
          <span className="logo-text gradient-text">College Toolkit</span>
        </div>
        <div className="navbar-links">
          <a href="#tools" className="nav-link">Tools</a>
          <a href="#analytics" className="nav-link">Analytics</a>
          <a href="#about" className="nav-link">About</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
