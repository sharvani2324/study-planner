import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { ALLOWED_SUBJECTS, SUBJECT_COLORS, SUBJECT_EMOJIS } from '../utils/subjectConstants';

const ExamsPage = ({ onNavigate, onSelectSubject, showToast }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    subject: 'DAA',
    date: '',
    totalTopics: 10,
    topicsText: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.getExams();
      if (res.data && res.data.success) {
        setExams(res.data.exams || []);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      if (showToast) showToast('Failed to load exams', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingExam(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 14);
    const defaultDate = tomorrow.toISOString().split('T')[0];

    setFormData({
      name: '',
      subject: 'DAA',
      date: defaultDate,
      totalTopics: 8,
      topicsText: '',
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    const formattedDate = exam.date ? new Date(exam.date).toISOString().split('T')[0] : '';
    setFormData({
      name: exam.name || '',
      subject: exam.subject || 'DAA',
      date: formattedDate,
      totalTopics: exam.totalTopics || 1,
      topicsText: Array.isArray(exam.topics) ? exam.topics.join('\n') : '',
      notes: exam.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      if (showToast) showToast('Please enter an exam title', 'error');
      return;
    }
    if (!formData.date) {
      if (showToast) showToast('Please select an exam date', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        subject: formData.subject,
        date: formData.date,
        totalTopics: Number(formData.totalTopics) || 1,
        topics: formData.topicsText.split('\n').map(t => t.trim()).filter(Boolean),
        notes: formData.notes.trim()
      };

      if (editingExam) {
        await api.updateExam(editingExam._id, payload);
        if (showToast) showToast('Exam updated successfully!', 'success');
      } else {
        await api.createExam(payload);
        if (showToast) showToast('New exam target added!', 'success');
      }

      setShowModal(false);
      fetchExams();
    } catch (err) {
      console.error('Error saving exam:', err);
      if (showToast) showToast(err.response?.data?.message || 'Failed to save exam', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await api.deleteExam(id);
      if (showToast) showToast('Exam deleted', 'success');
      setExams(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      console.error('Error deleting exam:', err);
      if (showToast) showToast('Failed to delete exam', 'error');
    }
  };

  const handlePracticeExam = (exam) => {
    if (onSelectSubject) onSelectSubject(exam.subject);
    if (onNavigate) onNavigate('quiz', { subject: exam.subject });
  };

  return (
    <div className="exams-page-container page-fade-in" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⏳</span> Exam Countdown & Readiness
          </h1>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
            Stay ahead of test deadlines with live countdowns and intelligent preparation tracking
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px' }}
        >
          <span>➕</span> Add New Exam Target
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary, #94a3b8)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
          <p>Loading exam targets and prep status...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center', borderRadius: '16px', background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎯</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, margin: '0 0 8px 0' }}>No Upcoming Exams Scheduled</h2>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', maxWidth: '460px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
            Add your upcoming midterms, finals, lab tests, or certification exams to track your preparation readiness in real time.
          </p>
          <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '10px' }}>
            + Add Your First Exam Target
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {exams.map((exam) => {
            const subColor = SUBJECT_COLORS[exam.subject] || '#3b82f6';
            const daysLeft = exam.daysLeft;
            const prepPercent = exam.preparationPercent || 0;
            const examDateFormatted = exam.date ? new Date(exam.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) : 'No Date';

            // Status badge color
            let badgeBg = 'rgba(59, 130, 246, 0.15)';
            let badgeColor = '#60a5fa';
            let badgeText = `${daysLeft} days left`;

            if (daysLeft < 0) {
              badgeBg = 'rgba(148, 163, 184, 0.15)';
              badgeColor = '#94a3b8';
              badgeText = 'Past Exam';
            } else if (daysLeft === 0) {
              badgeBg = 'rgba(239, 68, 68, 0.2)';
              badgeColor = '#f87171';
              badgeText = 'TODAY! 🔥';
            } else if (daysLeft <= 3) {
              badgeBg = 'rgba(239, 68, 68, 0.15)';
              badgeColor = '#f87171';
              badgeText = `⚠️ ${daysLeft} days left`;
            } else if (daysLeft <= 7) {
              badgeBg = 'rgba(245, 158, 11, 0.15)';
              badgeColor = '#fbbf24';
              badgeText = `⚡ ${daysLeft} days left`;
            }

            return (
              <div
                key={exam._id}
                className="card card-hover"
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'var(--card-bg, #0f172a)',
                  border: `1px solid ${daysLeft <= 3 && daysLeft >= 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color, #334155)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top subject and badge row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: `${subColor}20`,
                        color: subColor,
                        border: `1px solid ${subColor}40`
                      }}
                    >
                      {SUBJECT_EMOJIS[exam.subject] || '📚'} {exam.subject}
                    </span>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: badgeBg,
                        color: badgeColor,
                        border: `1px solid ${badgeColor}30`
                      }}
                    >
                      {badgeText}
                    </span>
                  </div>

                  {/* Title & Date */}
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px 0', color: '#f8fafc' }}>
                    {exam.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📅 {examDateFormatted}</span>
                  </div>

                  {/* Preparation progress bar */}
                  <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary, #94a3b8)' }}>Preparation Readiness</span>
                      <strong style={{ color: prepPercent >= 80 ? '#4ade80' : prepPercent >= 50 ? '#fbbf24' : '#60a5fa' }}>
                        {prepPercent}%
                      </strong>
                    </div>

                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${prepPercent}%`,
                          background: prepPercent >= 80 ? 'linear-gradient(90deg, #22c55e, #10b981)' : prepPercent >= 50 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '8px' }}>
                      <span>Completed: <strong style={{ color: '#fff' }}>{exam.completedTopicsCount || 0}</strong></span>
                      <span>Target: <strong style={{ color: '#fff' }}>{exam.totalTopics || 0} topics</strong></span>
                    </div>
                  </div>

                  {/* Notes / Topics summary */}
                  {exam.notes && (
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 16px 0', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px' }}>
                      "{exam.notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handlePracticeExam(exam)}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                  >
                    <span>⚡</span> Practice Quiz
                  </button>

                  <button
                    onClick={() => openEditModal(exam)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px' }}
                    title="Edit Exam"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => handleDelete(exam._id, exam.name)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', color: '#f87171' }}
                    title="Delete Exam"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Exam Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            className="modal-card page-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '24px 28px',
              borderRadius: '20px',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.2)',
              maxHeight: '85vh',
              overflowY: 'auto',
              margin: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {editingExam ? '✏️ Edit Exam Target' : '➕ Add New Exam Target'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.3rem', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Exam Name */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DAA Midterm Exam, DBMS Final Lab..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Subject */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  {ALLOWED_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>
                      {SUBJECT_EMOJIS[sub]} {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Total Topics in a 2-col row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      color: '#0f172a',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Total Target Topics
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.totalTopics}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalTopics: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      color: '#0f172a',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Topics list (Optional) */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Syllabus Topics (One per line, optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g.&#10;Greedy Algorithms&#10;Dynamic Programming&#10;Backtracking"
                  value={formData.topicsText}
                  onChange={(e) => setFormData(prev => ({ ...prev, topicsText: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a',
                    fontWeight: 500,
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Target Goal / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aiming for 90%+, focus on code problems"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a',
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ padding: '10px 22px', borderRadius: '10px', fontWeight: 800 }}
                >
                  {submitting ? 'Saving...' : editingExam ? 'Save Changes' : 'Add Exam Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;
