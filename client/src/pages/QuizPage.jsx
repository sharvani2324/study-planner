import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Brain,
  Timer,
  AlertTriangle,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SUBJECTS_CONFIG, getTodayDateStr, getSubjectLabel, SUBJECT_ICONS } from '../utils/subjectConstants';

export const QuizPage = ({
  initialSubject = 'DAA',
  initialTopic = '',
  onStudyTopic,
  onNavigate,
  onScoreSubmitted,
  onShowToast,
  showToast,
}) => {
  const triggerToast = showToast || onShowToast;
  const triggerStudy = onStudyTopic || ((sub, top) => onNavigate && onNavigate('focus', { subject: sub, topic: top }));
  // Quiz Generator Configuration
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || 'DAA');
  const [topicInput, setTopicInput] = useState(initialTopic || '');
  const [difficulty, setDifficulty] = useState('Medium');
  const [suggestedTopics, setSuggestedTopics] = useState([]);

  // Quiz Lifecycle: 'idle' | 'generating' | 'taking' | 'submitted'
  const [quizState, setQuizState] = useState('idle');
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizSource, setQuizSource] = useState('bank');
  const [quizNote, setQuizNote] = useState('');

  // Result State
  const [quizResult, setQuizResult] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History Tab
  const [historyResults, setHistoryResults] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch syllabus/plan topics when subject changes
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const res = await api.getQuizTopics(selectedSubject);
        if (res.success && res.topics) {
          setSuggestedTopics(res.topics);
        }
      } catch (err) {
        console.warn('Could not load topics for subject:', err);
      }
    };
    loadTopics();
  }, [selectedSubject]);

  // Sync if initial params change
  useEffect(() => {
    if (initialSubject) setSelectedSubject(initialSubject);
    if (initialTopic !== undefined) setTopicInput(initialTopic);
  }, [initialSubject, initialTopic]);

  const handleGenerateQuiz = async () => {
    try {
      setQuizState('generating');
      const res = await api.generateQuiz(selectedSubject, topicInput.trim(), difficulty, 5);
      if (res.success && res.questions?.length > 0) {
        setQuestions(res.questions);
        setSelectedAnswers({});
        setCurrentQIndex(0);
        setQuizSource(res.source || 'bank');
        setQuizNote(res.note || '');
        setQuizState('taking');
        triggerToast?.(`Quiz generated with 5 questions in ${selectedSubject}! 📝`, 'success');
      } else {
        throw new Error(res.message || 'No questions generated.');
      }
    } catch (err) {
      setQuizState('idle');
      triggerToast?.(err.message || 'Failed to generate quiz.', 'error');
    }
  };

  const handleOptionSelect = (optIndex) => {
    if (quizState !== 'taking') return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQIndex]: optIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    // Check if any unanswered
    const unansweredCount = questions.length - Object.keys(selectedAnswers).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const answersArray = questions.map((_, i) => (selectedAnswers[i] !== undefined ? selectedAnswers[i] : null));

      const payload = {
        subject: selectedSubject,
        topic: topicInput.trim(),
        difficulty,
        source: quizSource,
        questions,
        answers: answersArray,
        localDate: getTodayDateStr(),
        localHour: new Date().getHours(),
      };

      const res = await api.submitQuiz(payload);
      if (res.success) {
        setQuizResult(res.result);
        setWeakTopics(res.weakTopics || []);
        setQuizState('submitted');

        if (res.result.scorePercent >= 80) {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
        triggerToast?.(`Quiz submitted! You scored ${res.result.correctCount}/${res.result.totalQuestions} 🎉`, 'success');
        if (onScoreSubmitted) {
          onScoreSubmitted();
        }
      }
    } catch (err) {
      triggerToast?.(err.message || 'Failed to submit quiz.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setQuizState('idle');
    setQuizResult(null);
    setWeakTopics([]);
    setSelectedAnswers({});
    setCurrentQIndex(0);
  };

  const loadHistory = async () => {
    try {
      const res = await api.getQuizResults();
      if (res.success) {
        setHistoryResults(res.results || []);
        setShowHistory(true);
      }
    } catch (err) {
      onShowToast?.('Could not load quiz history.', 'error');
    }
  };

  return (
    <div className="page-container">
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '1.8rem' }}>📝</span>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>
              AI Quiz Mode
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Generate 5 intelligent practice questions, test your mastery & identify weak topics
          </p>
        </div>

        <button
          onClick={showHistory ? () => setShowHistory(false) : loadHistory}
          className="btn-secondary"
          style={{ padding: '0.6rem 1rem', fontSize: '0.88rem' }}
        >
          <History size={16} />
          <span>{showHistory ? 'Back to Quiz' : 'Quiz History'}</span>
        </button>
      </div>

      {/* View: Quiz History */}
      {showHistory ? (
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border-subtle)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            Past Quiz Performance 📈
          </h3>
          {historyResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {historyResults.map((h) => (
                <div
                  key={h._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    background: '#f8fafc',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`badge-subject subject-${h.subject}`}>
                      {SUBJECT_ICONS[h.subject]} {h.subject}
                    </span>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                        {h.topic || 'General Syllabus'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {h.date} • {h.difficulty} Difficulty
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          color: h.scorePercent >= 80 ? '#16a34a' : h.scorePercent >= 60 ? '#d97706' : '#dc2626',
                        }}
                      >
                        {h.correctCount} / {h.totalQuestions} ({h.scorePercent}%)
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              No past quizzes found. Take your first quiz today!
            </div>
          )}
        </div>
      ) : quizState === 'idle' ? (
        /* Quiz Setup Form */
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border-subtle)',
            borderRadius: '24px',
            padding: '2rem 2.5rem',
            maxWidth: '750px',
            margin: '0 auto',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={22} color="#0284c7" />
            <span>Configure Your Practice Quiz</span>
          </h2>

          {/* Subject Selector */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Select Subject</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.6rem', marginTop: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setSelectedSubject('All Subjects')}
                style={{
                  gridColumn: '1 / -1',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  border: selectedSubject === 'All Subjects' || selectedSubject === 'All' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  background: selectedSubject === 'All Subjects' || selectedSubject === 'All' ? '#e0f2fe' : '#f8fafc',
                  color: selectedSubject === 'All Subjects' || selectedSubject === 'All' ? '#0284c7' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginBottom: '0.2rem',
                }}
              >
                <span>🌟</span>
                <span>All Subjects (Comprehensive Multi-Subject Quiz)</span>
              </button>
              {SUBJECTS_CONFIG.map((sub) => {
                const isSelected = selectedSubject === sub.value;
                return (
                  <button
                    key={sub.value}
                    type="button"
                    onClick={() => setSelectedSubject(sub.value)}
                    style={{
                      padding: '0.7rem 0.9rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSelected ? '#e0f2fe' : 'white',
                      color: isSelected ? '#0284c7' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic Input & Chips */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Topic / Concept (Optional for General)</label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Dynamic Programming, Normalization, Bayes Theorem, Tenses"
              className="form-input"
            />

            {/* Quick Topic Chips */}
            {suggestedTopics.length > 0 && (
              <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', alignSelf: 'center', marginRight: '0.2rem' }}>
                  Suggested:
                </span>
                {suggestedTopics.slice(0, 5).map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setTopicInput(t.name)}
                    style={{
                      padding: '0.25rem 0.65rem',
                      background: topicInput === t.name ? '#e0f2fe' : '#f1f5f9',
                      color: topicInput === t.name ? '#0284c7' : '#475569',
                      border: '1px solid #e2e8f0',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty Selector */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Difficulty Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.4rem' }}>
              {['Easy', 'Medium', 'Hard'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    border: difficulty === d ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    background: difficulty === d ? '#f0f9ff' : 'white',
                    color: difficulty === d ? '#0284c7' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerateQuiz}
            className="btn-primary"
            style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem' }}
          >
            <Sparkles size={18} />
            <span>Generate 5 Questions</span>
          </button>
        </div>
      ) : quizState === 'generating' ? (
        <LoadingSpinner message={`Generating 5 questions for ${selectedSubject}...`} />
      ) : quizState === 'taking' ? (
        /* Interactive Quiz Taking Screen */
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Quiz Top Bar */}
          <div
            style={{
              background: 'white',
              border: '1px solid var(--border-subtle)',
              borderRadius: '18px',
              padding: '1rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className={`badge-subject subject-${selectedSubject}`}>
                {SUBJECT_ICONS[selectedSubject]} {getSubjectLabel(selectedSubject)}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                {topicInput || 'Syllabus Practice'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
                Question {currentQIndex + 1} of {questions.length}
              </span>
            </div>
          </div>

          {/* Current Question Card */}
          {(() => {
            const q = questions[currentQIndex];
            const currentSelected = selectedAnswers[currentQIndex];

            return (
              <div
                style={{
                  background: 'white',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '24px',
                  padding: '2rem 2.25rem',
                  boxShadow: 'var(--shadow-md)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Topic: {q.topic || selectedSubject}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.45, marginBottom: '1.75rem' }}>
                  {q.question}
                </h3>

                {/* 4 Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = currentSelected === optIdx;
                    const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleOptionSelect(optIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem 1.25rem',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                          background: isSelected ? '#f0f9ff' : 'white',
                          color: isSelected ? '#0284c7' : '#1e293b',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: isSelected ? '#0284c7' : '#f1f5f9',
                            color: isSelected ? 'white' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            flexShrink: 0,
                          }}
                        >
                          {letter}
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? 700 : 500 }}>
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons between questions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQIndex === 0}
                    className="btn-secondary"
                    style={{ padding: '0.6rem 1.1rem', opacity: currentQIndex === 0 ? 0.4 : 1 }}
                  >
                    Previous
                  </button>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {questions.map((_, i) => (
                      <div
                        key={i}
                        onClick={() => setCurrentQIndex(i)}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: currentQIndex === i ? '#0284c7' : selectedAnswers[i] !== undefined ? '#86efac' : '#e2e8f0',
                          cursor: 'pointer',
                        }}
                        title={`Question ${i + 1}`}
                      />
                    ))}
                  </div>

                  {currentQIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="btn-primary"
                      style={{ padding: '0.6rem 1.25rem' }}
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting}
                      className="btn-primary"
                      style={{
                        padding: '0.65rem 1.4rem',
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Quiz 🎉'}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* Submitted Review Screen */
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          {/* Master Result Card */}
          <div
            style={{
              background: 'white',
              border: '1px solid var(--border-subtle)',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '2rem',
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>
              {quizResult?.scorePercent >= 80 ? '🏆' : quizResult?.scorePercent >= 60 ? '👍' : '📚'}
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              {quizResult?.correctCount} / {quizResult?.totalQuestions} Correct
            </h2>

            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: quizResult?.scorePercent >= 80 ? '#16a34a' : '#d97706', marginBottom: '1.5rem' }}>
              Score: {quizResult?.scorePercent}% • {quizResult?.scorePercent >= 80 ? 'Mastery Level!' : 'Keep Practicing'}
            </p>

            {/* Identified Weak Topic Box if any wrong answers */}
            {weakTopics.length > 0 && (
              <div
                style={{
                  background: '#fee2e2',
                  border: '1.5px solid #fca5a5',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  maxWidth: '560px',
                  margin: '0 auto 1.75rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontWeight: 800, marginBottom: '0.4rem' }}>
                  <AlertTriangle size={18} />
                  <span>Identified Weak Topic:</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7f1d1d', marginBottom: '0.75rem' }}>
                  {weakTopics[0].topic}
                </div>
                {onStudyTopic && (
                  <button
                    onClick={() => onStudyTopic(selectedSubject, weakTopics[0].topic)}
                    className="btn-primary"
                    style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
                  >
                    <BookOpen size={16} />
                    <span>Study This Topic</span>
                  </button>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleRetake} className="btn-primary" style={{ padding: '0.7rem 1.4rem' }}>
                <RotateCcw size={16} />
                <span>Take Another Quiz</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            Detailed Answers & Explanations 🔍
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {quizResult?.questions?.map((q, idx) => {
              const isCorrect = q.isCorrect;

              return (
                <div
                  key={idx}
                  style={{
                    background: 'white',
                    border: isCorrect ? '1.5px solid #86efac' : '1.5px solid #fca5a5',
                    borderRadius: '20px',
                    padding: '1.5rem 1.75rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b' }}>
                      Question {idx + 1} • {q.topic}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: isCorrect ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                    {q.question}
                  </h4>

                  {/* Options state */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {q.options.map((opt, optIdx) => {
                      const isUserSelected = q.selectedIndex === optIdx;
                      const isTheCorrectOpt = q.correctIndex === optIdx;

                      let bg = '#f8fafc';
                      let border = '#e2e8f0';
                      let textColor = '#475569';

                      if (isTheCorrectOpt) {
                        bg = '#dcfce7';
                        border = '#86efac';
                        textColor = '#15803d';
                      } else if (isUserSelected && !isCorrect) {
                        bg = '#fee2e2';
                        border = '#fca5a5';
                        textColor = '#b91c1c';
                      }

                      return (
                        <div
                          key={optIdx}
                          style={{
                            padding: '0.65rem 1rem',
                            borderRadius: '10px',
                            background: bg,
                            border: `1px solid ${border}`,
                            color: textColor,
                            fontSize: '0.88rem',
                            fontWeight: isUserSelected || isTheCorrectOpt ? 700 : 500,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{opt}</span>
                          {isTheCorrectOpt && <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>✓ Correct Answer</span>}
                          {isUserSelected && !isCorrect && <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>✗ Your Choice</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div
                      style={{
                        padding: '0.85rem 1.1rem',
                        background: '#f0f9ff',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        color: '#0369a1',
                        lineHeight: 1.5,
                      }}
                    >
                      <strong>💡 Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
