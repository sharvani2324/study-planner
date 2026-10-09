import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  BookOpen,
  Zap,
} from 'lucide-react';
import {
  SUBJECT_EMOJIS,
  SUBJECT_COLORS,
  getSubjectLabel,
  getSubjectFullName,
  CORE_SUBJECTS_LIST
} from '../utils/subjectConstants';

export const SchedulePage = ({ plans = [], onSelectPlan, onOpenAddModal, onAutoPopulateWeekend }) => {
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());

  // Date helpers
  const formatDateISO = (d) => d.toISOString().split('T')[0];

  // Helper to calculate End Time from Start Time and Duration (in minutes)
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

  const handlePrev = () => {
    const nextD = new Date(currentDate);
    if (viewMode === 'day') nextD.setDate(nextD.getDate() - 1);
    else if (viewMode === 'week') nextD.setDate(nextD.getDate() - 7);
    else nextD.setMonth(nextD.getMonth() - 1);
    setCurrentDate(nextD);
  };

  const handleNext = () => {
    const nextD = new Date(currentDate);
    if (viewMode === 'day') nextD.setDate(nextD.getDate() + 1);
    else if (viewMode === 'week') nextD.setDate(nextD.getDate() + 7);
    else nextD.setMonth(nextD.getMonth() + 1);
    setCurrentDate(nextD);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Week Days Generator (Monday first)
  const getWeekDates = () => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    const monday = new Date(d.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      week.push(dayDate);
    }
    return week;
  };

  // Month Days Generator
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
    for (let i = startDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }

    return days;
  };

  const currentMonthTitle = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const weekDates = getWeekDates();
  const satDateStr = formatDateISO(weekDates[5]);
  const sunDateStr = formatDateISO(weekDates[6]);
  const weekendPlansCount = plans.filter((p) => p.date === satDateStr || p.date === sunDateStr).length;

  return (
    <div className="page-container page-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Calendar Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            Schedule & Calendar 📅
          </h1>
          <p style={{ color: '#475569', fontSize: '1rem', marginTop: '0.2rem', fontWeight: 600 }}>
            Structured timeline of your academic sessions across all 8 core subjects
          </p>
        </div>

        {/* Action buttons & View Switcher Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Quick weekend auto-fill helper button */}
          {weekendPlansCount === 0 && onAutoPopulateWeekend && (
            <button
              onClick={onAutoPopulateWeekend}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.1rem',
                borderRadius: '12px',
                background: '#fef3c7',
                border: '1.5px solid #f59e0b',
                color: '#9a3412',
                fontWeight: 700,
                fontSize: '0.88rem'
              }}
              title="Populate realistic Saturday and Sunday study routines"
            >
              <Sparkles size={16} color="#d97706" />
              <span>✨ Populate Weekend Plans</span>
            </button>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              padding: '4px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {['day', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  textTransform: 'capitalize',
                  background: viewMode === mode ? '#0284c7' : 'transparent',
                  color: viewMode === mode ? 'white' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                {mode} View
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handlePrev}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.75rem', borderRadius: '10px', fontWeight: 700 }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleToday}
            className="btn-secondary"
            style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', fontWeight: 700 }}
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.75rem', borderRadius: '10px', fontWeight: 700 }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          {viewMode === 'day'
            ? currentDate.toLocaleDateString('default', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : currentMonthTitle}
        </h3>

        <button
          onClick={onOpenAddModal}
          className="btn-primary"
          style={{ padding: '0.65rem 1.3rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.92rem' }}
        >
          <PlusCircle size={17} />
          <span>＋ Plan Session</span>
        </button>
      </div>

      {/* 1. DAY VIEW */}
      {viewMode === 'day' && (
        <div
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {(() => {
            const dateStr = formatDateISO(currentDate);
            const dayPlans = plans.filter((p) => p.date === dateStr);

            if (dayPlans.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>☕</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>No sessions planned for this day</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '420px', margin: '0.35rem auto 1.5rem' }}>
                    Take a well-deserved rest or add a structured revision block to stay ahead.
                  </p>
                  <button
                    onClick={onOpenAddModal}
                    className="btn-primary"
                    style={{ padding: '0.8rem 1.6rem', borderRadius: '12px', fontWeight: 800 }}
                  >
                    + Schedule Session Now
                  </button>
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dayPlans.map((plan) => {
                  const label = getSubjectLabel(plan.subject);
                  const icon = SUBJECT_EMOJIS[plan.subject] || '📚';
                  const color = SUBJECT_COLORS[plan.subject] || '#0284c7';
                  const timeRange = formatSessionTime(plan.time, plan.estimatedMinutes);

                  return (
                    <div
                      key={plan._id}
                      onClick={() => onSelectPlan(plan)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.3rem 1.6rem',
                        borderRadius: '16px',
                        border: '1.5px solid #e2e8f0',
                        background: plan.status === 'Completed' ? '#f0fdf4' : '#fafafa',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                        {/* Time with Start & End Duration */}
                        <div
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            color: '#0284c7',
                            minWidth: '150px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                          }}
                        >
                          <Clock size={18} />
                          <span>{timeRange}</span>
                        </div>

                        {/* Subject Badge */}
                        <span
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '8px',
                            background: `${color}15`,
                            color: color,
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            border: `1.5px solid ${color}40`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <span>{icon}</span>
                          <span>{label}</span>
                        </span>

                        <div>
                          <h4
                            style={{
                              fontSize: '1.1rem',
                              fontWeight: 800,
                              color: plan.status === 'Completed' ? '#15803d' : '#0f172a',
                              textDecoration: plan.status === 'Completed' ? 'line-through' : 'none',
                              margin: 0
                            }}
                          >
                            {plan.topic}
                          </h4>
                          {plan.notes && (
                            <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '0.25rem', margin: 0, fontWeight: 500 }}>
                              {plan.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`badge-priority priority-${plan.priority}`} style={{ fontWeight: 700 }}>
                          {plan.priority} Priority
                        </span>
                        <span className={`badge-status status-${plan.status}`} style={{ fontWeight: 800 }}>
                          {plan.status === 'Completed' ? '✅ Completed' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* 2. WEEK VIEW (Properly arranged 7 equal columns) */}
      {viewMode === 'week' && (
        <div
          style={{
            width: '100%',
            overflowX: 'auto',
            paddingBottom: '12px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(135px, 1fr))',
              gap: '12px',
              minWidth: '980px',
              width: '100%',
            }}
          >
            {weekDates.map((d, index) => {
              const dateStr = formatDateISO(d);
              const isToday = dateStr === formatDateISO(new Date());
              const dayPlans = plans.filter((p) => p.date === dateStr);
              const isWeekend = index === 5 || index === 6; // Saturday (5), Sunday (6)

              return (
                <div
                  key={dateStr}
                  style={{
                    background: isToday ? '#f0f9ff' : isWeekend ? '#fffdfa' : 'white',
                    border: isToday ? '2.5px solid #0284c7' : isWeekend ? '1.5px solid #fed7aa' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.1rem 0.85rem',
                    minHeight: '520px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-sm)',
                    minWidth: 0,
                    boxSizing: 'border-box',
                  }}
                >
                {/* Day Header */}
                <div style={{ textAlign: 'center', marginBottom: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isToday ? '#0284c7' : isWeekend ? '#ea580c' : '#64748b', textTransform: 'uppercase' }}>
                    {d.toLocaleDateString('default', { weekday: 'short' })}
                  </div>
                  <div
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: isToday ? '#0284c7' : '#0f172a',
                      marginTop: '0.15rem',
                    }}
                  >
                    {d.getDate()}
                  </div>
                  {isWeekend && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#c2410c', background: '#ffedd5', padding: '1px 6px', borderRadius: '4px' }}>
                      Weekend
                    </span>
                  )}
                </div>

                {/* Day Plans */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                  {dayPlans.map((plan) => {
                    const label = getSubjectLabel(plan.subject);
                    const icon = SUBJECT_EMOJIS[plan.subject] || '📚';
                    const color = SUBJECT_COLORS[plan.subject] || '#0284c7';
                    const timeRange = formatSessionTime(plan.time, plan.estimatedMinutes);

                    return (
                      <div
                        key={plan._id}
                        onClick={() => onSelectPlan(plan)}
                        style={{
                          padding: '0.75rem 0.7rem',
                          borderRadius: '12px',
                          border: plan.status === 'Completed' ? '1px solid #86efac' : '1px solid #e2e8f0',
                          background: plan.status === 'Completed' ? '#f0fdf4' : '#ffffff',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                          cursor: 'pointer',
                          transition: 'transform 0.1s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.74rem' }}>
                            {timeRange}
                          </span>
                          <span style={{ fontSize: '0.85rem' }}>
                            {icon}
                          </span>
                        </div>

                        <div style={{ marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: color }}>
                            {label}
                          </span>
                        </div>

                        <div
                          style={{
                            fontWeight: 700,
                            color: '#0f172a',
                            lineHeight: 1.3,
                            fontSize: '0.82rem',
                            textDecoration: plan.status === 'Completed' ? 'line-through' : 'none',
                          }}
                        >
                          {plan.topic}
                        </div>
                      </div>
                    );
                  })}

                  {dayPlans.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem', marginTop: '2.5rem', fontWeight: 500 }}>
                      No sessions scheduled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* 3. MONTH VIEW (Properly arranged 7 equal columns) */}
      {viewMode === 'month' && (
        <div
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            overflowX: 'auto',
          }}
        >
          <div style={{ minWidth: '720px', width: '100%' }}>
            {/* Weekday Labels */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.88rem',
                color: '#475569',
                marginBottom: '0.85rem',
              }}
            >
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div key={day} style={{ padding: '0.5rem 0', color: idx >= 5 ? '#ea580c' : '#475569' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Month Days Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: '8px',
              }}
            >
              {getMonthDays().map((item, index) => {
                const dateStr = formatDateISO(item.date);
                const isToday = dateStr === formatDateISO(new Date());
                const dayPlans = plans.filter((p) => p.date === dateStr);

                return (
                  <div
                    key={index}
                    style={{
                      minHeight: '105px',
                      padding: '8px',
                      borderRadius: '12px',
                      background: isToday ? '#f0f9ff' : item.isCurrentMonth ? '#ffffff' : '#f8fafc',
                      border: isToday ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      opacity: item.isCurrentMonth ? 1 : 0.45,
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        color: isToday ? '#0284c7' : '#0f172a',
                        marginBottom: '4px',
                      }}
                    >
                      {item.date.getDate()}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflowY: 'auto' }}>
                      {dayPlans.slice(0, 2).map((plan) => (
                        <div
                          key={plan._id}
                          onClick={() => onSelectPlan(plan)}
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            background: plan.status === 'Completed' ? '#dcfce7' : '#e0f2fe',
                            color: plan.status === 'Completed' ? '#15803d' : '#0369a1',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            cursor: 'pointer',
                          }}
                          title={`${plan.subject}: ${plan.topic}`}
                        >
                          {SUBJECT_EMOJIS[plan.subject] || '📚'} {plan.topic}
                        </div>
                      ))}
                      {dayPlans.length > 2 && (
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800 }}>
                          +{dayPlans.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
