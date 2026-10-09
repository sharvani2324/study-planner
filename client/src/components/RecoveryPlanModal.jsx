import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { SUBJECT_COLORS, SUBJECT_EMOJIS } from '../utils/subjectConstants';

const RecoveryPlanModal = ({ isOpen, onClose, onPlanApplied, showToast }) => {
  const [loading, setLoading] = useState(true);
  const [missedCount, setMissedCount] = useState(0);
  const [suggestedPlan, setSuggestedPlan] = useState([]);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRecoveryData();
    }
  }, [isOpen]);

  const fetchRecoveryData = async () => {
    setLoading(true);
    try {
      const res = await api.getRecoveryPlan();
      if (res.data?.success || res.success) {
        const count = res.data?.missedCount || res.data?.count || res.missedCount || res.count || 0;
        const rawList = res.data?.suggestedPlan || res.data?.suggestions || res.suggestedPlan || res.suggestions || [];
        const formatted = rawList.map(s => ({
          ...s,
          title: s.title || s.topic,
          oldDate: s.oldDate || s.originalDate,
          newDate: s.newDate,
          newTime: s.newTime || s.originalTime || '10:00',
        }));
        setMissedCount(count);
        setSuggestedPlan(formatted);
      }
    } catch (err) {
      console.error('Error fetching recovery plan:', err);
      if (showToast) showToast('Failed to load recovery suggestions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (planId, newDate) => {
    setSuggestedPlan(prev =>
      prev.map(item => item.planId === planId ? { ...item, newDate } : item)
    );
  };

  const handleAcceptPlan = async () => {
    if (suggestedPlan.length === 0) return;
    setApplying(true);
    try {
      const items = suggestedPlan.map(item => ({
        planId: item.planId,
        newDate: item.newDate,
        newTime: item.newTime || '10:00'
      }));

      const res = await api.applyRecoveryPlan({ items, changes: items });
      if (res.data?.success || res.success) {
        const count = res.data?.updated || res.data?.updatedCount || items.length;
        if (showToast) showToast(`Rescheduled ${count} missed task${count > 1 ? 's' : ''}! Let's get back on track 💪`, 'success');
        if (onPlanApplied) onPlanApplied();
        onClose();
      }
    } catch (err) {
      console.error('Error applying recovery plan:', err);
      if (showToast) showToast('Failed to apply recovery schedule', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100,
        padding: '20px'
      }}
    >
      <div
        className="card page-fade-in"
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '28px',
          borderRadius: '20px',
          background: 'var(--card-bg, #0f172a)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2rem', background: 'rgba(239, 68, 68, 0.15)', padding: '8px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              🩹
            </span>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 4px 0', color: '#f8fafc' }}>
                Smart Study Recovery Plan
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>
                Rebalance missed deadlines evenly without academic burnout
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary, #94a3b8)', fontSize: '1.4rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #94a3b8)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
            <p>Analyzing missed tasks and balancing workload...</p>
          </div>
        ) : missedCount === 0 || suggestedPlan.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '14px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#4ade80' }}>All Caught Up!</h3>
            <p style={{ color: 'var(--text-secondary, #94a3b8)', margin: 0, fontSize: '0.9rem' }}>
              You have no overdue study plans right now. Keep maintaining this awesome streak!
            </p>
            <button onClick={onClose} className="btn btn-primary" style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '8px' }}>
              Awesome, Close
            </button>
          </div>
        ) : (
          <div>
            {/* Alert banner */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#fca5a5', lineHeight: 1.4 }}>
                You have <strong>{missedCount} overdue task{missedCount > 1 ? 's' : ''}</strong>. We've distributed them sensibly across upcoming days so you don't cram.
              </p>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Suggested Rescheduling Preview
            </h4>

            {/* List of suggested items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {suggestedPlan.map((item) => {
                const subColor = SUBJECT_COLORS[item.subject] || '#3b82f6';
                return (
                  <div
                    key={item.planId}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color, #334155)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: `${subColor}20`,
                            color: subColor
                          }}
                        >
                          {SUBJECT_EMOJIS[item.subject] || '📚'} {item.subject}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#f87171' }}>
                          Was due: {item.oldDate}
                        </span>
                      </div>
                      <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                        {item.title}
                      </h5>
                    </div>

                    {/* New date picker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600 }}>
                        Move to ➡️
                      </span>
                      <input
                        type="date"
                        value={item.newDate}
                        onChange={(e) => handleDateChange(item.planId, e.target.value)}
                        className="input-field"
                        style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ padding: '10px 20px', borderRadius: '10px' }}
              >
                Cancel / Keep As Is
              </button>

              <button
                type="button"
                onClick={handleAcceptPlan}
                disabled={applying}
                className="btn btn-primary"
                style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {applying ? (
                  <>
                    <div className="spinner-small"></div>
                    <span>Applying Changes...</span>
                  </>
                ) : (
                  <>
                    <span>✅</span> Accept Recovery Plan
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoveryPlanModal;
