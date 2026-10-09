import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createSession, getSessions } from '../controllers/sessionController.js';
import { generateQuiz, submitQuiz, getResults, getTopics } from '../controllers/quizController.js';
import { generateFlashcards, reviewFlashcard, getDifficultCards } from '../controllers/flashcardController.js';
import { getExams, createExam, updateExam, deleteExam } from '../controllers/examController.js';
import {
  getOverview,
  getWeakAreas,
  getPerformance,
  getStreak,
  getBestTime,
  getMonthly,
  getRecoveryPlan,
  acceptRecoveryPlan,
} from '../controllers/insightsController.js';

// One router for all study-companion features; everything is private (per logged-in student).
// Auth is scoped to these prefixes so unrelated /api routes (e.g. /api/health) stay public.
const router = express.Router();
router.use(['/sessions', '/quiz', '/flashcards', '/exams', '/insights'], protect);

// Focus sessions
router.post('/sessions', createSession);
router.get('/sessions', getSessions);

// Quizzes
router.get('/quiz/topics', getTopics);
router.post('/quiz/generate', generateQuiz);
router.post('/quiz/submit', submitQuiz);
router.get('/quiz/results', getResults);

// Flashcards
router.post('/flashcards/generate', generateFlashcards);
router.post('/flashcards/review', reviewFlashcard);
router.get('/flashcards/difficult', getDifficultCards);

// Exams
router.get('/exams', getExams);
router.post('/exams', createExam);
router.put('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExam);

// Insights
router.get('/insights/overview', getOverview);
router.get('/insights/weak-areas', getWeakAreas);
router.get('/insights/performance', getPerformance);
router.get('/insights/streak', getStreak);
router.get('/insights/best-time', getBestTime);
router.get('/insights/monthly', getMonthly);
router.post('/insights/recovery-plan', getRecoveryPlan);
router.post('/insights/recovery-plan/accept', acceptRecoveryPlan);

export default router;
