import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Sparkles } from 'lucide-react';
import { SUBJECTS_CONFIG, getTodayDateStr } from '../utils/subjectConstants';

export const StudyPlanModal = ({ isOpen, onClose, onSubmit, initialPlan = null, isSubmitting = false }) => {
  const getDefaultTimeStr = () => {
    const d = new Date();
    const hours = String((d.getHours() + 1) % 24).padStart(2, '0');
    return `${hours}:00`;
  };

  const [formData, setFormData] = useState({
    subject: 'DAA',
    topic: '',
    date: getTodayDateStr(),
    time: getDefaultTimeStr(),
    priority: 'Medium',
    status: 'Pending',
    estimatedMinutes: 30,
    notes: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialPlan) {
      setFormData({
        subject: initialPlan.subject || 'DAA',
        topic: initialPlan.topic || '',
        date: initialPlan.date || getTodayDateStr(),
        time: initialPlan.time || getDefaultTimeStr(),
        priority: initialPlan.priority || 'Medium',
        status: initialPlan.status || 'Pending',
        estimatedMinutes: initialPlan.estimatedMinutes || 30,
        notes: initialPlan.notes || '',
      });
    } else {
      setFormData({
        subject: 'DAA',
        topic: '',
        date: getTodayDateStr(),
        time: getDefaultTimeStr(),
        priority: 'Medium',
        status: 'Pending',
        estimatedMinutes: 30,
        notes: '',
      });
    }
    setError('');
  }, [initialPlan, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.topic.trim()) {
      setError('Please enter a study topic or chapter name.');
      return;
    }
    if (!formData.date) {
      setError('Please select a date.');
      return;
    }
    if (!formData.time) {
      setError('Please select a study time.');
      return;
    }

    const payload = {
      ...formData,
      topic: formData.topic.trim(),
      notes: formData.notes.trim(),
      estimatedMinutes: Number(formData.estimatedMinutes) || 30,
      localDate: getTodayDateStr(),
      localHour: new Date().getHours(),
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Sparkles size={22} color="#0284c7" />
            {initialPlan ? 'Edit Study Plan' : 'Add New Study Plan'}
          </h2>
          <button onClick={onClose} className="btn-modal-close">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '12px',
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Subject Dropdown */}
          <div className="form-group">
            <label className="form-label">Subject</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="form-select"
            >
              {SUBJECTS_CONFIG.map((sub) => (
                <option key={sub.value} value={sub.value}>
                  {sub.icon} {sub.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div className="form-group">
            <label className="form-label">Topic / Chapter</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g. Dynamic Programming, Normalization, SQL Joins"
              className="form-input"
              autoFocus
            />
          </div>

          {/* Date & Time */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Priority, Estimated Duration & Status */}
          <div className="form-row-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Est. Duration</label>
              <select
                name="estimatedMinutes"
                value={formData.estimatedMinutes}
                onChange={handleChange}
                className="form-select"
              >
                <option value="15">15 mins</option>
                <option value="25">25 mins</option>
                <option value="30">30 mins</option>
                <option value="45">45 mins</option>
                <option value="60">60 mins</option>
                <option value="90">90 mins</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Pending">⏳ Pending</option>
                <option value="Completed">✅ Completed</option>
              </select>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div className="form-group">
            <label className="form-label">Notes & Goals (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g., Solve 5 problems, read chapter 4 slides, prepare formula cheat-sheet"
              rows={3}
              className="form-textarea"
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting
                ? 'Saving...'
                : initialPlan
                ? 'Update Study Plan'
                : 'Create Study Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
