import React from 'react';

const ToolCard = ({ icon, title, description, types, active, onClick }) => {
  return (
    <div className={`tool-card glass ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="tool-icon">{icon}</div>
      <h3 className="tool-title">{title}</h3>
      <p className="tool-desc">{description}</p>
      <div className="tool-badges">
        {types.map((type, idx) => (
          <span key={idx} className="badge file-badge">{type}</span>
        ))}
      </div>
    </div>
  );
};

export default ToolCard;
