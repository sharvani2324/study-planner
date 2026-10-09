import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon success" color="#16a34a" />;
      case 'error':
        return <AlertCircle size={18} className="toast-icon error" color="#dc2626" />;
      default:
        return <Info size={18} className="toast-icon info" color="#0284c7" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return '#86efac';
      case 'error':
        return '#fca5a5';
      default:
        return '#bae6fd';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        background: 'white',
        border: `1.5px solid ${getBorderColor()}`,
        borderRadius: '16px',
        padding: '12px 18px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '380px',
        animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {getIcon()}
      <div style={{ flex: 1, fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
        {toast.message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
