import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import api from './api/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StudyPlanModal } from './components/StudyPlanModal';
import RecoveryPlanModal from './components/RecoveryPlanModal';
import { Toast } from './components/Toast';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudyPlansPage } from './pages/StudyPlansPage';
import { SchedulePage } from './pages/SchedulePage';
import { ProgressPage } from './pages/ProgressPage';
import { AIChatPage } from './pages/AIChatPage';
import { ProfilePage } from './pages/ProfilePage';
import FocusModePage from './pages/FocusModePage';
import WeakAreasPage from './pages/WeakAreasPage';
import QuizPage from './pages/QuizPage';
import FlashcardsPage from './pages/FlashcardsPage';
import MonthlyPage from './pages/MonthlyPage';
import ExamsPage from './pages/ExamsPage';
import { LoadingSpinner } from './components/LoadingSpinner';

export function App() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Navigation & View State
  const [authView, setAuthView] = useState('landing'); // 'landing', 'login', 'register'
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Study Plans & MongoDB Stats & Overview
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [plansLoading, setPlansLoading] = useState(false);

  // Prevent duplicate weekend auto-check loops
  const hasCheckedWeekendRef = useRef(false);

  // Active Context for cross-tab actions
  const [activeFocusPlan, setActiveFocusPlan] = useState(null);
  const [activeQuizSubject, setActiveQuizSubject] = useState('DAA');
  const [activeQuizTopic, setActiveQuizTopic] = useState('');
  const [activeFlashcardSubject, setActiveFlashcardSubject] = useState('DAA');
  const [activeFlashcardTopic, setActiveFlashcardTopic] = useState('');

  // Filters for My Study Plans
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Toasts
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Calculate dynamic weekend dates for schedule auto-population
  const getDynamicWeekendDates = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(new Date().setDate(diff));

    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatISO = (date) => date.toISOString().split('T')[0];
    return {
      satStr: formatISO(saturday),
      sunStr: formatISO(sunday)
    };
  };

  // Automatically Populate realistic Weekend Study Plans (called only once or on manual click)
  const populateWeekendSamplePlans = useCallback(async (currentPlansList = [], isManualClick = false) => {
    if (!isAuthenticated || !user) return;
    const { satStr, sunStr } = getDynamicWeekendDates();
    const storageKey = `campus_weekend_seeded_${user._id || user.id || 'default'}_${satStr}`;

    // If already seeded for this weekend and user didn't manually request it, do not re-seed
    if (!isManualClick && localStorage.getItem(storageKey)) {
      return;
    }

    const checkList = currentPlansList.length > 0 ? currentPlansList : plans;
    const hasWeekendPlans = checkList.some(
      (p) => p.date === satStr || p.date === sunStr
    );

    if (hasWeekendPlans && !isManualClick) {
      localStorage.setItem(storageKey, 'true');
      return;
    }

    try {
      const sampleSessions = [
        // SATURDAY SESSIONS
        {
          subject: 'DAA',
          topic: 'Dynamic Programming & Graph Algorithms Practice',
          date: satStr,
          time: '09:00',
          estimatedMinutes: 90,
          priority: 'High',
          status: 'Pending',
          notes: 'Solve Shortest Path (Dijkstra) and 0/1 Knapsack problem sets.'
        },
        {
          subject: 'Backend',
          topic: 'RESTful API Authentication & JWT Middleware',
          date: satStr,
          time: '11:00',
          estimatedMinutes: 60,
          priority: 'High',
          status: 'Pending',
          notes: 'Implement token refresh logic and test with Postman/cURL.'
        },
        {
          subject: 'ACS',
          topic: 'Computer Architecture Pipelining & Cache Memory',
          date: satStr,
          time: '14:30',
          estimatedMinutes: 75,
          priority: 'Medium',
          status: 'Pending',
          notes: 'Revise branch prediction hazards and direct-mapped cache formulas.'
        },
        {
          subject: 'Python',
          topic: 'Data Structures, List Comprehensions & OOP Lab',
          date: satStr,
          time: '16:30',
          estimatedMinutes: 60,
          priority: 'Medium',
          status: 'Pending',
          notes: 'Practice lambda functions, generators, and decorators with real code examples.'
        },
        // SUNDAY SESSIONS
        {
          subject: 'Mathematics',
          topic: 'Eigenvalues, Linear Transformations & Vector Spaces',
          date: sunStr,
          time: '09:30',
          estimatedMinutes: 90,
          priority: 'High',
          status: 'Pending',
          notes: 'Solve 3x3 matrix diagonalizations and Cayley-Hamilton proofs.'
        },
        {
          subject: 'DBMS',
          topic: 'SQL Complex Joins, Indexing & Normalization Drills',
          date: sunStr,
          time: '11:30',
          estimatedMinutes: 60,
          priority: 'High',
          status: 'Pending',
          notes: 'Practice 3NF vs BCNF decomposition and B+ tree index lookups.'
        },
        {
          subject: 'Web Development',
          topic: 'React State Management & Full-Stack Integration',
          date: sunStr,
          time: '14:30',
          estimatedMinutes: 75,
          priority: 'High',
          status: 'Pending',
          notes: 'Build interactive UI components, custom hooks, and connect with Express backend.'
        },
        {
          subject: 'P and S',
          topic: 'Probability Distributions & Hypothesis Testing Revision',
          date: sunStr,
          time: '16:30',
          estimatedMinutes: 60,
          priority: 'Medium',
          status: 'Pending',
          notes: 'Review Binomial, Poisson, Normal distributions and Z-test problem sets.'
        }
      ];

      // Create plans in parallel
      await Promise.allSettled(
        sampleSessions.map((s) => api.createPlan(s))
      );

      localStorage.setItem(storageKey, 'true');

      // Refresh data cleanly
      const plansRes = await api.getPlans();
      if (plansRes.data?.plans) {
        setPlans(plansRes.data.plans);
      } else if (plansRes.plans) {
        setPlans(plansRes.plans);
      }

      if (isManualClick) {
        showToast('✨ Realistic Saturday & Sunday study plans added to your schedule!', 'success');
      }
    } catch (err) {
      console.warn('Auto-populating weekend schedule note:', err);
    }
  }, [isAuthenticated, user]);

  // Fetch all user plans, stats, and overview from MongoDB
  const fetchUserData = useCallback(async (isInitial = false) => {
    if (!isAuthenticated) return;
    try {
      if (isInitial) setPlansLoading(true);
      const [plansRes, progressRes, overviewRes] = await Promise.allSettled([
        api.getPlans(),
        api.getProgress(),
        api.getOverview()
      ]);

      let fetchedPlans = [];
      if (plansRes.status === 'fulfilled' && plansRes.value.data?.plans) {
        fetchedPlans = plansRes.value.data.plans;
        setPlans(fetchedPlans);
      } else if (plansRes.status === 'fulfilled' && plansRes.value.plans) {
        fetchedPlans = plansRes.value.plans;
        setPlans(fetchedPlans);
      }

      if (progressRes.status === 'fulfilled' && progressRes.value.data?.stats) {
        setStats(progressRes.value.data.stats);
      } else if (progressRes.status === 'fulfilled' && progressRes.value.stats) {
        setStats(progressRes.value.stats);
      }

      if (overviewRes.status === 'fulfilled') {
        const val = overviewRes.value.data?.overview || overviewRes.value.overview || overviewRes.value.data || overviewRes.value;
        if (val) setOverview(val);
      }

      // Check if weekend plans should be automatically populated (ONLY ONCE per session)
      if (!hasCheckedWeekendRef.current && fetchedPlans) {
        hasCheckedWeekendRef.current = true;
        populateWeekendSamplePlans(fetchedPlans, false);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast(err.message || 'Unable to load study data.', 'error');
    } finally {
      if (isInitial) setPlansLoading(false);
    }
  }, [isAuthenticated, populateWeekendSamplePlans]);

  useEffect(() => {
    if (isAuthenticated) {
      hasCheckedWeekendRef.current = false;
      fetchUserData(true);
    }
  }, [isAuthenticated]);

  // Universal cross-tab navigation helper with options
  const handleNavigate = (tab, options = {}) => {
    if (options.subject) {
      if (tab === 'quiz') setActiveQuizSubject(options.subject);
      if (tab === 'flashcards') setActiveFlashcardSubject(options.subject);
      if (tab === 'plans') setSelectedSubject(options.subject);
    }
    if (options.topic) {
      if (tab === 'quiz') setActiveQuizTopic(options.topic);
      if (tab === 'flashcards') setActiveFlashcardTopic(options.topic);
    }
    if (options.plan) {
      setActiveFocusPlan(options.plan);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle start focus session directly from a study plan card
  const handleStartFocusWithPlan = (plan) => {
    setActiveFocusPlan(plan);
    setCurrentTab('focus');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Create or Update Study Plan
  const handleSavePlan = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingPlan) {
        // UPDATE operation
        const res = await api.updatePlan(editingPlan._id, formData);
        if (res.data?.success || res.success) {
          showToast('Study plan updated successfully! ✏️', 'success');
          setIsModalOpen(false);
          setEditingPlan(null);
          await fetchUserData();
        }
      } else {
        // CREATE operation
        const res = await api.createPlan(formData);
        if (res.data?.success || res.success) {
          showToast('New study plan added to schedule! 🎯', 'success');
          setIsModalOpen(false);
          await fetchUserData();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to save study plan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Status Toggle (Pending <-> Completed)
  const handleStatusToggle = async (planId, newStatus) => {
    try {
      // Optimistic UI update
      setPlans((prev) =>
        prev.map((p) => (p._id === planId ? { ...p, status: newStatus } : p))
      );

      const res = await api.updatePlanStatus(planId, newStatus);
      if (res.data?.success || res.success) {
        showToast(
          newStatus === 'Completed'
            ? 'Great job! Plan marked as Completed! 🎉 (+20 XP)'
            : 'Plan marked as Pending.',
          'success'
        );
        // Refresh progress & overview from MongoDB
        await fetchUserData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to update status.', 'error');
      await fetchUserData(); // revert optimistic update
    }
  };

  // Handle Delete Plan
  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this study plan?')) return;
    try {
      const res = await api.deletePlan(planId);
      if (res.data?.success || res.success) {
        showToast('Study plan deleted.', 'info');
        await fetchUserData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to delete plan.', 'error');
    }
  };

  // Open Edit Modal
  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  // Select Plan from notifications or calendar
  const handleSelectPlan = (planOrId) => {
    const plan = typeof planOrId === 'string'
      ? plans.find((p) => p._id === planOrId)
      : planOrId;
    if (plan) {
      handleEditPlan(plan);
    }
  };

  // Global Auth Loading Screen
  if (authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Checking student credentials..." />
      </div>
    );
  }

  // Not Logged In Views
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <LoginPage
          onSwitchToRegister={() => setAuthView('register')}
          onBackToLanding={() => setAuthView('landing')}
        />
      );
    }
    if (authView === 'register') {
      return (
        <RegisterPage
          onSwitchToLogin={() => setAuthView('login')}
          onBackToLanding={() => setAuthView('landing')}
        />
      );
    }
    return (
      <LandingPage
        onGetStarted={() => setAuthView('register')}
        onLogin={() => setAuthView('login')}
      />
    );
  }

  // Authenticated Application View
  return (
    <div className="app-layout">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Modern Sidebar with Streak Badge */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAddModal={handleOpenAddModal}
        isOpen={mobileSidebarOpen}
        setIsOpen={setMobileSidebarOpen}
        streakCount={overview?.streak?.current || 0}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenAddModal={handleOpenAddModal}
          toggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          plans={plans}
          stats={stats}
          onSelectPlan={handleSelectPlan}
        />

        {/* Page Switcher with Dedicated Section Functionality */}
        {currentTab === 'dashboard' && (
          <DashboardPage
            user={user}
            plans={plans}
            stats={stats}
            overview={overview}
            loading={plansLoading}
            onStatusToggle={handleStatusToggle}
            onEditPlan={handleEditPlan}
            onDeletePlan={handleDeletePlan}
            onOpenAddModal={handleOpenAddModal}
            onOpenRecoveryModal={() => setIsRecoveryModalOpen(true)}
            onNavigate={handleNavigate}
            onStartFocusWithPlan={handleStartFocusWithPlan}
          />
        )}

        {currentTab === 'focus' && (
          <FocusModePage
            initialPlan={activeFocusPlan}
            onSessionComplete={() => {
              fetchUserData();
              setActiveFocusPlan(null);
            }}
            onNavigate={handleNavigate}
            onNavigateToQuiz={(sub, top) => handleNavigate('quiz', { subject: sub, topic: top })}
            showToast={showToast}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'weak-areas' && (
          <WeakAreasPage
            onPracticeTopic={(subject, topic) => {
              handleNavigate('quiz', { subject, topic });
            }}
            onPracticeQuiz={(subject, topic) => {
              handleNavigate('quiz', { subject, topic });
            }}
            onReviseCards={(subject, topic) => {
              handleNavigate('flashcards', { subject, topic });
            }}
            onStartFocus={(planOrTopic) => {
              if (planOrTopic && planOrTopic.subject) {
                handleStartFocusWithPlan({
                  subject: planOrTopic.subject,
                  topic: planOrTopic.topic || planOrTopic.title || '',
                  title: planOrTopic.topic || planOrTopic.title || '',
                  estimatedMinutes: planOrTopic.estimatedMinutes || 45
                });
              } else {
                handleNavigate('focus');
              }
            }}
            onAskAI={(subject, topic) => {
              handleNavigate('ai', { subject, topic });
            }}
            onNavigate={handleNavigate}
            showToast={showToast}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'quiz' && (
          <QuizPage
            initialSubject={activeQuizSubject}
            initialTopic={activeQuizTopic}
            onNavigate={handleNavigate}
            onStudyTopic={(sub, top) => handleStartFocusWithPlan({ subject: sub, topic: top, title: top, estimatedMinutes: 45 })}
            showToast={showToast}
            onShowToast={showToast}
            onScoreSubmitted={fetchUserData}
          />
        )}

        {currentTab === 'flashcards' && (
          <FlashcardsPage
            initialSubject={activeFlashcardSubject}
            initialTopic={activeFlashcardTopic}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}

        {currentTab === 'monthly' && (
          <MonthlyPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'exams' && (
          <ExamsPage
            onNavigate={handleNavigate}
            onSelectSubject={(sub) => setActiveQuizSubject(sub)}
            showToast={showToast}
          />
        )}

        {currentTab === 'schedule' && (
          <SchedulePage
            plans={plans}
            onSelectPlan={handleSelectPlan}
            onOpenAddModal={handleOpenAddModal}
            onAutoPopulateWeekend={() => populateWeekendSamplePlans(plans, true)}
          />
        )}

        {currentTab === 'plans' && (
          <StudyPlansPage
            plans={plans}
            loading={plansLoading}
            onStatusToggle={handleStatusToggle}
            onEditPlan={handleEditPlan}
            onDeletePlan={handleDeletePlan}
            onOpenAddModal={handleOpenAddModal}
            onStartFocus={handleStartFocusWithPlan}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressPage stats={stats} overview={overview} loading={plansLoading} onNavigate={handleNavigate} />
        )}

        {currentTab === 'ai' && (
          <AIChatPage onOpenAddModal={handleOpenAddModal} />
        )}

        {currentTab === 'profile' && (
          <ProfilePage stats={stats} overview={overview} onShowToast={showToast} />
        )}
      </div>

      {/* Add / Edit Study Plan Modal */}
      <StudyPlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        onSubmit={handleSavePlan}
        initialPlan={editingPlan}
        isSubmitting={isSubmitting}
      />

      {/* Smart Recovery Plan Modal */}
      <RecoveryPlanModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        onPlanApplied={fetchUserData}
        showToast={showToast}
      />
    </div>
  );
}

export default App;
