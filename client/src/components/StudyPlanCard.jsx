import React from 'react';
import { Calendar, Clock, CheckCircle2, Circle, Edit3, Trash2, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SUBJECT_ICONS, SUBJECT_COLORS, SUBJECT_BG, getSubjectLabel, getTodayDateStr } from '../utils/subjectConstants';

export const StudyPlanCard = ({ plan, onStatusToggle, onEdit, onDelete, onStartFocus }) => {
  const isCompleted = plan.status === 'Completed';
  const subColor = SUBJECT_COLORS[plan.subject] || '#0284c7';
  const subBg = SUBJECT_BG[plan.subject] || '#e0f2fe';

  // Calculate start time, end time, and duration
  const formatSessionTime = (startTime, durationMinutes = 45) => {
    if (!startTime) return '10:00 – 10:45 (45m)';
    try {
      const [hStr, mStr] = startTime.split(':');
      const h = parseInt(hStr, 10) || 10;
      const m = parseInt(mStr, 10) || 0;
      const dur = parseInt(durationMinutes, 10) || 45;
      const totalMins = h * 60 + m + dur;
      const endH = Math.floor(totalMins / 60) % 24;
      const endM = totalMins % 60;
      const pad = (n) => String(n).padStart(2, '0');
      return `${startTime} – ${pad(endH)}:${pad(endM)} (${dur}m)`;
    } catch {
      return `${startTime} (${durationMinutes || 45}m)`;
    }
  };

  const handleStatusClick = (e) => {
    e.stopPropagation();
    if (!isCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0284c7', '#38bdf8', '#22c55e', '#facc15', '#f97316'],
      });
    }
    onStatusToggle(plan._id, isCompleted ? 'Pending' : 'Completed', getTodayDateStr(), new Date().getHours());
  };

  const timeRange = formatSessionTime(plan.time, plan.estimatedMinutes);

  return (
    <div
      className={`study-plan-card ${isCompleted ? 'completed' : ''}`}
      style={{
        minHeight: '210px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: isCompleted ? 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)' : '#ffffff',
        border: isCompleted ? '1.5px solid #86efac' : '1.5px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <div>
        {/* Top Row: Subject Badge + Priority */}
        <div className="card-top-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span
            className="badge-subject"
            style={{
              background: subBg,
              color: subColor,
              borderColor: `${subColor}40`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 800,
              fontSize: '0.82rem',
              padding: '0.25rem 0.7rem',
              borderRadius: '999px',
              border: `1px solid ${subColor}30`
            }}
          >
            <span>{SUBJECT_ICONS[plan.subject] || '📘'}</span>
            <span>{getSubjectLabel(plan.subject)}</span>
          </span>

          <span
            className={`badge-priority priority-${plan.priority}`}
            style={{ fontWeight: 700, fontSize: '0.75rem' }}
          >
            {plan.priority} Priority
          </span>
        </div>

        {/* Topic Title */}
        <h3
          className="plan-topic"
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: isCompleted ? '#16a34a' : '#0f172a',
            textDecoration: isCompleted ? 'line-through' : 'none',
            margin: '0 0 0.65rem 0',
            lineHeight: 1.35,
            wordBreak: 'break-word'
          }}
        >
          {plan.topic}
        </h3>

        {/* Meta Row: Date + Full Start/End Time + Status */}
        <div
          className="plan-meta-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            color: '#64748b',
            fontSize: '0.82rem',
            marginBottom: '0.65rem',
            flexWrap: 'wrap'
          }}
        >
          <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} color="#64748b" />
            <span>{plan.date}</span>
          </div>
          <div
            className="meta-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#0284c7',
              fontWeight: 700
            }}
          >
            <Clock size={14} color="#0284c7" />
            <span>{timeRange}</span>
          </div>
          <span className={`badge-status status-${plan.status}`} style={{ fontWeight: 700, fontSize: '0.74rem' }}>
            {isCompleted ? '✅ Completed' : '⏳ Pending'}
          </span>
        </div>

        {/* Notes (if any) */}
        {plan.notes && (
          <div
            className="plan-notes"
            style={{
              fontSize: '0.82rem',
              color: '#475569',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.45rem 0.65rem',
              marginBottom: '0.75rem',
              maxHeight: '60px',
              overflowY: 'auto',
              lineHeight: 1.35
            }}
          >
            {plan.notes}
          </div>
        )}
      </div>

      {/* Actions Row */}
      <div
        className="card-actions-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f1f5f9'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleStatusClick}
            className={`btn-status-toggle ${isCompleted ? 'is-completed' : 'mark-complete'}`}
            title={isCompleted ? 'Click to mark as Pending' : 'Click to mark as Completed'}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={14} /> Completed
              </>
            ) : (
              <>
                <Circle size={14} /> Mark Complete
              </>
            )}
          </button>

          {!isCompleted && onStartFocus && (
            <button
              onClick={() => onStartFocus(plan)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.45rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: '8px',
                background: '#e0f2fe',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                cursor: 'pointer',
              }}
              title="Start Focus Session on this topic"
            >
              <Timer size={14} /> Focus
            </button>
          )}
        </div>

        <div className="card-icon-btns" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => onEdit(plan)}
            className="btn-icon-action edit"
            title="Edit Study Plan"
            style={{ padding: '6px', borderRadius: '6px' }}
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => onDelete(plan._id)}
            className="btn-icon-action delete"
            title="Delete Study Plan"
            style={{ padding: '6px', borderRadius: '6px' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanCard;
