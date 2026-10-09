import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading study plans...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '0.85rem',
        color: '#64748b',
      }}
    >
      <Loader2
        size={36}
        style={{
          color: '#0284c7',
          animation: 'spin 1s linear infinite',
        }}
      />
      <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>{message}</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
