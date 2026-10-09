import React, { useState, useEffect, useRef } from 'react';
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Target,
  Brain,
  Award,
  ArrowRight,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api/api';
import { SUBJECTS_CONFIG, getTodayDateStr } from '../utils/subjectConstants';

const CONFIDENCE_LEVELS = [
  { value: 1, label: 'Very Weak', emoji: '🔴', desc: 'Need complete revision' },
  { value: 2, label: 'Weak', emoji: '🟠', desc: 'Struggling with key concepts' },
  { value: 3, label: 'Okay', emoji: '🟡', desc: 'Understood basic concepts' },
  { value: 4, label: 'Good', emoji: '🟢', desc: 'Can solve standard questions' },
  { value: 5, label: 'Very Confident', emoji: '🌟', desc: 'Mastered the topic thoroughly' },
];

const PRESET_DURATIONS = [
  { mins: 15, label: '15m Quick' },
  { mins: 25, label: '25m Pomodoro' },
  { mins: 45, label: '45m Deep' },
  { mins: 60, label: '60m Mastery' },
  { mins: 90, label: '90m Exam Prep' },
];

export const FocusModePage = ({
  initialPlan = null,
  onSessionComplete,
  onNavigateToQuiz,
  onNavigate,
  onShowToast,
  showToast,
}) => {
  const triggerToast = showToast || onShowToast;
  const triggerNavigateQuiz = onNavigateToQuiz || ((sub, top) => onNavigate && onNavigate('quiz', { subject: sub, topic: top }));
  // Session Configuration
  const [subject, setSubject] = useState(initialPlan?.subject || 'DAA');
  const [topic, setTopic] = useState(initialPlan?.topic || '');
  const [goal, setGoal] = useState(initialPlan?.notes || '');
  const [targetMinutes, setTargetMinutes] = useState(initialPlan?.estimatedMinutes || 25);
  const [linkedPlanId, setLinkedPlanId] = useState(initialPlan?._id || null);

  // Timer States
  const [secondsRemaining, setSecondsRemaining] = useState(targetMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [actualDurationSeconds, setActualDurationSeconds] = useState(0);

  // Finish & Confidence Modal
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [confidence, setConfidence] = useState(4);
  const [completeLinkedPlan, setCompleteLinkedPlan] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finishedSummary, setFinishedSummary] = useState(null);

  // Focus ambient quote
  const [focusQuote, setFocusQuote] = useState('Put away notifications and focus solely on this topic.');

  const intervalRef = useRef(null);

  // Synchronize when initialPlan changes (e.g. student clicked [START STUDY SESSION] from Dashboard)
  useEffect(() => {
    if (initialPlan) {
      setSubject(initialPlan.subject || 'DAA');
      setTopic(initialPlan.topic || '');
      setGoal(initialPlan.notes || '');
      const mins = initialPlan.estimatedMinutes || 25;
      setTargetMinutes(mins);
      setLinkedPlanId(initialPlan._id || null);
      setSecondsRemaining(mins * 60);
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [initialPlan]);

  // Timer Tick
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Reached goal!
            clearInterval(intervalRef.current);
            setIsRunning(false);
            handleFinishPrompt();
            return 0;
          }
          return prev - 1;
        });
        setActualDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused]);

  const handleStart = () => {
    if (!topic.trim()) {
      triggerToast?.('Please enter the study topic or select one.', 'error');
      return;
    }
    if (!isRunning) {
      setSessionStartTime(new Date().toISOString());
      setSecondsRemaining(targetMinutes * 60);
      setActualDurationSeconds(0);
    }
    setIsRunning(true);
    setIsPaused(false);
    triggerToast?.('Focus session started! Deep work in progress. 🎯', 'success');
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleReset = () => {
    if (window.confirm('Reset timer? Your current session progress will be cleared.')) {
      setIsRunning(false);
      setIsPaused(false);
      setSecondsRemaining(targetMinutes * 60);
      setActualDurationSeconds(0);
    }
  };

  const handlePresetSelect = (mins) => {
    if (isRunning) return;
    setTargetMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  const handleFinishPrompt = () => {
    setIsPaused(true);
    setShowFinishModal(true);
  };

  const handleSaveSession = async () => {
    try {
      setIsSubmitting(true);
      const totalSec = Math.max(actualDurationSeconds, (targetMinutes * 60) - secondsRemaining);

      const payload = {
        planId: linkedPlanId,
        subject,
        topic: topic.trim(),
        goal: goal.trim(),
        goalMinutes: targetMinutes,
        durationSeconds: totalSec,
        confidence: Number(confidence),
        startedAt: sessionStartTime || new Date(Date.now() - totalSec * 1000).toISOString(),
        localDate: getTodayDateStr(),
        startHour: new Date().getHours(),
        completePlan: completeLinkedPlan && linkedPlanId ? true : false,
      };

      const res = await api.createFocusSession(payload);
      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        triggerToast?.('Great work! Focus session & confidence rating saved! 🎉', 'success');
        setFinishedSummary({
          subject,
          topic,
          durationMins: Math.max(1, Math.round(totalSec / 60)),
          confidence,
        });
        setShowFinishModal(false);
        setIsRunning(false);
        setIsPaused(false);
        setSecondsRemaining(targetMinutes * 60);
        setActualDurationSeconds(0);

        if (onSessionComplete) {
          onSessionComplete();
        }
      }
    } catch (err) {
      triggerToast?.(err.message || 'Failed to save session.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = Math.min(
    100,
    targetMinutes > 0 ? Math.round(((targetMinutes * 60 - secondsRemaining) / (targetMinutes * 60)) * 100) : 0
  );

  return (
    <div className="page-container">
      {/* Top Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '1.8rem' }}>⏱️</span>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>
            Focus Mode
          </h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Eliminate distractions, track actual study duration, and rate your topic confidence
        </p>
      </div>

      {/* Finished Summary Banner */}
      {finishedSummary && (
        <div
          style={{
            background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
            border: '1.5px solid #86efac',
            borderRadius: '18px',
            padding: '1.4rem 1.75rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Award size={32} color="#16a34a" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d' }}>
                Session Logged: {finishedSummary.durationMins} minutes in {finishedSummary.subject}!
              </h3>
              <p style={{ color: '#166534', fontSize: '0.9rem', marginTop: '0.15rem' }}>
                Topic: <strong>{finishedSummary.topic}</strong> • Confidence: <strong>{finishedSummary.confidence}/5</strong> ({CONFIDENCE_LEVELS.find((c) => c.value === finishedSummary.confidence)?.label})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {triggerNavigateQuiz && (
              <button
                onClick={() => triggerNavigateQuiz(finishedSummary.subject, finishedSummary.topic)}
                className="btn-primary"
                style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
              >
                <span>Take a Quick Quiz</span>
                <ArrowRight size={16} />
              </button>
            )}
            <button
              onClick={() => setFinishedSummary(null)}
              className="btn-secondary"
              style={{ padding: '0.6rem 0.9rem', fontSize: '0.85rem' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Focus Workspace Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Left: Study Configuration Form */}
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border-subtle)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} color="#0284c7" />
            <span>Study Session Setup</span>
          </h3>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isRunning}
              className="form-select"
            >
              {SUBJECTS_CONFIG.map((sub) => (
                <option key={sub.value} value={sub.value}>
                  {sub.icon} {sub.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Topic / Concept to Study</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isRunning}
              placeholder="e.g. Normalization, Dynamic Programming, Bayes Theorem"
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Study Goal for this Session</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={isRunning}
              placeholder="e.g. Understand 3NF vs BCNF and solve 3 practice questions"
              rows={2}
              className="form-textarea"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Session Target Duration</label>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset.mins}
                  type="button"
                  onClick={() => handlePresetSelect(preset.mins)}
                  disabled={isRunning}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: targetMinutes === preset.mins ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                    background: targetMinutes === preset.mins ? '#e0f2fe' : '#f8fafc',
                    color: targetMinutes === preset.mins ? '#0284c7' : '#475569',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {linkedPlanId && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                fontSize: '0.84rem',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} color="#16a34a" />
              <span>Linked to your Study Plan. Completing will update your task!</span>
            </div>
          )}
        </div>

        {/* Right: Immersive Focus Timer Display */}
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border-subtle)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '6px',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
              transition: 'width 1s linear',
            }}
          />

          <span className={`badge-subject subject-${subject}`} style={{ marginBottom: '1rem' }}>
            <span>{subject}</span>
          </span>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            {topic || 'Select a topic to focus'}
          </h2>
          {goal && (
            <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '420px', marginBottom: '1.5rem' }}>
              🎯 Goal: {goal}
            </p>
          )}

          {/* Big Circular Styled Timer */}
          <div
            style={{
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ffffff 60%, #f0f9ff 100%)',
              border: isRunning ? '6px solid #0284c7' : '6px solid #e2e8f0',
              boxShadow: isRunning ? '0 0 35px rgba(2, 132, 199, 0.2)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '1.5rem 0 2rem',
              transition: 'all 0.3s ease',
            }}
          >
            <span
              style={{
                fontSize: '3.6rem',
                fontWeight: 800,
                fontFamily: 'monospace',
                color: '#0f172a',
                letterSpacing: '-0.03em',
              }}
            >
              {formatTime(secondsRemaining)}
            </span>

            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: isRunning ? '#0284c7' : '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginTop: '0.25rem',
              }}
            >
              {isRunning && !isPaused ? 'Deep Focus • Active' : isPaused ? 'Paused' : 'Ready'}
            </span>
          </div>

          {/* Controls Strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="btn-primary"
                style={{ padding: '0.9rem 2.2rem', fontSize: '1.05rem', borderRadius: '16px' }}
              >
                <Play size={20} />
                <span>Start Session</span>
              </button>
            ) : isPaused ? (
              <button
                onClick={handleResume}
                className="btn-primary"
                style={{ padding: '0.9rem 2rem', fontSize: '1.05rem', borderRadius: '16px' }}
              >
                <Play size={20} />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="btn-secondary"
                style={{ padding: '0.9rem 1.8rem', fontSize: '1.05rem', borderRadius: '16px' }}
              >
                <Pause size={20} />
                <span>Pause</span>
              </button>
            )}

            {isRunning && (
              <button
                onClick={handleFinishPrompt}
                style={{
                  padding: '0.9rem 1.8rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                }}
              >
                <CheckCircle2 size={18} />
                <span>Finish Session</span>
              </button>
            )}

            <button
              onClick={handleReset}
              disabled={!isRunning && secondsRemaining === targetMinutes * 60}
              className="btn-secondary"
              style={{
                padding: '0.9rem 1.1rem',
                borderRadius: '16px',
                opacity: !isRunning && secondsRemaining === targetMinutes * 60 ? 0.4 : 1,
              }}
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <div
            style={{
              marginTop: '2rem',
              padding: '0.85rem 1.25rem',
              background: '#f8fafc',
              borderRadius: '14px',
              fontSize: '0.82rem',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Sparkles size={16} color="#d97706" />
            <span>{focusQuote}</span>
          </div>
        </div>
      </div>

      {/* Confidence Rating & Session Completion Modal */}
      {showFinishModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                <Brain size={22} color="#0284c7" />
                <span>Session Finished! Rate Confidence</span>
              </h2>
            </div>

            <div style={{ textAlign: 'center', margin: '1rem 0 1.5rem' }}>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                How confident are you about <strong>{topic}</strong>?
              </p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                This is saved to MongoDB and directly drives your Weak Areas & Exam Readiness.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {CONFIDENCE_LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => setConfidence(lvl.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.8rem 1.1rem',
                    borderRadius: '14px',
                    border: confidence === lvl.value ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    background: confidence === lvl.value ? '#f0f9ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{lvl.emoji}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                        {lvl.value} — {lvl.label}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{lvl.desc}</div>
                    </div>
                  </div>
                  {confidence === lvl.value && <CheckCircle2 size={18} color="#0284c7" />}
                </button>
              ))}
            </div>

            {linkedPlanId && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={completeLinkedPlan}
                  onChange={(e) => setCompleteLinkedPlan(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#0284c7' }}
                />
                <span>Mark linked study plan as Completed 🎉</span>
              </label>
            )}

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowFinishModal(false)}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Back to Session
              </button>
              <button
                type="button"
                onClick={handleSaveSession}
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save & Record Score'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusModePage;
