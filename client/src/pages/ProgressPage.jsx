import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  CheckCircle,
  Clock,
  Zap,
  BookOpen,
  Flame,
  Calendar,
  Trophy,
  Star,
  Target,
  CheckCircle2,
  Timer,
  HelpCircle,
  Layers,
  Brain,
  Lock,
  Check
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  CORE_SUBJECTS_LIST,
  SUBJECT_COLORS,
  SUBJECT_EMOJIS,
  getSubjectLabel,
  getSubjectFullName
} from '../utils/subjectConstants';
import api from '../api/api';

const NINE_BADGES_CONFIG = [
  {
    id: 'first_plan',
    title: 'First Study Plan',
    description: 'Create your first study plan to kickstart your routine',
    icon: '📘',
    color: '#0284c7',
    bg: '#e0f2fe',
    target: 1,
    getValue: (total) => Math.min(total || 0, 1),
    getUnlocked: (total) => (total || 0) >= 1,
  },
  {
    id: 'first_focus',
    title: 'First Focus Session',
    description: 'Complete your first deep work Pomodoro session',
    icon: '⏱️',
    color: '#ea580c',
    bg: '#ffedd5',
    target: 1,
    getValue: (t, c, s, o) => ((o?.totalFocusMinutes || 0) > 0 ? 1 : 0),
    getUnlocked: (t, c, s, o) => (o?.totalFocusMinutes || 0) > 0,
  },
  {
    id: 'streak_7',
    title: '7 Day Streak',
    description: 'Study 7 consecutive days to build unstoppable momentum',
    icon: '🔥',
    color: '#f59e0b',
    bg: '#fef3c7',
    target: 7,
    getValue: (t, c, s) => Math.min(Math.max(s?.longest || 0, s?.current || 0), 7),
    getUnlocked: (t, c, s) => Math.max(s?.longest || 0, s?.current || 0) >= 7,
  },
  {
    id: 'tasks_50',
    title: '50 Tasks Completed',
    description: 'Reach 50 completed academic study milestones',
    icon: '✅',
    color: '#16a34a',
    bg: '#dcfce7',
    target: 50,
    getValue: (t, completed) => Math.min(completed || 0, 50),
    getUnlocked: (t, completed) => (completed || 0) >= 50,
  },
  {
    id: 'first_quiz',
    title: 'First Quiz',
    description: 'Finish your first adaptive 5-question subject quiz',
    icon: '⚡',
    color: '#7c3aed',
    bg: '#ede9fe',
    target: 1,
    getValue: (t, c, s, o) => Math.min(o?.quizzesTaken || 0, 1),
    getUnlocked: (t, c, s, o) => (o?.quizzesTaken || 0) >= 1,
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Score 80%+ mastery on 3 distinct subject quizzes',
    icon: '🏆',
    color: '#d97706',
    bg: '#fef3c7',
    target: 3,
    getValue: (t, c, s, o) => Math.min(o?.goodQuizzes || 0, 3),
    getUnlocked: (t, c, s, o) => (o?.goodQuizzes || 0) >= 3,
  },
  {
    id: 'card_collector',
    title: 'Card Collector',
    description: 'Master 50 flashcard revision memory checks',
    icon: '🗂️',
    color: '#0d9488',
    bg: '#ccfbf1',
    target: 50,
    getValue: (t, c, s, o) => Math.min(o?.masteredCards || 0, 50),
    getUnlocked: (t, c, s, o) => (o?.masteredCards || 0) >= 50,
  },
  {
    id: 'mission_hero',
    title: 'Mission Hero',
    description: 'Accomplish 3 daily academic study missions',
    icon: '🎯',
    color: '#db2777',
    bg: '#fce7f3',
    target: 3,
    getValue: (t, c, s, o) => Math.min(o?.missionsDone || 0, 3),
    getUnlocked: (t, c, s, o) => (o?.missionsDone || 0) >= 3,
  },
  {
    id: 'focus_10h',
    title: 'Deep Focus',
    description: 'Log 10 cumulative hours of focused study time',
    icon: '🧠',
    color: '#2563eb',
    bg: '#dbeafe',
    target: 10,
    getValue: (t, c, s, o) => Math.min(Math.round(((o?.totalFocusMinutes || 0) / 60) * 10) / 10, 10),
    getUnlocked: (t, c, s, o) => (o?.totalFocusMinutes || 0) >= 600,
  },
];

export const ProgressPage = ({ stats, loading: parentLoading, overview = null, onNavigate }) => {
  const [streakData, setStreakData] = useState(null);
  const [bestTimeData, setBestTimeData] = useState(null);
  const [localStats, setLocalStats] = useState(null);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    fetchExtras();
  }, [stats]);

  const fetchExtras = async () => {
    setLoadingExtras(true);
    try {
      const calls = [
        api.getStreak(),
        api.getBestStudyTime()
      ];
      if (!stats) {
        calls.push(api.getProgress());
      }
      const [streakRes, bestTimeRes, progressRes] = await Promise.allSettled(calls);

      if (streakRes.status === 'fulfilled' && streakRes.value.data?.success) {
        setStreakData(streakRes.value.data.streak);
      }
      if (bestTimeRes.status === 'fulfilled' && bestTimeRes.value.data?.success) {
        setBestTimeData(bestTimeRes.value.data.bestStudyTime);
      }
      if (progressRes && progressRes.status === 'fulfilled' && progressRes.value.data?.stats) {
        setLocalStats(progressRes.value.data.stats);
      }
    } catch (err) {
      console.error('Error fetching progress extras:', err);
    } finally {
      setLoadingExtras(false);
    }
  };

  const activeStats = stats || localStats;

  if (parentLoading && !activeStats) {
    return <LoadingSpinner message="Calculating real-time academic progress from MongoDB..." />;
  }

  const {
    total = 0,
    completed = 0,
    pending = 0,
    overallProgress = 0,
    highPriorityPending = 0,
    subjectStats = [],
  } = activeStats || {};

  const streak = streakData || overview?.streak || { current: 0, longest: 0, activeDates: [] };
  const gamification = overview?.gamification || {
    xp: 0,
    level: 1,
    levelTitle: 'Novice Scholar',
    achievements: []
  };

  const backendAchievements = gamification?.achievements || [];
  const nineBadges = NINE_BADGES_CONFIG.map((b) => {
    const fromBackend = backendAchievements.find(
      (a) => a.id === b.id || a.title?.toLowerCase() === b.title?.toLowerCase()
    );
    const unlocked = fromBackend ? fromBackend.unlocked : b.getUnlocked(total, completed, streak, overview);
    const value = fromBackend && typeof fromBackend.value === 'number'
      ? fromBackend.value
      : b.getValue(total, completed, streak, overview);
    const target = fromBackend?.target || b.target;
    const title = fromBackend?.title || b.title;
    const description = fromBackend?.description || b.description;
    return {
      ...b,
      title,
      description,
      target,
      value: Math.min(value, target),
      unlocked,
    };
  });

  const unlockedCount = nineBadges.filter((b) => b.unlocked).length;

  const bestTime = bestTimeData || overview?.bestStudyTime;

  // Build calendar matrix for last 28 days
  const calendarDays = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isActive = streak.activeDates ? streak.activeDates.includes(dateStr) : false;
    calendarDays.push({
      dateStr,
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      weekday: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isActive,
      isToday: i === 0
    });
  }

  return (
    <div className="page-container page-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          Study Progress & Analytics 📈
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', marginTop: '0.2rem', fontWeight: 600 }}>
          Real-time metrics calculated dynamically from your Campus MongoDB study records
        </p>
      </div>

      {/* Overall Progress Master Card */}
      <div className="progress-card" style={{ marginBottom: '24px' }}>
        <div className="progress-header-row">
          <div>
            <span
              style={{
                fontSize: '0.88rem',
                fontWeight: 800,
                color: '#0284c7',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Academic Completion Rate
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.35rem' }}>
              <h2 style={{ fontSize: '3.2rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
                {overallProgress}%
              </h2>
              <span style={{ fontSize: '1.15rem', color: '#cbd5e1', fontWeight: 700 }}>
                {completed} / {total} tasks completed
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '0.7rem 1.4rem',
              borderRadius: '9999px',
              background: overallProgress >= 70 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: overallProgress >= 70 ? '#4ade80' : '#fbbf24',
              border: overallProgress >= 70 ? '1.5px solid rgba(34, 197, 94, 0.4)' : '1.5px solid rgba(245, 158, 11, 0.4)',
              fontWeight: 800,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Award size={20} />
            {overallProgress === 100
              ? 'All Plans Completed! 🏆'
              : overallProgress >= 70
              ? 'Great Momentum! 🔥'
              : overallProgress >= 40
              ? 'Steady Progress 🚀'
              : 'Keep Going! 📚'}
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="overall-progress-bar-bg" style={{ height: '14px', borderRadius: '7px' }}>
          <div
            className="overall-progress-bar-fill"
            style={{ width: `${Math.min(overallProgress, 100)}%`, borderRadius: '7px' }}
          />
        </div>

        {/* Quick Highlights Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px', color: '#60a5fa' }}>
              <BookOpen size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{total}</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700 }}>Total Schedules</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '10px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '12px', color: '#4ade80' }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{completed}</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700 }}>Completed Tasks</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '12px', color: '#fbbf24' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{pending}</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700 }}>Pending Tasks</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#f87171' }}>
              <Zap size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{highPriorityPending}</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700 }}>High Priority</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Streak Activity Calendar & Best Study Time */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Streak Activity Calendar */}
        <div className="card" style={{ padding: '24px', borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={24} color="#ea580c" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Study Streak & Activity
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ea580c', background: '#ffedd5', padding: '5px 12px', borderRadius: '999px', border: '1px solid #fed7aa' }}>
                🔥 {streak.current} Day Streak
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px 0', fontWeight: 500 }}>
            Days with at least 1 completed task, focus session, or quiz submission count toward your streak:
          </p>

          {/* 28-day Activity Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {calendarDays.map((day) => (
              <div
                key={day.dateStr}
                title={`${day.dateStr}: ${day.isActive ? 'Active Study Day 🔥' : 'No activity recorded'}`}
                style={{
                  padding: '8px 4px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  background: day.isActive ? 'linear-gradient(135deg, #ffedd5, #fed7aa)' : '#f8fafc',
                  border: day.isToday ? '2px solid #0284c7' : day.isActive ? '1.5px solid #fb923c' : '1px solid #e2e8f0',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>{day.weekday}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: day.isActive ? '#9a3412' : '#334155' }}>
                  {day.dayNum}
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                  {day.isActive ? '🔥' : '·'}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            <span>Longest Streak: <strong style={{ color: '#0f172a' }}>{streak.longest || streak.current} days</strong></span>
            <span>Active Days: <strong style={{ color: '#ea580c' }}>{streak.activeDates?.length || 0} / 28</strong></span>
          </div>
        </div>

        {/* Best Study Time Analytics */}
        <div className="card" style={{ padding: '24px', borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={24} color="#d97706" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Best Study Time Analysis
              </h3>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400e', background: '#fef3c7', padding: '4px 10px', borderRadius: '8px', border: '1px solid #fde047' }}>
              Peak: {bestTime?.label || 'Afternoon'}
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px 0', fontWeight: 500 }}>
            {bestTime?.insight || 'Analyzed from your actual task completion timestamps across all hours of the day.'}
          </p>

          {/* Time Buckets Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(bestTime?.breakdown || [
              { label: 'Morning (06:00 - 12:00)', completedCount: 0, completionRate: 0 },
              { label: 'Afternoon (12:00 - 18:00)', completedCount: 0, completionRate: 0 },
              { label: 'Evening (18:00 - 23:00)', completedCount: 0, completionRate: 0 },
              { label: 'Night (23:00 - 06:00)', completedCount: 0, completionRate: 0 },
            ]).map((b, idx) => (
              <div key={idx} style={{ padding: '10px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '6px' }}>
                  <span style={{ color: '#1e293b', fontWeight: 700 }}>{b.label}</span>
                  <span style={{ color: '#d97706', fontWeight: 800 }}>{b.completionRate || 0}% Success</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${b.completionRate || 0}%`,
                      background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gamification Achievements Gallery — All 9 Canonical Badges */}
      <div className="card" style={{ padding: '24px', borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trophy size={26} color="#d97706" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Academic Achievements & Badges
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                Earn badges as you complete tasks, retain streaks, and conquer subject quizzes
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: 800,
              color: '#b45309',
              background: '#fef3c7',
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid #fde047',
              boxShadow: '0 1px 3px rgba(245, 158, 11, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>⭐</span>
            <span>{unlockedCount} / 9 Unlocked</span>
          </span>
        </div>

        <div className="achievements-badges-grid">
          {nineBadges.map((badge) => (
            <div
              key={badge.id}
              className={`achievement-badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="badge-card-header">
                <div
                  className="badge-icon-box"
                  style={{
                    background: badge.unlocked ? badge.bg : '#f1f5f9',
                    color: badge.unlocked ? badge.color : '#94a3b8',
                    border: `1.5px solid ${badge.unlocked ? badge.color + '40' : '#e2e8f0'}`,
                  }}
                >
                  <span>{badge.icon}</span>
                </div>
                <span className={`badge-status-pill ${badge.unlocked ? 'unlocked' : 'locked'}`}>
                  {badge.unlocked ? (
                    <>
                      <Check size={12} strokeWidth={3} /> Unlocked
                    </>
                  ) : (
                    <>
                      <Lock size={12} /> Locked
                    </>
                  )}
                </span>
              </div>

              <div className="badge-card-content">
                <h4 className="badge-card-title">{badge.title}</h4>
                <p className="badge-card-desc">{badge.description}</p>
              </div>

              <div className="badge-card-progress">
                <div className="badge-progress-track">
                  <div
                    className="badge-progress-fill"
                    style={{
                      width: `${Math.min(100, Math.round(((badge.value || (badge.unlocked ? badge.target : 0)) / badge.target) * 100))}%`,
                      background: badge.unlocked
                        ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                        : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                    }}
                  />
                </div>
                <div className="badge-progress-meta">
                  <span>
                    {badge.value} / {badge.target} {badge.id === 'focus_10h' ? 'hrs' : ''}
                  </span>
                  <span style={{ color: badge.unlocked ? '#16a34a' : '#64748b' }}>
                    {badge.unlocked ? '100% Complete' : `${Math.round(((badge.value || 0) / badge.target) * 100)}%`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================
          SUBJECT-WISE BREAKDOWN (ALL 8 CORE SUBJECTS)
          High contrast names, crystal-clear readability
      ==================================================== */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
          Subject-Wise Breakdown (All 8 Core Subjects) 🎯
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0 0 1.25rem 0', fontWeight: 600 }}>
          Individual progress, completion counts, and syllabus coverage across each subject
        </p>
      </div>

      <div className="subject-progress-grid">
        {CORE_SUBJECTS_LIST.map((sub) => {
          const label = getSubjectLabel(sub);
          const fullName = getSubjectFullName(sub);
          const item = (subjectStats || []).find(s => s.subject === sub || s.label === label) || {
            subject: sub,
            total: 0,
            completed: 0,
            pending: 0,
            percentage: 0
          };
          const color = SUBJECT_COLORS[sub] || '#0284c7';
          const icon = SUBJECT_EMOJIS[sub] || '📚';

          return (
            <div
              key={sub}
              className="subject-progress-card"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.25rem 1.4rem',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Header: Subject Name & High-Contrast Percentage */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                  <div>
                    {/* Clear, Dark, High-Contrast Subject Name */}
                    <span
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        display: 'block',
                        lineHeight: 1.2
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        color: '#64748b',
                        fontWeight: 600,
                        display: 'block',
                        marginTop: '1px'
                      }}
                    >
                      {fullName}
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: color,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    background: `${color}15`,
                    border: `1px solid ${color}30`
                  }}
                >
                  {item.percentage}%
                </span>
              </div>

              {/* Progress Bar with High Contrast Track */}
              <div
                style={{
                  height: '10px',
                  background: '#f1f5f9',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  margin: '12px 0 10px 0',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(item.percentage, 100)}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                    borderRadius: '5px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>

              {/* Footer Counters */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.84rem',
                  color: '#475569',
                  fontWeight: 600,
                }}
              >
                <span>
                  <strong style={{ color: '#0f172a', fontWeight: 800 }}>{item.completed}</strong> of {item.total} finished
                </span>
                <span style={{ color: item.pending > 0 ? '#ea580c' : '#16a34a', fontWeight: 700 }}>
                  {item.pending} pending
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Navigation Strip */}
      {onNavigate && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginTop: '3rem',
            paddingTop: '1.75rem',
            borderTop: '1.5px solid #e2e8f0'
          }}
        >
          <button
            onClick={() => onNavigate('weak-areas')}
            className="btn-view-week-topics"
            id="progress-btn-view-week-topics"
            title="Explore syllabus topics needing extra revision"
          >
            <Target size={18} />
            <span>View Week Topics</span>
          </button>
          <button
            onClick={() => onNavigate('quiz')}
            className="btn-take-subject-quiz"
            id="progress-btn-take-subject-quiz"
            title="Launch an interactive subject quiz"
          >
            <Zap size={18} />
            <span>Take Subject Quiz</span>
          </button>
          <button
            onClick={() => onNavigate('focus')}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1.4rem',
              borderRadius: '12px',
              fontWeight: 800
            }}
            title="Start a timed focus study block"
          >
            <Clock size={18} />
            <span>Start Focus Session</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
