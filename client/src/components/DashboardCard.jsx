import React from 'react';

export const DashboardCard = ({ label, value, icon, subtext, colorVariant = 'blue' }) => {
  return (
    <div className={`stat-card ${colorVariant}`}>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      <div className={`stat-icon-wrapper ${colorVariant}`}>{icon}</div>
    </div>
  );
};
