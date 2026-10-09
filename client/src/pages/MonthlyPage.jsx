import React, { useState, useEffect } from 'react';
import { Target, Zap, Clock } from 'lucide-react';
import api from '../api/api';
import { ALLOWED_SUBJECTS, SUBJECT_COLORS, SUBJECT_EMOJIS } from '../utils/subjectConstants';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthlyPage = ({ onNavigate }) => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedMonth, selectedYear]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const res = await api.getMonthlyAnalytics({ month: selectedMonth, year: selectedYear });
      if (res.data?.success || res.success) {
        setData(res.data?.analytics || res.analytics || res.data || res);
      }
    } catch (err) {
      console.error('Error fetching monthly analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  return (
    <div className="monthly-page-container page-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header with Month Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📅</span> Monthly Performance Insights
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>
            Comprehensive analysis of your study habits, subject consistency, and AI-driven growth tips
          </p>
        </div>

        {/* Month Selector Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '8px 16px', borderRadius: '14px', border: '1.5px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <button
            onClick={handlePrevMonth}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 800 }}
            title="Previous Month"
          >
            ◀
          </button>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', minWidth: '150px', textAlign: 'center' }}>
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 800 }}
            title="Next Month"
          >
            ▶
          </button>
        </div>
      </div>

      {/* 12-Month Visible Quick Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '10px 14px',
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {MONTH_NAMES.map((mName, mIdx) => {
          const monthNum = mIdx + 1;
          const isCurrent = selectedMonth === monthNum;
          return (
            <button
              key={mName}
              onClick={() => setSelectedMonth(monthNum)}
              style={{
                flex: '1 0 auto',
                padding: '8px 14px',
                borderRadius: '10px',
                border: isCurrent ? '2px solid #0284c7' : '1px solid #e2e8f0',
                background: isCurrent ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#f8fafc',
                color: isCurrent ? '#ffffff' : '#475569',
                fontWeight: isCurrent ? 800 : 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: isCurrent ? '0 2px 8px rgba(2, 132, 199, 0.35)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              {mName.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
          <p style={{ fontWeight: 600 }}>Analyzing study records for {MONTH_NAMES[selectedMonth - 1]}...</p>
        </div>
      ) : !data ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', fontWeight: 600 }}>Failed to load monthly statistics. Please try again.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Key Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Total Focus Hours */}
            <div className="card" style={{ padding: '18px', borderRadius: '16px', background: '#ffffff', border: '1.5px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Focus Time</span>
                <span style={{ fontSize: '1.2rem' }}>⏱️</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7' }}>
                {data.totalFocusHours || (data.totalFocusMinutes ? (data.totalFocusMinutes / 60).toFixed(1) : 0)} hrs
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
                {data.totalFocusMinutes || 0} total focus minutes
              </div>
            </div>

            {/* Plan Completion Rate */}
            <div className="card" style={{ padding: '18px', borderRadius: '16px', background: '#ffffff', border: '1.5px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Completion Rate</span>
                <span style={{ fontSize: '1.2rem' }}>🎯</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: data.completionRate >= 70 ? '#16a34a' : data.completionRate >= 40 ? '#d97706' : '#dc2626' }}>
                {data.completionRate || 0}%
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
                {data.completedPlans || 0} of {data.totalPlans || 0} plans completed
              </div>
            </div>

            {/* Active Study Days */}
            <div className="card" style={{ padding: '18px', borderRadius: '16px', background: '#ffffff', border: '1.5px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Active Days</span>
                <span style={{ fontSize: '1.2rem' }}>🔥</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ea580c' }}>
                {data.activeDays || 0} days
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
                Best Day: <strong style={{ color: '#0f172a' }}>{data.bestDay || 'N/A'}</strong>
              </div>
            </div>

            {/* Quizzes & Recall */}
            <div className="card" style={{ padding: '18px', borderRadius: '16px', background: '#ffffff', border: '1.5px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Quizzes Taken</span>
                <span style={{ fontSize: '1.2rem' }}>📝</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed' }}>
                {data.quizzesTaken || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
                Avg Score: <strong style={{ color: '#0f172a' }}>{data.averageQuizScore ? `${data.averageQuizScore}%` : 'N/A'}</strong>
              </div>
            </div>
          </div>

          {/* AI Monthly Insight Box */}
          <div
            className="card"
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.5rem', background: 'rgba(139, 92, 246, 0.2)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.4)' }}>🤖</span>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  AI Monthly Intelligence Report
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#a78bfa' }}>
                  Evaluated from your actual study completions, quiz results & focus sessions
                </span>
              </div>
            </div>

            {data.aiInsight ? (
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#38bdf8', margin: '0 0 8px 0' }}>
                  {data.aiInsight.headline || 'Monthly Growth Summary'}
                </h4>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#cbd5e1', margin: '0 0 20px 0' }}>
                  {data.aiInsight.summary}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {/* Strengths */}
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#4ade80', fontWeight: 600, fontSize: '0.9rem' }}>
                      <span>💪</span> Key Strengths
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                      {(data.aiInsight.strengths || ['Consistent effort', 'Good time management']).map((s, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas to improve */}
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#f87171', fontWeight: 600, fontSize: '0.9rem' }}>
                      <span>🎯</span> Priority Growth Areas
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                      {(data.aiInsight.improvements || ['Focus on weak topics', 'Regular revision']).map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Plan */}
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#60a5fa', fontWeight: 600, fontSize: '0.9rem' }}>
                      <span>🚀</span> Next Month Action Plan
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      {data.aiInsight.actionPlan || 'Focus 45 mins daily on difficult subjects and practice with flashcards.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem' }}>
                Complete more study tasks and quizzes this month to unlock deep AI monthly insights!
              </p>
            )}
          </div>

          {/* Two-Column Analytics: Subject Distribution & Weekly Trends */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {/* Subject Distribution */}
            <div className="card" style={{ padding: '22px', borderRadius: '16px', background: '#ffffff', border: '1.5px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📊</span> Subject Completion Distribution
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {ALLOWED_SUBJECTS.map((sub) => {
                  const item = (data.subjectBreakdown || []).find(b => b.subject === sub) || { subject: sub, total: 0, completed: 0, minutes: 0 };
                  const percent = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
                  const color = SUBJECT_COLORS[sub] || '#0284c7';

                  return (
                    <div key={sub}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.86rem' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{SUBJECT_EMOJIS[sub]}</span> {sub}
                        </span>
                        <span style={{ color: '#64748b', fontWeight: 700 }}>
                          {item.completed}/{item.total} plans ({percent}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percent}%`,
                            background: color,
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Trend Breakdown */}
            <div className="card" style={{ padding: '22px', borderRadius: '16px', background: '#ffffff', border: '1.5px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📈</span> Weekly Progress Breakdown
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(data.weeklyBreakdown && data.weeklyBreakdown.length > 0 ? data.weeklyBreakdown : [
                  { week: 'Week 1', completed: 0, total: 0, focusMinutes: 0 },
                  { week: 'Week 2', completed: 0, total: 0, focusMinutes: 0 },
                  { week: 'Week 3', completed: 0, total: 0, focusMinutes: 0 },
                  { week: 'Week 4', completed: 0, total: 0, focusMinutes: 0 },
                ]).map((w, idx) => {
                  const rate = w.total > 0 ? Math.round((w.completed / w.total) * 100) : 0;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        background: '#f8fafc',
                        border: '1.5px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 800 }}>{w.week || `Week ${idx + 1}`}</strong>
                        <span style={{ fontSize: '0.82rem', color: rate >= 70 ? '#16a34a' : '#d97706', fontWeight: 800 }}>
                          {rate}% Completion Rate
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                        <span>Completed Plans: <strong style={{ color: '#0f172a', fontWeight: 800 }}>{w.completed || 0}</strong></span>
                        <span>Focus Time: <strong style={{ color: '#0284c7', fontWeight: 800 }}>{w.focusMinutes || 0}m</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '1.25rem' }}>
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('weak-areas')}
                  className="btn-view-week-topics"
                  id="btn-view-week-topics"
                  title="Explore weak syllabus topics and focus recommendations"
                >
                  <Target size={18} />
                  <span>View Week Topics</span>
                </button>
                <button
                  onClick={() => onNavigate('quiz')}
                  className="btn-take-subject-quiz"
                  id="btn-take-subject-quiz"
                  title="Launch an interactive AI subject quiz"
                >
                  <Zap size={18} />
                  <span>Take Subject Quiz</span>
                </button>
                <button
                  onClick={() => onNavigate('focus')}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.4rem', borderRadius: '12px', fontWeight: 800 }}
                  title="Start a timed Pomodoro focus session"
                >
                  <Clock size={18} />
                  <span>Start Focus Session</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyPage;
