import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  PlusCircle,
  Calendar,
  Flame,
  AlertTriangle,
  Target
} from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { StudyPlanCard } from '../components/StudyPlanCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SUBJECT_COLORS, SUBJECT_EMOJIS, getTodayDateStr } from '../utils/subjectConstants';

export const DashboardPage = ({
  user,
  plans = [],
  stats = {},
  overview = null,
  loading = false,
  onStatusToggle,
  onEditPlan,
  onDeletePlan,
  onOpenAddModal,
  onOpenRecoveryModal,
  onNavigate,
  onStartFocusWithPlan,
}) => {
  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayStr = getTodayDateStr();
  const todayPlans = plans.filter((p) => p.date === todayStr);

  // Extract real analytics data from overview
  const gamification = overview?.gamification || {
    xp: user?.xp || 0,
    level: 1,
    levelTitle: 'Novice Scholar',
    levelMinXp: 0,
    nextLevelXp: 100,
    progressPercent: 0
  };

  const streak = overview?.streak || { current: 0, longest: 0 };
  const recommendation = overview?.recommendation;
  const mission = overview?.dailyMission || {
    isComplete: false,
    rewardClaimed: false,
    requirements: {
      tasksCompleted: { target: 3, current: 0, met: false },
      focusMinutes: { target: 90, current: 0, met: false },
      quizzesTaken: { target: 1, current: 0, met: false }
    }
  };

  const coach = overview?.coach || {
    headline: 'Welcome to Campus Study Planner',
    message: 'Set up your study plans and start a focus session to build consistent daily momentum!',
    action: 'Create Plan',
    actionTab: 'plans'
  };

  const bestStudyTime = overview?.bestStudyTime;
  const missedTasksCount = overview?.missedTasksCount || 0;

  const handleStartRecommendation = () => {
    if (!recommendation) {
      if (onNavigate) onNavigate('focus');
      return;
    }
    if (onStartFocusWithPlan) {
      onStartFocusWithPlan({
        subject: recommendation.subject,
        title: recommendation.topic || `${recommendation.subject} Study Session`,
        estimatedMinutes: recommendation.suggestedMinutes || 45,
        _id: recommendation.planId || null
      });
    } else if (onNavigate) {
      onNavigate('focus', {
        subject: recommendation.subject,
        topic: recommendation.topic
      });
    }
  };

  return (
    <div className="page-container page-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Gamification & XP Progress Top Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        {/* Level & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
            }}
          >
            L{gamification.level || 1}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                {gamification.levelTitle || 'Novice Scholar'}
              </h3>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', background: 'rgba(234, 179, 8, 0.15)', color: '#fbbf24', fontWeight: 600, border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                ⭐ {gamification.xp} Total XP
              </span>
            </div>
            {/* XP progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div style={{ width: '160px', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${gamification.progressPercent || 0}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
                    borderRadius: '3px'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                {gamification.xp} / {gamification.nextLevelXp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Streak & Achievements Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Study Streak */}
          <div
            onClick={() => onNavigate && onNavigate('progress')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: streak.current > 0 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: streak.current > 0 ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🔥</span>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: streak.current > 0 ? '#fb923c' : '#94a3b8' }}>
                {streak.current} Day{streak.current === 1 ? '' : 's'} Streak
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>
                Best: {streak.longest || streak.current} days
              </div>
            </div>
          </div>

          {/* Missed Tasks Alert Button */}
          {missedTasksCount > 0 && (
            <button
              onClick={onOpenRecoveryModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <AlertTriangle size={16} />
              <span>{missedTasksCount} Overdue ({`Recover`})</span>
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Greeting Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a', letterSpacing: '-0.03em' }}>
            {getGreeting()}, {user?.name || 'Student'}! 👋
          </h1>
          <p style={{ color: '#475569', fontSize: '1.02rem', margin: 0, fontWeight: 600 }}>
            Welcome to <strong style={{ color: '#0284c7' }}>Campus</strong> — your Remote Study Planner. Let's make today productive.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="btn-primary"
          style={{
            padding: '0.85rem 1.6rem',
            fontSize: '0.98rem',
            fontWeight: 800,
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <PlusCircle size={20} />
          <span>＋ Add Study Plan</span>
        </button>
      </div>

      {/* Hero Section: "WHAT SHOULD I STUDY NOW?" + "TODAY'S MISSION" */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Recommendation Hero Card */}
        <div
          className="card dashboard-hero-card"
          style={{
            padding: '24px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 58, 138, 0.92))',
            border: '2px solid rgba(56, 189, 248, 0.45)',
            boxShadow: '0 10px 32px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.35rem' }}>🎯</span>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, letterSpacing: '0.06em', color: '#38bdf8', textTransform: 'uppercase', textShadow: '0 0 12px rgba(56, 189, 248, 0.4)' }}>
                  WHAT SHOULD I STUDY NOW?
                </span>
              </div>
              {recommendation?.subject && (
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: `${SUBJECT_COLORS[recommendation.subject] || '#3b82f6'}35`,
                    color: '#ffffff',
                    border: `1.5px solid ${SUBJECT_COLORS[recommendation.subject] || '#3b82f6'}`
                  }}
                >
                  {SUBJECT_EMOJIS[recommendation.subject] || '📚'} {recommendation.subject}
                </span>
              )}
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0 0 10px 0', lineHeight: 1.3 }}>
              {recommendation?.topic || (recommendation?.subject ? `Master ${recommendation.subject} Core Topics` : 'Create your next study goal')}
            </h3>

            <p style={{ fontSize: '0.92rem', color: '#e2e8f0', lineHeight: '1.55', margin: '0 0 18px 0', fontWeight: 500 }}>
              {recommendation?.reason || 'Smart recommendation calculated from your weakest subjects, active exams, and pending milestones.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <button
              onClick={handleStartRecommendation}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '11px 18px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
              }}
            >
              <span>⏱️</span> Start Focus Session ({recommendation?.suggestedMinutes || 45}m)
            </button>
            <button
              onClick={() => onNavigate && onNavigate('quiz', { subject: recommendation?.subject || 'DAA' })}
              className="btn btn-secondary"
              style={{
                padding: '11px 16px',
                borderRadius: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              title="Test knowledge on this subject"
            >
              <span>⚡</span> Quiz
            </button>
          </div>
        </div>

        {/* Daily Mission Card with Bright Headings */}
        <div
          className="card dashboard-hero-card"
          style={{
            padding: '24px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(88, 28, 135, 0.92))',
            border: '2px solid rgba(192, 132, 252, 0.45)',
            boxShadow: '0 10px 32px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.35rem' }}>🏆</span>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, letterSpacing: '0.06em', color: '#c084fc', textTransform: 'uppercase', textShadow: '0 0 12px rgba(192, 132, 252, 0.4)' }}>
                  TODAY'S MISSION
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', background: mission.isComplete ? 'rgba(34, 197, 94, 0.3)' : 'rgba(168, 85, 247, 0.3)', color: mission.isComplete ? '#4ade80' : '#f3e8ff', border: mission.isComplete ? '1px solid #4ade80' : '1px solid #c084fc' }}>
                {mission.isComplete ? '✓ MISSION ACCOMPLISHED (+50 XP)' : '+50 XP REWARD'}
              </span>
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0' }}>
              {/* Task 1 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.92rem', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '10px' }}>
                <span style={{ color: mission.requirements?.tasksCompleted?.met ? '#4ade80' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  {mission.requirements?.tasksCompleted?.met ? '✅' : '⚪'} Complete 3 study tasks
                </span>
                <strong style={{ color: mission.requirements?.tasksCompleted?.met ? '#4ade80' : '#38bdf8', fontWeight: 800 }}>
                  {mission.requirements?.tasksCompleted?.current || 0}/3
                </strong>
              </div>

              {/* Task 2 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.92rem', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '10px' }}>
                <span style={{ color: mission.requirements?.focusMinutes?.met ? '#4ade80' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  {mission.requirements?.focusMinutes?.met ? '✅' : '⚪'} 90 minutes of focus time
                </span>
                <strong style={{ color: mission.requirements?.focusMinutes?.met ? '#4ade80' : '#fbbf24', fontWeight: 800 }}>
                  {mission.requirements?.focusMinutes?.current || 0}/90m
                </strong>
              </div>

              {/* Task 3 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.92rem', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '10px' }}>
                <span style={{ color: mission.requirements?.quizzesTaken?.met ? '#4ade80' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  {mission.requirements?.quizzesTaken?.met ? '✅' : '⚪'} Take 1 subject quiz
                </span>
                <strong style={{ color: mission.requirements?.quizzesTaken?.met ? '#4ade80' : '#c084fc', fontWeight: 800 }}>
                  {mission.requirements?.quizzesTaken?.current || 0}/1
                </strong>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize: '0.82rem', color: '#e9d5ff', textAlign: 'center', fontWeight: 600 }}>
              {mission.isComplete ? '🎉 Daily mission completed! Bonus XP added to your level.' : '⚡ Complete all 3 objectives today to claim your bonus XP!'}
            </div>
          </div>
        </div>
      </div>

      {/* AI Study Coach & Best Study Time Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* AI Coach Banner */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(14, 116, 144, 0.85))',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ fontSize: '2.2rem', background: 'rgba(56, 189, 248, 0.2)', padding: '10px', borderRadius: '14px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            🤖
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              AI STUDY COACH
            </div>
            <h4 style={{ margin: '3px 0 5px 0', fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              {coach.headline}
            </h4>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#e2e8f0', lineHeight: '1.45', fontWeight: 500 }}>
              {coach.message}
            </p>
          </div>
          {coach.actionTab && onNavigate && (
            <button
              onClick={() => onNavigate(coach.actionTab)}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '9px 14px', borderRadius: '10px', whiteSpace: 'nowrap', fontWeight: 700 }}
            >
              {coach.action || 'Go'} ➔
            </button>
          )}
        </div>

        {/* Best Study Time Card */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(180, 83, 9, 0.85))',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ fontSize: '2.2rem', background: 'rgba(245, 158, 11, 0.2)', padding: '10px', borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            ⏰
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              BEST STUDY TIME
            </div>
            <h4 style={{ margin: '3px 0 5px 0', fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              {bestStudyTime?.label ? `${bestStudyTime.label} (${bestStudyTime.timeWindow})` : 'Afternoon (14:00 - 18:00)'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#e2e8f0', lineHeight: '1.45', fontWeight: 500 }}>
              {bestStudyTime?.insight || 'You achieve your highest focus completion rate during this time window.'}
            </p>
          </div>
        </div>
      </div>

      {/* Animated Statistics Cards from MongoDB */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <DashboardCard
          label="Total Study Plans"
          value={stats?.total ?? plans.length}
          icon={<BookOpen size={26} />}
          subtext="Across 8 academic subjects"
          colorVariant="blue"
        />
        <DashboardCard
          label="Completed"
          value={stats?.completed ?? plans.filter(p => p.status === 'Completed').length}
          icon={<CheckCircle2 size={26} />}
          subtext={stats?.total > 0 ? `${Math.round(((stats?.completed ?? 0) / stats.total) * 100)}% of goal reached` : 'Start your first task'}
          colorVariant="green"
        />
        <DashboardCard
          label="Pending"
          value={stats?.pending ?? plans.filter(p => p.status !== 'Completed').length}
          icon={<Clock size={26} />}
          subtext={stats?.highPriorityPending ? `${stats.highPriorityPending} High Priority` : 'Tasks on track'}
          colorVariant="yellow"
        />
        <DashboardCard
          label="Overall Progress"
          value={`${stats?.overallProgress ?? (plans.length > 0 ? Math.round((plans.filter(p => p.status === 'Completed').length / plans.length) * 100) : 0)}%`}
          icon={<TrendingUp size={26} />}
          subtext="MongoDB Real-time"
          colorVariant="orange"
        />
      </div>

      {/* Today's Study Schedule Section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={24} color="#0284c7" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Today's Study Plan
            </h2>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                background: '#e0f2fe',
                color: '#0284c7',
                border: '1px solid #bae6fd'
              }}
            >
              {todayPlans.length} {todayPlans.length === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>

          {todayPlans.length > 0 && (
            <button
              onClick={() => onNavigate && onNavigate('schedule')}
              className="btn btn-secondary"
              style={{ fontSize: '0.88rem', padding: '8px 14px', borderRadius: '10px', fontWeight: 700 }}
            >
              View Full Schedule ➔
            </button>
          )}
        </div>

        {loading && todayPlans.length === 0 ? (
          <LoadingSpinner message="Loading your study plans from MongoDB..." />
        ) : todayPlans.length > 0 ? (
          <div className="plan-cards-grid">
            {todayPlans.map((plan) => (
              <StudyPlanCard
                key={plan._id}
                plan={plan}
                onStatusToggle={onStatusToggle}
                onEdit={onEditPlan}
                onDelete={onDeletePlan}
                onStartFocus={onStartFocusWithPlan}
              />
            ))}
          </div>
        ) : (
          /* Friendly Empty State for Today */
          <div
            style={{
              background: '#ffffff',
              border: '2px dashed #cbd5e1',
              borderRadius: '20px',
              padding: '3rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontSize: '3.2rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              No study plans scheduled for today!
            </h3>
            <p style={{ color: '#64748b', maxWidth: '460px', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
              Want to get ahead? Schedule a study session in DAA, Backend, Python, Mathematics, DBMS, ACS, Web Development, or P and S now.
            </p>
            <button
              onClick={onOpenAddModal}
              className="btn-primary"
              style={{
                marginTop: '0.5rem',
                padding: '0.85rem 1.6rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem'
              }}
            >
              <PlusCircle size={18} />
              <span>+ Create Today's Plan</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
