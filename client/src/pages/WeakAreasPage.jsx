import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Layers,
  Timer,
  Bot,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { api } from '../api/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SUBJECT_ICONS, getSubjectLabel, getTodayDateStr } from '../utils/subjectConstants';

export const WeakAreasPage = ({
  onPracticeQuiz,
  onPracticeTopic,
  onReviseCards,
  onStartFocus,
  onAskAI,
  onNavigate,
  showToast,
  onShowToast,
}) => {
  const triggerPractice = onPracticeQuiz || onPracticeTopic || ((sub, top) => onNavigate && onNavigate('quiz', { subject: sub, topic: top }));
  const triggerRevise = onReviseCards || ((sub, top) => onNavigate && onNavigate('flashcards', { subject: sub, topic: top }));
  const triggerFocus = onStartFocus || ((item) => onNavigate && onNavigate('focus', item));
  const triggerAI = onAskAI || ((sub, top) => onNavigate && onNavigate('ai', { subject: sub, topic: top }));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('All');

  const fetchWeakAreas = async () => {
    try {
      setLoading(true);
      const res = await api.getWeakAreas(getTodayDateStr());
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load weak areas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeakAreas();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Analysing your study patterns, quiz scores & confidence metrics..." />;
  }

  const weakAreas = data?.weakAreas || [];
  const subjects = data?.subjects || [];
  const filteredAreas = filterSubject === 'All'
    ? weakAreas
    : weakAreas.filter((w) => w.subject === filterSubject);

  return (
    <div className="page-container">
      {/* Top Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '1.8rem' }}>🎯</span>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>
            Your Weak Areas
          </h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Identified automatically from your actual missed tasks, low completion, low confidence ratings & quiz mistakes
        </p>
      </div>

      {/* Signals Summary Banner */}
      <div
        style={{
          background: 'white',
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Weak Topics Found
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: weakAreas.length > 0 ? '#dc2626' : '#16a34a' }}>
              {weakAreas.length} {weakAreas.length === 1 ? 'Topic' : 'Topics'}
            </div>
          </div>

          <div style={{ height: '36px', width: '1px', background: '#e2e8f0' }} />

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Detection Model
            </span>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
              Real Data • 4 Signals (Tasks, Focus, Quizzes, Flashcards)
            </div>
          </div>
        </div>

        {/* Filter by Subject Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {['All', ...new Set(weakAreas.map((w) => w.subject))].map((sub) => (
            <button
              key={sub}
              onClick={() => setFilterSubject(sub)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: filterSubject === sub ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                background: filterSubject === sub ? '#fee2e2' : '#f8fafc',
                color: filterSubject === sub ? '#dc2626' : '#475569',
                cursor: 'pointer',
              }}
            >
              {sub === 'All' ? 'All Subjects' : `${SUBJECT_ICONS[sub] || ''} ${getSubjectLabel(sub)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Weak Area Cards Grid */}
      {filteredAreas.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {filteredAreas.map((item, idx) => {
            const isCritical = item.severity === 'Critical';
            const isHigh = item.severity === 'High';

            return (
              <div
                key={idx}
                style={{
                  background: 'white',
                  border: isCritical ? '1.5px solid #fca5a5' : '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: isCritical ? '#dc2626' : isHigh ? '#ea580c' : '#d97706',
                  }}
                />

                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className={`badge-subject subject-${item.subject}`}>
                    <span>{SUBJECT_ICONS[item.subject] || '📘'}</span>
                    <span>{item.subjectLabel}</span>
                  </span>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.65rem',
                      borderRadius: '9999px',
                      background: isCritical ? '#fee2e2' : isHigh ? '#ffedd5' : '#fef3c7',
                      color: isCritical ? '#dc2626' : isHigh ? '#c2410c' : '#b45309',
                    }}
                  >
                    {item.severity} Priority
                  </span>
                </div>

                {/* Topic Title */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                  {item.topic}
                </h3>

                {/* Real Data Metric Pills */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  {item.confidence !== null && (
                    <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Confidence</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: item.confidence <= 2 ? '#dc2626' : '#d97706' }}>
                        {item.confidence}/5
                      </div>
                    </div>
                  )}

                  {item.completion !== null && (
                    <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Completion</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: item.completion < 60 ? '#dc2626' : '#d97706' }}>
                        {item.completion}%
                      </div>
                    </div>
                  )}

                  {item.quizAccuracy !== null && (
                    <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Quiz Accuracy</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: item.quizAccuracy < 60 ? '#dc2626' : '#d97706' }}>
                        {item.quizAccuracy}%
                      </div>
                    </div>
                  )}

                  {item.missedTasks > 0 && (
                    <div style={{ background: '#fee2e2', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid #fca5a5' }}>
                      <div style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600 }}>Missed Tasks</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#dc2626' }}>
                        {item.missedTasks}
                      </div>
                    </div>
                  )}
                </div>

                {/* Evidence bullets */}
                <div style={{ marginBottom: '1.25rem', fontSize: '0.82rem', color: '#64748b' }}>
                  {item.reasons.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                      <span style={{ color: '#ef4444' }}>•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => triggerPractice?.(item.subject, item.topic)}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.55rem 0.9rem', fontSize: '0.84rem' }}
                  >
                    <HelpCircle size={15} />
                    <span>Practice This</span>
                  </button>

                  <button
                    onClick={() => triggerFocus?.({ subject: item.subject, topic: item.topic })}
                    className="btn-secondary"
                    style={{ padding: '0.55rem 0.85rem', fontSize: '0.84rem' }}
                    title="Start Focus Session"
                  >
                    <Timer size={15} />
                    <span>Focus</span>
                  </button>

                  <button
                    onClick={() => triggerRevise?.(item.subject, item.topic)}
                    className="btn-secondary"
                    style={{ padding: '0.55rem 0.85rem', fontSize: '0.84rem' }}
                    title="Revise with Flashcards"
                  >
                    <Layers size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State: No weak areas detected */
        <div
          style={{
            background: 'white',
            border: '2px dashed #cbd5e1',
            borderRadius: '24px',
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '3rem',
          }}
        >
          <div style={{ fontSize: '3.5rem' }}>🌟</div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
            No critical weak areas identified!
          </h3>
          <p style={{ color: '#64748b', maxWidth: '460px', fontSize: '0.92rem' }}>
            Your study plans, focus ratings and quiz scores are in good standing. Keep practicing to maintain high mastery!
          </p>
          <button
            onClick={() => onPracticeQuiz?.('DAA', '')}
            className="btn-primary"
            style={{ marginTop: '0.5rem' }}
          >
            <HelpCircle size={18} />
            <span>Take a Practice Quiz</span>
          </button>
        </div>
      )}

      {/* Subject Health Summary Table */}
      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>
        Subject Health Overview 📊
      </h3>

      <div
        style={{
          background: 'white',
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                <th style={{ padding: '1rem 1.25rem' }}>Subject</th>
                <th style={{ padding: '1rem 1rem' }}>Plans</th>
                <th style={{ padding: '1rem 1rem' }}>Completion</th>
                <th style={{ padding: '1rem 1rem' }}>Focus Hours</th>
                <th style={{ padding: '1rem 1rem' }}>Avg Confidence</th>
                <th style={{ padding: '1rem 1rem' }}>Quiz Avg</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.subject} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{SUBJECT_ICONS[s.subject] || '📘'}</span>
                      <span>{s.label}</span>
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1rem' }}>
                    {s.completed} / {s.total}
                  </td>
                  <td style={{ padding: '1rem 1rem' }}>
                    {s.completionRate !== null ? (
                      <span style={{ fontWeight: 700, color: s.completionRate >= 70 ? '#16a34a' : s.completionRate >= 40 ? '#d97706' : '#dc2626' }}>
                        {s.completionRate}%
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1rem' }}>
                    {s.focusMinutes > 0 ? `${Math.round(s.focusMinutes / 60 * 10) / 10}h` : '—'}
                  </td>
                  <td style={{ padding: '1rem 1rem' }}>
                    {s.avgConfidence !== null ? `${s.avgConfidence}/5` : '—'}
                  </td>
                  <td style={{ padding: '1rem 1rem' }}>
                    {s.quizAverage !== null ? `${s.quizAverage}%` : '—'}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => onPracticeQuiz?.(s.subject, '')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        border: '1px solid #bae6fd',
                        cursor: 'pointer',
                      }}
                    >
                      Practice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeakAreasPage;
