import React, { useState } from 'react';
import { Search, Filter, Plus, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { StudyPlanCard } from '../components/StudyPlanCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ALLOWED_SUBJECTS, SUBJECT_EMOJIS, SUBJECT_COLORS, normalizeSubject } from '../utils/subjectConstants';

const SUBJECTS_LIST = ['All', ...ALLOWED_SUBJECTS];
const STATUS_LIST = ['All', 'Pending', 'Completed'];

export const StudyPlansPage = ({
  plans = [],
  loading = false,
  onStatusToggle,
  onEditPlan,
  onDeletePlan,
  onOpenAddModal,
  onStartFocus,
  selectedSubject = 'All',
  setSelectedSubject,
  selectedStatus = 'All',
  setSelectedStatus,
  searchQuery = '',
  setSearchQuery,
}) => {
  // Client-side filtering in tandem with API query results for instant response
  const filteredPlans = plans.filter((plan) => {
    const planNormalizedSub = normalizeSubject(plan.subject);
    const filterNormalizedSub = normalizeSubject(selectedSubject);
    const matchesSubject = selectedSubject === 'All' || planNormalizedSub === filterNormalizedSub || plan.subject === selectedSubject;
    const matchesStatus = selectedStatus === 'All' || plan.status === selectedStatus;
    const matchesSearch =
      !searchQuery.trim() ||
      (plan.topic && plan.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (plan.subject && plan.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (plan.notes && plan.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSubject && matchesStatus && matchesSearch;
  });

  return (
    <div className="page-container page-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Top Header */}
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
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            My Study Plans 📋
          </h1>
          <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '0.2rem', fontWeight: 600 }}>
            Manage, filter, and track all your academic sessions across 8 subjects
          </p>
        </div>

        <button onClick={onOpenAddModal} className="btn-primary" style={{ padding: '0.8rem 1.4rem', fontWeight: 800 }}>
          <Plus size={18} />
          <span>＋ Add Study Plan</span>
        </button>
      </div>

      {/* Filter and Search Bar Control Strip */}
      <div
        style={{
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '18px',
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={18}
            color="#64748b"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder="Search subject or topic... (e.g. Dynamic Programming, Normalization, ACS grammar)"
            style={{
              paddingLeft: '42px',
              width: '100%',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              color: '#0f172a',
              padding: '0.65rem 1rem 0.65rem 42px',
              fontSize: '0.92rem',
              fontWeight: 600,
              outline: 'none'
            }}
          />
        </div>

        {/* Filters Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Subject Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#475569', marginRight: '0.25rem' }}>
              Subject:
            </span>
            {SUBJECTS_LIST.map((sub) => {
              const isSelected = selectedSubject === sub;
              const color = sub === 'All' ? '#0284c7' : (SUBJECT_COLORS[sub] || '#0284c7');
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject && setSelectedSubject(sub)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: isSelected ? `1.5px solid ${color}` : '1px solid #e2e8f0',
                    background: isSelected ? `${color}20` : '#f8fafc',
                    color: isSelected ? color : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {sub !== 'All' && <span>{SUBJECT_EMOJIS[sub]}</span>}
                  <span>{sub}</span>
                </button>
              );
            })}
          </div>

          {/* Status Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#475569', marginRight: '0.25rem' }}>
              Status:
            </span>
            {STATUS_LIST.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus && setSelectedStatus(status)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: selectedStatus === status ? '1.5px solid #d97706' : '1px solid #e2e8f0',
                  background: selectedStatus === status ? '#fef3c7' : '#f8fafc',
                  color: selectedStatus === status ? '#b45309' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <span style={{ fontSize: '0.92rem', color: '#475569', fontWeight: 600 }}>
          Showing <strong style={{ color: '#0284c7', fontWeight: 800 }}>{filteredPlans.length}</strong> study plan{filteredPlans.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Study Plan Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Retrieving study plans from MongoDB..." />
      ) : filteredPlans.length > 0 ? (
        <div className="plan-cards-grid">
          {filteredPlans.map((plan) => (
            <StudyPlanCard
              key={plan._id}
              plan={plan}
              onStatusToggle={onStatusToggle}
              onEdit={onEditPlan}
              onDelete={onDeletePlan}
              onStartFocus={onStartFocus}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          style={{
            background: '#ffffff',
            border: '2px dashed #cbd5e1',
            borderRadius: '20px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ fontSize: '3.5rem' }}>📚</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>No matching study plans found!</h3>
          <p style={{ color: '#64748b', maxWidth: '420px', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
            Start organizing your studies today. Schedule topics in DAA, Backend, Python, Maths, DBMS, Web Development, ACS, and PandS.
          </p>
          <button onClick={onOpenAddModal} className="btn-primary" style={{ marginTop: '0.5rem', fontWeight: 800 }}>
            <Plus size={18} />
            <span>+ Create Study Plan</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StudyPlansPage;
