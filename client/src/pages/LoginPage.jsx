import React, { useState } from 'react';
import { LogIn, AlertCircle, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onSwitchToRegister, onBackToLanding }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account for instant reviewer evaluation
  const handleQuickDemo = async () => {
    setEmail('sharvani@test.com');
    setPassword('password123');
    try {
      setLoading(true);
      setError('');
      await login('sharvani@test.com', 'password123');
    } catch (err) {
      setError(err.message || 'Failed demo login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(251, 146, 60, 0.12), transparent 50%), #f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: '460px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-xl)',
          animation: 'fadeIn 0.35s ease-out',
        }}
      >
        <button
          onClick={onBackToLanding}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a' }}>Welcome to Campus!</h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.25rem', fontWeight: 600 }}>
            Login to your Remote Study Planner dashboard
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '12px',
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, color: '#1e293b' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sharvani@college.edu"
              className="form-input"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, color: '#1e293b' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-input"
              required
            />
          </div>

          {/* Student Login Primary Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-student-login-submit"
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.9rem',
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: '2px solid #38bdf8',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Logging in...' : 'Student Login to Dashboard'}</span>
          </button>

          {/* Quick Demo One-Click Login */}
          <button
            type="button"
            onClick={handleQuickDemo}
            className="btn-quick-demo-login"
            style={{
              width: '100%',
              marginTop: '0.85rem',
              padding: '0.85rem',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
              border: '2px solid #f59e0b',
              color: '#9a3412',
              fontWeight: 800,
              fontSize: '0.95rem',
              borderRadius: '12px',
              boxShadow: '0 3px 10px rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Sparkles size={18} color="#d97706" />
            <span>⚡ Instant Demo Student Login</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#0284c7',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
};
