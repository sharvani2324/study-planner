import React from 'react';
import {
  Calendar,
  CheckCircle,
  TrendingUp,
  Bot,
  ArrowRight,
  BookOpen,
  Sparkles,
  Award,
  Zap,
  LogIn,
  Layers,
  GraduationCap
} from 'lucide-react';

export const LandingPage = ({ onGetStarted, onLogin }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 15% 20%, rgba(56, 189, 248, 0.14), transparent 45%), radial-gradient(circle at 85% 30%, rgba(251, 146, 60, 0.14), transparent 45%), radial-gradient(circle at 50% 85%, rgba(250, 204, 21, 0.12), transparent 50%), #f8fafc',
        color: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 3rem',
          maxWidth: '1300px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontSize: '2.4rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))' }}>
            🎓
          </span>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>
              Campus
            </div>
            <div
              style={{
                fontSize: '0.76rem',
                color: '#d97706',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Remote Study Planner
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onLogin}
            className="btn-login-header"
            id="landing-header-login-btn"
            title="Log in to Campus"
          >
            <LogIn size={18} />
            <span>Login</span>
          </button>
          <button
            onClick={onGetStarted}
            className="btn-primary"
            style={{
              padding: '0.72rem 1.7rem',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
            }}
          >
            <span>Get Started Free</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main
        style={{
          flex: 1,
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '2.5rem 2rem 5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.45rem 1.25rem',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #fef3c7 100%)',
            border: '1.5px solid #bae6fd',
            fontSize: '0.88rem',
            fontWeight: 800,
            color: '#0369a1',
            marginBottom: '1.75rem',
            boxShadow: '0 2px 10px rgba(2, 132, 199, 0.12)',
          }}
        >
          <Sparkles size={17} color="#d97706" />
          <span>Campus • The Smart Remote Study Planner</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.3rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            maxWidth: '960px',
            letterSpacing: '-0.03em',
            color: '#0f172a'
          }}
        >
          Plan Smart. Study Better.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #ea580c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Achieve Academic Excellence with Campus.
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.28rem)',
            color: '#475569',
            maxWidth: '750px',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            fontWeight: 500,
          }}
        >
          Organize your study schedule, track your progress, practice with AI flashcards & quizzes,
          and clear your doubts 24/7 with your AI study coach. Built specifically for remote engineering students.
        </p>

        {/* Hero CTA Buttons */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <button
            onClick={onGetStarted}
            className="btn-primary"
            style={{
              fontSize: '1.1rem',
              padding: '0.95rem 2.4rem',
              borderRadius: '14px',
              fontWeight: 800,
              boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)'
            }}
          >
            <span>Get Started Free</span>
            <ArrowRight size={20} />
          </button>

          <button
            onClick={onLogin}
            className="btn-hero-student-login"
            id="landing-hero-login-btn"
            style={{
              fontSize: '1.1rem',
              padding: '0.95rem 2.4rem',
              borderRadius: '14px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
              color: '#7c2d12',
              border: '2px solid #f59e0b',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <LogIn size={20} color="#c2410c" />
            <span>Login</span>
          </button>
        </div>

        {/* All 8 Core Subjects Pill Strip */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', width: '100%' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#475569', marginBottom: '1rem', letterSpacing: '0.04em' }}>
            MASTER ALL 8 CORE ACADEMIC SUBJECTS:
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1050px', margin: '0 auto' }}>
            <span className="badge-subject subject-DAA" style={{ padding: '0.5rem 1.1rem', fontSize: '0.92rem', fontWeight: 700 }}>
              ⚡ DAA
            </span>
            <span className="badge-subject subject-Backend" style={{ padding: '0.5rem 1.1rem', fontSize: '0.92rem', fontWeight: 700 }}>
              🚀 Backend
            </span>
            <span className="badge-subject subject-Python" style={{ padding: '0.5rem 1.1rem', fontSize: '0.92rem', fontWeight: 700 }}>
              🐍 Python
            </span>
            <span className="badge-subject subject-Maths" style={{ padding: '0.5rem 1.1rem', fontSize: '0.92rem', fontWeight: 700 }}>
              📐 Mathematics
            </span>
            <span className="badge-subject subject-DBMS" style={{ padding: '0.5rem 1.1rem', fontSize: '0.92rem', fontWeight: 700 }}>
              🗄️ DBMS
            </span>
            <span className="badge-subject" style={{ padding: '0.5rem 1.1rem', fontSize: '0.92rem', fontWeight: 700, background: '#fce7f3', color: '#db2777', border: '1px solid #fbcfe8' }}>
              🗣️ ACS
            </span>
            <span className="badge-subject" style={{ padding: '0.5rem 1.1rem', fontSize: '0.92rem', fontWeight: 700, background: '#cffafe', color: '#0891b2', border: '1px solid #a5f3fc' }}>
              🌐 Web Development
            </span>
            <span className="badge-subject" style={{ padding: '0.5rem 1.1rem', fontSize: '0.92rem', fontWeight: 700, background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
              🎲 P and S
            </span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            width: '100%',
            marginTop: '3.5rem',
            textAlign: 'left',
          }}
        >
          {/* Card 1 */}
          <div
            className="stat-card"
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '1.8rem',
              gap: '1rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div className="stat-icon-wrapper blue">
              <Calendar size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a' }}>📅 Plan Your Studies</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                Create structured study schedules with date, time, and priority tags. View your week
                in an interactive calendar with pre-populated study routines.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="stat-card"
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '1.8rem',
              gap: '1rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div className="stat-icon-wrapper green">
              <CheckCircle size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a' }}>✅ Track Completion</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                Transform pending tasks into completed milestones with XP point rewards and real-time database updates.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="stat-card"
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '1.8rem',
              gap: '1rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div className="stat-icon-wrapper yellow">
              <TrendingUp size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a' }}>📈 Monitor Progress</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                Real-time subject-wise progress bars and overall completion percentages across all 8 core engineering subjects.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div
            className="stat-card"
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '1.8rem',
              gap: '1rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div className="stat-icon-wrapper orange">
              <Bot size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a' }}>🤖 AI Doubt Assistant Pro</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                Ask academic questions, generate personalized revision roadmaps, and receive algorithmic breakdowns instantly.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          padding: '2rem 3rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#64748b',
          background: 'white',
        }}
      >
        <p>🎓 <strong>Campus</strong> — Remote Study Planner</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.35rem', color: '#94a3b8' }}>
          MERN Full-Stack Architecture • MongoDB • Express.js • React • Node.js
        </p>
      </footer>
    </div>
  );
};
