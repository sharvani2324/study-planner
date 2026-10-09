// Dynamic backend API base URL:
// In production (e.g., hosted on Vercel), requests target the deployed backend specified by VITE_API_URL.
// In local development, if VITE_API_URL is omitted, it defaults to '/api' to use Vite's dev server proxy.
const getBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (!envUrl) {
    return '/api';
  }
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const BASE_URL = getBaseUrl();

const getHeaders = () => {
  const token = localStorage.getItem('study_planner_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.response = { data, status: res.status };
    throw err;
  }
  // Provide both top-level and .data for Axios-like and direct fetch compatibility
  return { ...data, data };
};

export const api = {
  // Authentication
  async register(name, email, password, confirmPassword) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
    return handleResponse(res);
  },

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateProfile(profileData) {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  // Study Plans CRUD
  async getPlans(params = {}) {
    const query = new URLSearchParams();
    if (params.subject && params.subject !== 'All') query.append('subject', params.subject);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.date) query.append('date', params.date);
    if (params.sortBy) query.append('sortBy', params.sortBy);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${BASE_URL}/study-plans${qs}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getPlanById(id) {
    const res = await fetch(`${BASE_URL}/study-plans/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createPlan(planData) {
    const res = await fetch(`${BASE_URL}/study-plans`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(planData),
    });
    return handleResponse(res);
  },

  async updatePlan(id, planData) {
    const res = await fetch(`${BASE_URL}/study-plans/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(planData),
    });
    return handleResponse(res);
  },

  async updatePlanStatus(id, status) {
    const res = await fetch(`${BASE_URL}/study-plans/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async deletePlan(id) {
    const res = await fetch(`${BASE_URL}/study-plans/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Progress & Stats from MongoDB
  async getProgress() {
    const res = await fetch(`${BASE_URL}/study-plans/progress`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // AI Doubt Assistant
  async chatWithAI(subject, message, chatHistory = []) {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ subject, message, chatHistory }),
    });
    return handleResponse(res);
  },

  // Focus Study Sessions
  async createFocusSession(data) {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async recordFocusSession(data) {
    return this.createFocusSession(data);
  },

  async getFocusSessions() {
    const res = await fetch(`${BASE_URL}/sessions`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Quizzes
  async getQuizTopics(subject) {
    const res = await fetch(`${BASE_URL}/quiz/topics?subject=${encodeURIComponent(subject)}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async generateQuiz(subjectOrObj, topic, difficulty = 'Medium', count = 5) {
    let payload = {};
    if (typeof subjectOrObj === 'object' && subjectOrObj !== null) {
      payload = subjectOrObj;
    } else {
      payload = { subject: subjectOrObj, topic, difficulty, count };
    }
    const res = await fetch(`${BASE_URL}/quiz/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async submitQuiz(data) {
    const res = await fetch(`${BASE_URL}/quiz/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getQuizResults() {
    const res = await fetch(`${BASE_URL}/quiz/results`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Flashcards
  async generateFlashcards(subjectOrObj, topic, count = 8) {
    let payload = {};
    if (typeof subjectOrObj === 'object' && subjectOrObj !== null) {
      payload = subjectOrObj;
    } else {
      payload = { subject: subjectOrObj, topic, count };
    }
    const res = await fetch(`${BASE_URL}/flashcards/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async reviewFlashcard(data) {
    const res = await fetch(`${BASE_URL}/flashcards/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async recordFlashcardReview(data) {
    return this.reviewFlashcard(data);
  },

  async getDifficultCards() {
    const res = await fetch(`${BASE_URL}/flashcards/difficult`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getDifficultFlashcards() {
    return this.getDifficultCards();
  },

  // Exams
  async getExams(today) {
    const qs = today ? `?today=${encodeURIComponent(today)}` : '';
    const res = await fetch(`${BASE_URL}/exams${qs}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createExam(data) {
    const res = await fetch(`${BASE_URL}/exams`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateExam(id, data) {
    const res = await fetch(`${BASE_URL}/exams/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteExam(id, today) {
    const qs = today ? `?today=${encodeURIComponent(today)}` : '';
    const res = await fetch(`${BASE_URL}/exams/${id}${qs}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Insights & Overview
  async getOverview(today) {
    const qs = today ? `?today=${encodeURIComponent(today)}` : '';
    const res = await fetch(`${BASE_URL}/insights/overview${qs}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getWeakAreas(today) {
    const qs = today ? `?today=${encodeURIComponent(today)}` : '';
    const res = await fetch(`${BASE_URL}/insights/weak-areas${qs}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getPerformance(today) {
    const qs = today ? `?today=${encodeURIComponent(today)}` : '';
    const res = await fetch(`${BASE_URL}/insights/performance${qs}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getStreak(today) {
    const qs = today ? `?today=${encodeURIComponent(today)}` : '';
    const res = await fetch(`${BASE_URL}/insights/streak${qs}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getBestTime(today) {
    const qs = today ? `?today=${encodeURIComponent(today)}` : '';
    const res = await fetch(`${BASE_URL}/insights/best-time${qs}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getBestStudyTime(today) {
    return this.getBestTime(today);
  },

  async getMonthly(monthOrObj, today) {
    let month = '';
    let year = '';
    let todayVal = today;
    if (typeof monthOrObj === 'object' && monthOrObj !== null) {
      if (monthOrObj.month && monthOrObj.year) {
        month = `${monthOrObj.year}-${String(monthOrObj.month).padStart(2, '0')}`;
      } else if (monthOrObj.month) {
        month = monthOrObj.month;
      }
    } else {
      month = monthOrObj;
    }

    const query = new URLSearchParams();
    if (month) query.append('month', month);
    if (todayVal) query.append('today', todayVal);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${BASE_URL}/insights/monthly${qs}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getMonthlyAnalytics(params) {
    return this.getMonthly(params);
  },

  async getRecoveryPlan(nowMinutes, today) {
    const res = await fetch(`${BASE_URL}/insights/recovery-plan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nowMinutes, today }),
    });
    return handleResponse(res);
  },

  async acceptRecoveryPlan(itemsOrObj) {
    let items = [];
    if (itemsOrObj && itemsOrObj.changes) {
      items = itemsOrObj.changes;
    } else if (Array.isArray(itemsOrObj)) {
      items = itemsOrObj;
    } else if (itemsOrObj && itemsOrObj.items) {
      items = itemsOrObj.items;
    }
    const res = await fetch(`${BASE_URL}/insights/recovery-plan/accept`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ items }),
    });
    return handleResponse(res);
  },

  async applyRecoveryPlan(data) {
    return this.acceptRecoveryPlan(data);
  }
};

export default api;
