import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Timer,
  HelpCircle,
  Layers,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  GraduationCap,
  Bot,
  User,
  PlusCircle,
  LogOut,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ currentTab, setCurrentTab, onOpenAddModal, isOpen, setIsOpen, streakCount = 0 }) => {
  const { user, logout } = useAuth();

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { id: 'plans', label: 'My Study Plans', icon: <CheckSquare size={19} /> },
    { id: 'schedule', label: 'Schedule', icon: <CalendarDays size={19} /> },
  ];

  const practiceNav = [
    { id: 'focus', label: 'Focus Mode', icon: <Timer size={19} />, badge: 'Timer' },
    { id: 'quiz', label: 'AI Quizzes', icon: <HelpCircle size={19} />, badge: 'AI' },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers size={19} /> },
    { id: 'weak-areas', label: 'Weak Areas', icon: <AlertTriangle size={19} /> },
  ];

  const insightsNav = [
    { id: 'progress', label: 'Progress', icon: <TrendingUp size={19} /> },
    { id: 'monthly', label: 'Monthly Analysis', icon: <BarChart3 size={19} /> },
    { id: 'exams', label: 'Exam Countdown', icon: <GraduationCap size={19} /> },
    { id: 'ai', label: 'AI Doubt Assistant', icon: <Bot size={19} />, badge: 'AI' },
    { id: 'profile', label: 'Profile', icon: <User size={19} /> },
  ];

  const handleNavClick = (tabId) => {
    setCurrentTab(tabId);
    if (setIsOpen) setIsOpen(false);
  };

  const renderNavGroup = (title, items) => (
    <div className="sidebar-nav-group" key={title}>
      <div className="sidebar-group-label">{title}</div>
      <div className="sidebar-group-items">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-logo-icon">🎓</span>
        <div style={{ flex: 1 }}>
          <h2 className="sidebar-brand-name">Campus</h2>
          <p className="sidebar-tagline">Remote Study Planner</p>
        </div>
        {streakCount > 0 && (
          <div className="sidebar-streak-badge" title={`${streakCount} day study streak!`}>
            <Flame size={14} />
            <span>{streakCount}</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {renderNavGroup('Overview', mainNav)}
        {renderNavGroup('Practice & Study', practiceNav)}
        {renderNavGroup('Insights & Tools', insightsNav)}
      </nav>

      <div className="sidebar-quick-add">
        <button onClick={onOpenAddModal} className="btn-sidebar-add">
          <PlusCircle size={18} />
          <span>＋ Add Study Plan</span>
        </button>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{user?.avatar || '🎓'}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name || 'Student'}</div>
          <div className="sidebar-user-email">{user?.email || 'student@college.edu'}</div>
        </div>
        <button
          onClick={logout}
          title="Logout"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
