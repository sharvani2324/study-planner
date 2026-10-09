import React, { useState } from 'react';
import { Menu, Plus, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationPanel } from './NotificationPanel';

export const Navbar = ({
  currentTab,
  setCurrentTab,
  onOpenAddModal,
  toggleSidebar,
  plans,
  stats,
  onSelectPlan,
}) => {
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Study Dashboard 📊';
      case 'schedule':
        return 'Schedule & Calendar 📅';
      case 'plans':
        return 'My Study Plans 📋';
      case 'focus':
        return 'Focus Study Mode ⏱️';
      case 'quiz':
        return 'AI Quiz Mode 📝';
      case 'flashcards':
        return 'AI Flashcards 🗂️';
      case 'weak-areas':
        return 'Identified Weak Areas 🎯';
      case 'progress':
        return 'Performance & Progress 📈';
      case 'monthly':
        return 'Monthly Analysis & Insights 🗓️';
      case 'exams':
        return 'Exam Countdown & Prep 🎓';
      case 'ai':
        return 'AI Doubt Assistant 🤖';
      case 'profile':
        return 'Student Profile 👤';
      default:
        return 'Campus — Remote Study Planner 🎓';
    }
  };

  // Calculate unread / active notification count
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingCount = plans?.filter((p) => p.status === 'Pending').length || 0;
  const todayPending = plans?.filter((p) => p.date === todayStr && p.status === 'Pending').length || 0;
  const notifCount = todayPending > 0 ? todayPending : pendingCount > 0 ? Math.min(pendingCount, 3) : 1;

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button onClick={toggleSidebar} className="mobile-menu-btn" title="Toggle Menu">
          <Menu size={24} />
        </button>
        <h1 className="navbar-page-title">{getPageTitle()}</h1>
      </div>

      <div className="navbar-actions">
        <button onClick={onOpenAddModal} className="btn-header-add">
          <Plus size={18} />
          <span>＋ Add Study Plan</span>
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotif((prev) => !prev)}
            className="notif-bell-btn"
            title="Notifications"
          >
            <Bell size={20} />
            {notifCount > 0 && <span className="notif-badge-count">{notifCount}</span>}
          </button>

          <NotificationPanel
            isOpen={showNotif}
            onClose={() => setShowNotif(false)}
            plans={plans}
            stats={stats}
            onSelectPlan={onSelectPlan}
          />
        </div>

        <div
          onClick={() => setCurrentTab('profile')}
          style={{
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--yellow-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            border: '2px solid white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
          }}
          title="View Profile"
        >
          {user?.avatar || '🎓'}
        </div>
      </div>
    </header>
  );
};
