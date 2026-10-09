import React, { useState } from 'react';
import { User, Mail, GraduationCap, Target, BookOpen, CheckCircle, Clock, TrendingUp, LogOut, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DashboardCard } from '../components/DashboardCard';

const AVATAR_OPTIONS = ['🎓', '🚀', '💻', '📚', '💡', '⚡', '🧠', '⭐'];

export const ProfilePage = ({ stats, onShowToast }) => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || 'Computer Science & Engineering',
    semester: user?.semester || 'Semester 4',
    targetHoursPerDay: user?.targetHoursPerDay || 4,
    avatar: user?.avatar || '🎓',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarSelect = (emoji) => {
    setFormData((prev) => ({ ...prev, avatar: emoji }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile(formData);
      setIsEditing(false);
      if (onShowToast) onShowToast('Profile updated successfully! ✨', 'success');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      {/* Top Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>
          Student Profile 👤
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Personal academic information and study achievements
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Student Details Card */}
        <div
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e0f2fe 0%, #fef3c7 100%)',
              border: '4px solid white',
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              marginBottom: '1rem',
            }}
          >
            {isEditing ? formData.avatar : user?.avatar || '🎓'}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user?.name}</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>{user?.email}</p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.95rem',
              borderRadius: '9999px',
              background: '#f1f5f9',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginTop: '0.85rem',
            }}
          >
            <GraduationCap size={16} />
            {user?.college || 'Computer Science & Engineering'} • {user?.semester || 'Semester 4'}
          </div>

          <div style={{ width: '100%', borderTop: '1px solid #f1f5f9', margin: '1.75rem 0' }} />

          {/* Edit Form or Display Buttons */}
          {isEditing ? (
            <form onSubmit={handleSave} style={{ width: '100%', textAlign: 'left' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Choose Avatar</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => handleAvatarSelect(emoji)}
                      style={{
                        fontSize: '1.4rem',
                        padding: '6px 10px',
                        borderRadius: '10px',
                        background: formData.avatar === emoji ? '#e0f2fe' : '#f8fafc',
                        border: formData.avatar === emoji ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department / College</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Semester / Year</label>
                <input
                  type="text"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Daily Target Study Hours</label>
                <input
                  type="number"
                  name="targetHoursPerDay"
                  value={formData.targetHoursPerDay}
                  onChange={handleChange}
                  min={1}
                  max={16}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', gap: '0.85rem', width: '100%' }}>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                <Edit2 size={16} /> Edit Profile
              </button>
              <button
                onClick={logout}
                className="btn-danger"
                style={{ flex: 1, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Academic Summary Statistics Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Academic Performance Metrics</h3>

          <DashboardCard
            label="Total Study Plans"
            value={stats?.total ?? 0}
            icon={<BookOpen size={24} />}
            subtext="Created across all 5 subjects"
            colorVariant="blue"
          />

          <DashboardCard
            label="Completed Tasks"
            value={stats?.completed ?? 0}
            icon={<CheckCircle size={24} />}
            subtext="Successfully finished milestones"
            colorVariant="green"
          />

          <DashboardCard
            label="Pending Tasks"
            value={stats?.pending ?? 0}
            icon={<Clock size={24} />}
            subtext="Upcoming study commitments"
            colorVariant="yellow"
          />

          <DashboardCard
            label="Overall Progress"
            value={`${stats?.overallProgress ?? 0}%`}
            icon={<TrendingUp size={24} />}
            subtext="Calculated dynamically from MongoDB"
            colorVariant="orange"
          />
        </div>
      </div>
    </div>
  );
};
