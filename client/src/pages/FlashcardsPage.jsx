import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { ALLOWED_SUBJECTS, SUBJECT_COLORS, SUBJECT_EMOJIS } from '../utils/subjectConstants';

const FlashcardsPage = ({ initialSubject = '', initialTopic = '', onNavigate, showToast }) => {
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || 'DAA');
  const [customTopic, setCustomTopic] = useState(initialTopic || '');
  const [count, setCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, gotIt: 0 });
  const [source, setSource] = useState('');
  
  // Difficult cards tab
  const [activeTab, setActiveTab] = useState('practice'); // 'practice' | 'difficult'
  const [difficultCards, setDifficultCards] = useState([]);
  const [loadingDifficult, setLoadingDifficult] = useState(false);

  useEffect(() => {
    if (initialSubject) setSelectedSubject(initialSubject);
    if (initialTopic) setCustomTopic(initialTopic);
  }, [initialSubject, initialTopic]);

  useEffect(() => {
    if (activeTab === 'difficult') {
      fetchDifficultCards();
    }
  }, [activeTab]);

  const fetchDifficultCards = async () => {
    setLoadingDifficult(true);
    try {
      const res = await api.getDifficultFlashcards();
      if (res.data?.success || res.success) {
        const diffList = res.data?.difficult || res.data?.difficultCards || res.difficult || res.difficultCards || [];
        setDifficultCards(diffList);
      }
    } catch (err) {
      console.error('Failed to load difficult cards:', err);
      if (showToast) showToast('Failed to load difficult cards', 'error');
    } finally {
      setLoadingDifficult(false);
    }
  };

  const generateFlashcards = async () => {
    setLoading(true);
    setIsFlipped(false);
    setCurrentIndex(0);
    setSessionCompleted(false);
    setSessionStats({ again: 0, gotIt: 0 });

    try {
      const res = await api.generateFlashcards({
        subject: selectedSubject,
        topic: customTopic.trim() || undefined,
        count: Number(count) || 6
      });

      if (res.data?.success || res.success) {
        const cardsList = res.data?.cards || res.data?.flashcards || res.cards || res.flashcards || [];
        setFlashcards(cardsList);
        setSource(res.data?.source || res.source || 'bank');
        if (showToast) showToast(`Loaded ${cardsList.length} flashcards!`, 'success');
      }
    } catch (err) {
      console.error('Error generating flashcards:', err);
      if (showToast) showToast(err.response?.data?.message || err.message || 'Failed to generate flashcards', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startDifficultReview = () => {
    if (difficultCards.length === 0) return;
    setFlashcards(difficultCards.map(c => ({
      front: c.front,
      back: c.back,
      topic: c.topic,
      subject: c.subject
    })));
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setSessionStats({ again: 0, gotIt: 0 });
    setActiveTab('practice');
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleReview = async (result) => {
    if (flashcards.length === 0) return;
    const currentCard = flashcards[currentIndex];

    // Update stats
    setSessionStats(prev => ({
      ...prev,
      [result === 'again' ? 'again' : 'gotIt']: prev[result === 'again' ? 'again' : 'gotIt'] + 1
    }));

    // Record review in MongoDB
    try {
      await api.recordFlashcardReview({
        subject: currentCard.subject || selectedSubject,
        topic: currentCard.topic || customTopic || 'General',
        front: currentCard.front,
        back: currentCard.back,
        result
      });
    } catch (err) {
      console.error('Failed to record review:', err);
    }

    // Move to next card
    if (currentIndex + 1 < flashcards.length) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 150);
    } else {
      setSessionCompleted(true);
      if (showToast) showToast('Flashcard session complete! +15 XP', 'success');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTab !== 'practice' || flashcards.length === 0 || sessionCompleted) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowLeft' && isFlipped) {
        e.preventDefault();
        handleReview('again');
      } else if (e.code === 'ArrowRight' && isFlipped) {
        e.preventDefault();
        handleReview('got_it');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, flashcards, isFlipped, sessionCompleted, currentIndex]);

  const currentCard = flashcards[currentIndex];
  const progressPercent = flashcards.length > 0 ? Math.round(((currentIndex + (sessionCompleted ? 1 : 0)) / flashcards.length) * 100) : 0;

  return (
    <div className="flashcards-container page-fade-in" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📇</span> AI Flashcards
          </h1>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
            Master core definitions, algorithms, and concepts with active recall & spaced repetition
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary, #1e293b)', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('practice')}
            className={`btn ${activeTab === 'practice' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.875rem', padding: '8px 16px', borderRadius: '8px' }}
          >
            ⚡ Practice Deck
          </button>
          <button
            onClick={() => setActiveTab('difficult')}
            className={`btn ${activeTab === 'difficult' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.875rem', padding: '8px 16px', borderRadius: '8px' }}
          >
            🔥 Difficult Cards {difficultCards.length > 0 && `(${difficultCards.length})`}
          </button>
        </div>
      </div>

      {activeTab === 'difficult' ? (
        /* Difficult Cards Tab */
        <div className="card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 4px 0' }}>Cards Marked for Review</h2>
              <p style={{ color: 'var(--text-secondary, #94a3b8)', margin: 0, fontSize: '0.875rem' }}>
                Cards you marked as "Again" during previous study sessions
              </p>
            </div>
            {difficultCards.length > 0 && (
              <button onClick={startDifficultReview} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚡</span> Practice All Difficult Cards ({difficultCards.length})
              </button>
            )}
          </div>

          {loadingDifficult ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #94a3b8)' }}>
              <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
              <p>Loading difficult cards from MongoDB...</p>
            </div>
          ) : difficultCards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-color, #334155)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>No Difficult Cards Right Now!</h3>
              <p style={{ color: 'var(--text-secondary, #94a3b8)', maxWidth: '460px', margin: '0 auto 20px auto', fontSize: '0.875rem' }}>
                Every card you've reviewed so far was marked "Got It". Keep up the great work or generate a new practice deck!
              </p>
              <button onClick={() => setActiveTab('practice')} className="btn btn-primary">
                Create Practice Deck
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {difficultCards.map((card, idx) => {
                const subColor = SUBJECT_COLORS[card.subject] || '#3b82f6';
                return (
                  <div
                    key={card._id || idx}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color, #334155)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: `${subColor}20`, color: subColor, border: `1px solid ${subColor}40` }}>
                          {SUBJECT_EMOJIS[card.subject] || '📚'} {card.subject}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>
                          Reviewed: {card.againCount}x again
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 600 }}>{card.front}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.4' }}>
                        {card.back}
                      </p>
                    </div>
                    {card.topic && (
                      <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                        Topic: <strong style={{ color: '#fff' }}>{card.topic}</strong>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Practice Deck Tab */
        <div style={{ display: 'grid', gridTemplateColumns: flashcards.length === 0 ? '1fr' : '320px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Deck Configuration Card */}
          <div
            className="card"
            style={{
              padding: '22px',
              borderRadius: '16px',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚙️</span> Deck Settings
              </h3>
              {flashcards.length > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '3px 8px', borderRadius: '6px' }}>
                  {flashcards.length} Cards
                </span>
              )}
            </div>

            {/* Subject Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  outline: 'none',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                <option value="All Subjects">🌟 All Subjects (Combined Deck)</option>
                {ALLOWED_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {SUBJECT_EMOJIS[sub]} {sub}
                  </option>
                ))}
              </select>

              {/* Quick Subject Chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedSubject('All Subjects')}
                  style={{
                    gridColumn: 'span 2',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: selectedSubject === 'All Subjects' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    background: selectedSubject === 'All Subjects' ? '#e0f2fe' : '#f8fafc',
                    color: selectedSubject === 'All Subjects' ? '#0284c7' : '#334155',
                    fontSize: '0.82rem',
                    fontWeight: selectedSubject === 'All Subjects' ? 800 : 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>🌟</span>
                  <span>All Subjects (Every Subject)</span>
                </button>
                {ALLOWED_SUBJECTS.map((sub) => {
                  const isSelected = selectedSubject === sub;
                  const color = SUBJECT_COLORS[sub] || '#0284c7';
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubject(sub)}
                      style={{
                        padding: '7px 9px',
                        borderRadius: '8px',
                        border: isSelected ? `2px solid ${color}` : '1px solid #e2e8f0',
                        background: isSelected ? `${color}15` : '#f8fafc',
                        color: isSelected ? color : '#475569',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '0.95rem' }}>{SUBJECT_EMOJIS[sub]}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Topic Filter */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Specific Topic (Optional)
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Dynamic Programming, Normalization..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Card Count */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Number of Cards
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[4, 6, 8, 12].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: count === n ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: count === n ? '#e0f2fe' : '#f8fafc',
                      color: count === n ? '#0284c7' : '#64748b',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateFlashcards}
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
              }}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Generating Deck...</span>
                </>
              ) : (
                <>
                  <span>✨</span> Generate Flashcards
                </>
              )}
            </button>
          </div>

          {/* Flashcard Active View */}
          <div>
            {flashcards.length > 0 && !sessionCompleted && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '12px 18px',
                  marginBottom: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {selectedSubject === 'All Subjects' ? '🌟' : (SUBJECT_EMOJIS[selectedSubject] || '📚')}
                  </span>
                  <div>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedSubject === 'All Subjects' ? 'All Subjects Comprehensive Deck' : `${selectedSubject} Practice Deck`}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', fontWeight: 600 }}>
                      {customTopic ? `Topic: ${customTopic}` : (selectedSubject === 'All Subjects' ? 'Questions from every syllabus subject' : 'Comprehensive Revision Bank')}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '4px 10px', borderRadius: '8px' }}>
                    Card {currentIndex + 1} of {flashcards.length}
                  </span>
                </div>
              </div>
            )}
            {flashcards.length === 0 ? (
              <div className="card" style={{ padding: '60px 24px', textAlign: 'center', borderRadius: '16px', background: '#ffffff', border: '1.5px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📇</div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>Ready to Test Your Memory?</h2>
                <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: '1.5', fontWeight: 500 }}>
                  Select a subject and generate an intelligent flashcard deck. Flip the card to test your recall, then mark whether you got it or need practice!
                </p>
                <button onClick={generateFlashcards} className="btn-primary" style={{ padding: '10px 24px', borderRadius: '12px', fontWeight: 800 }}>
                  Generate Quick Deck ({selectedSubject})
                </button>
              </div>
            ) : sessionCompleted ? (
              /* Session Completed View */
              <div className="card page-fade-in" style={{ padding: '40px 24px', textAlign: 'center', borderRadius: '16px', background: '#ffffff', border: '1.5px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎯</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>Deck Completed!</h2>
                <p style={{ color: '#64748b', margin: '0 0 24px 0', fontWeight: 600 }}>
                  Great recall session for <strong style={{ color: '#0284c7' }}>{selectedSubject}</strong>! You earned <span style={{ color: '#d97706', fontWeight: 800 }}>+15 XP</span>
                </p>

                {/* Score stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '400px', margin: '0 auto 28px auto' }}>
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4ade80' }}>{sessionStats.gotIt}</div>
                    <div style={{ fontSize: '0.85rem', color: '#86efac' }}>Got It Mastered</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f87171' }}>{sessionStats.again}</div>
                    <div style={{ fontSize: '0.85rem', color: '#fca5a5' }}>Needs Review</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button onClick={generateFlashcards} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }}>
                    🔄 Practice Again
                  </button>
                  {sessionStats.again > 0 && (
                    <button
                      onClick={() => {
                        setActiveTab('difficult');
                        fetchDifficultCards();
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '10px 20px', borderRadius: '8px' }}
                    >
                      🔥 Review Difficult Cards
                    </button>
                  )}
                  {onNavigate && (
                    <button onClick={() => onNavigate('dashboard')} className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '8px' }}>
                      Back to Dashboard
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Active Flashcard Card */
              <div>
                {/* Progress bar and counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>
                      Card {currentIndex + 1} of {flashcards.length}
                    </span>
                    {source && (
                      <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                        {source === 'gemini' ? '✨ AI Generated' : '📚 Curated Bank'}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary, #3b82f6)', fontWeight: 600 }}>
                    {progressPercent}% Complete
                  </span>
                </div>

                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>

                {/* 3D Flip Card Container */}
                <div
                  className="flashcard-scene"
                  onClick={handleFlip}
                  style={{
                    perspective: '1000px',
                    cursor: 'pointer',
                    minHeight: '320px',
                    marginBottom: '20px'
                  }}
                >
                  <div
                    className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}
                    style={{
                      position: 'relative',
                      width: '100%',
                      minHeight: '320px',
                      textAlign: 'center',
                      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    {/* Front of Card */}
                    <div
                      className="flashcard-front"
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: '16px',
                        padding: '36px 28px',
                        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                        border: '2px solid rgba(59, 130, 246, 0.3)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          QUESTION / PROMPT
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>
                          {currentCard?.subject ? `${currentCard.subject} • ` : ''}{currentCard?.topic || selectedSubject}
                        </span>
                      </div>

                      <div style={{ margin: '24px 0' }}>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 600, lineHeight: 1.4, color: '#f8fafc' }}>
                          {currentCard?.front}
                        </h3>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem' }}>
                        <span>👆 Click or press Space to reveal answer</span>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div
                      className="flashcard-back"
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: '16px',
                        padding: '36px 28px',
                        background: 'linear-gradient(145deg, #1e1e38, #0f172a)',
                        border: '2px solid rgba(139, 92, 246, 0.4)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          ANSWER & EXPLANATION
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600 }}>
                          ✓ Revealed
                        </span>
                      </div>

                      <div style={{ margin: '20px 0', textAlign: 'left', overflowY: 'auto', maxHeight: '180px' }}>
                        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#f1f5f9', whiteSpace: 'pre-wrap' }}>
                          {currentCard?.back}
                        </p>
                      </div>

                      <div style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.8rem' }}>
                        How well did you know this? Choose below:
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating / Navigation Controls */}
                {!isFlipped ? (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={handleFlip}
                      className="btn btn-primary"
                      style={{ padding: '12px 32px', fontSize: '1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>🔄</span> Show Answer
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="page-fade-in">
                    <button
                      onClick={() => handleReview('again')}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                    >
                      <span style={{ fontSize: '1.1rem' }}>❌ AGAIN</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Need more practice (Saved to review)</span>
                    </button>

                    <button
                      onClick={() => handleReview('got_it')}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        color: '#4ade80',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.25)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.15)'}
                    >
                      <span style={{ fontSize: '1.1rem' }}>✅ GOT IT</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Mastered! Keep going</span>
                    </button>
                  </div>
                )}

                {/* Keyboard Shortcuts Hint */}
                <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                  Shortcuts: <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Space</kbd> Flip card •{' '}
                  <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>←</kbd> Again •{' '}
                  <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>→</kbd> Got It
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
