import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Clock, X, Sparkles } from 'lucide-react';

export const NotificationPanel = ({ isOpen, onClose, plans = [], stats = null, onSelectPlan }) => {
  if (!isOpen) return null;

  // Generate dynamic, intelligent notifications from actual database data
  const notifications = [];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPlans = plans.filter((p) => p.date === todayStr);
  const pendingToday = todayPlans.filter((p) => p.status === 'Pending');
  const completedToday = todayPlans.filter((p) => p.status === 'Completed');

  // 1. Session notifications for today
  if (pendingToday.length > 0) {
    const nextTask = pendingToday[0];
    notifications.push({
      id: 'today-upcoming',
      icon: '🔔',
      type: 'info',
      title: `${nextTask.subject} Session Scheduled`,
      message: `"${nextTask.topic}" is scheduled today at ${nextTask.time}. Ready to study?`,
      time: 'Today',
      planId: nextTask._id,
    });
  }

  // 2. High priority alert
  const highPriorityPending = plans.filter((p) => p.priority === 'High' && p.status === 'Pending');
  if (highPriorityPending.length > 0) {
    const topHigh = highPriorityPending[0];
    notifications.push({
      id: 'high-priority',
      icon: '⚠️',
      type: 'warning',
      title: `High Priority Focus: ${topHigh.subject}`,
      message: `You have ${highPriorityPending.length} high-priority topic(s) pending. "${topHigh.topic}" awaits your review!`,
      time: 'Important',
      planId: topHigh._id,
    });
  }

  // 3. Completion celebration
  if (completedToday.length > 0) {
    notifications.push({
      id: 'completed-today',
      icon: '🎉',
      type: 'success',
      title: 'Awesome Streak!',
      message: `You completed ${completedToday.length} study task(s) today! Keep up the momentum.`,
      time: 'Great progress',
    });
  }

  // 4. General subject motivation
  if (stats && stats.total > 0) {
    const lowestSubject = stats.subjectStats
      ?.filter((s) => s.total > 0 && s.percentage < 50)
      ?.sort((a, b) => a.percentage - b.percentage)[0];

    if (lowestSubject) {
      notifications.push({
        id: 'subject-boost',
        icon: '📚',
        type: 'info',
        title: `${lowestSubject.subject} Needs Attention`,
        message: `${lowestSubject.subject} is at ${lowestSubject.percentage}% completion. Ask AI Doubt Assistant for tips!`,
        time: 'Study Tip',
      });
    }
  }

  // Fallback if no notifications yet
  if (notifications.length === 0) {
    notifications.push({
      id: 'welcome-notif',
      icon: '✨',
      type: 'info',
      title: 'Welcome to Study Planner!',
      message: 'Create your first study schedule to receive personalized reminders and progress tips.',
      time: 'Just now',
    });
  }

  return (
    <div className="notification-panel">
      <div className="notif-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} color="#0284c7" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Study Notifications</h4>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="notif-list">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="notif-item"
            onClick={() => {
              if (notif.planId && onSelectPlan) {
                onSelectPlan(notif.planId);
                onClose();
              }
            }}
            style={{ cursor: notif.planId ? 'pointer' : 'default' }}
          >
            <div className="notif-item-icon">{notif.icon}</div>
            <div className="notif-item-content">
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                {notif.title}
              </div>
              <div className="notif-item-text">{notif.message}</div>
              <div className="notif-item-time">{notif.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
