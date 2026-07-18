import React from 'react';

const Footer = () => {
  return (
    <footer className="footer" id="about">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="gradient-text">College Toolkit</h3>
            <p>Built with ❤️ for students</p>
          </div>
          <div className="footer-stack">
            <span className="badge">React</span>
            <span className="badge">Vite</span>
            <span className="badge">Node.js</span>
            <span className="badge">Python</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} College Toolkit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
