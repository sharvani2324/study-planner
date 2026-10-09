import { QuizResult } from '../models/QuizResult.js';
import { StudyPlan, ALLOWED_SUBJECTS } from '../models/StudyPlan.js';
import { callGemini, parseJsonLoose, hasGemini } from '../utils/gemini.js';
import { bankQuestions, bankTopics, SUBJECT_INFO } from '../data/contentBank.js';
import { isDateStr, toDateStr } from '../utils/dates.js';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

function sanitizeQuestions(raw, fallbackTopic) {
  const list = Array.isArray(raw) ? raw : raw?.questions;
  if (!Array.isArray(list)) return [];
  return list
    .map((q) => ({
      question: String(q.question || '').trim(),
      options: Array.isArray(q.options) ? q.options.map((o) => String(o).trim()) : [],
      correctIndex: Number.isInteger(q.correctIndex) ? q.correctIndex : parseInt(q.correctIndex, 10),
      explanation: String(q.explanation || '').trim(),
      topic: String(q.topic || fallbackTopic || '').trim() || fallbackTopic,
    }))
    .filter((q) => q.question && q.options.length === 4 && q.correctIndex >= 0 && q.correctIndex <= 3);
}

// @desc    Topic suggestions for a subject (built-in syllabus topics + the student's own plan topics)
// @route   GET /api/quiz/topics?subject=DAA
export const getTopics = async (req, res) => {
  try {
    const { subject } = req.query;
    const isAll = subject === 'All' || subject === 'All Subjects';
    if (!isAll && !ALLOWED_SUBJECTS.includes(subject)) {
      return res.status(400).json({ success: false, message: 'Invalid subject.' });
    }
    if (isAll) {
      return res.status(200).json({ success: true, topics: [{ name: 'Core Syllabus Revision', source: 'syllabus' }] });
    }
    const plans = await StudyPlan.find({ userId: req.user._id, subject }).select('topic').lean();
    const own = [...new Set(plans.map((p) => p.topic))];
    const builtIn = bankTopics(subject);
    return res.status(200).json({ success: true, topics: [...own.map((t) => ({ name: t, source: 'plan' })), ...builtIn.filter((t) => !own.includes(t)).map((t) => ({ name: t, source: 'syllabus' }))] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load topics.', error: error.message });
  }
};

// @desc    Generate a quiz (AI via Gemini when configured, otherwise the built-in question bank)
// @route   POST /api/quiz/generate
export const generateQuiz = async (req, res) => {
  try {
    const { subject, topic = '', difficulty = 'Medium', count = 5 } = req.body;
    const isAll = subject === 'All' || subject === 'All Subjects' || subject === 'all';
    if (!isAll && !ALLOWED_SUBJECTS.includes(subject)) {
      return res.status(400).json({ success: false, message: 'Please select a valid subject.' });
    }
    const targetSubject = isAll ? 'All Subjects' : subject;
    const level = DIFFICULTIES.includes(difficulty) ? difficulty : 'Medium';
    const n = Math.min(10, Math.max(3, parseInt(count, 10) || 5));
    const cleanTopic = String(topic).trim();

    if (!isAll && hasGemini()) {
      const prompt = `You are a university exam setter for the subject "${SUBJECT_INFO[subject] || subject}".
Create exactly ${n} multiple-choice questions${cleanTopic ? ` on the topic "${cleanTopic}"` : ' covering the core syllabus'} at ${level} difficulty.
Rules: each question has exactly 4 options and exactly one correct answer; "correctIndex" is the 0-based index of the correct option; add a short "explanation"; set "topic" to the specific sub-topic the question tests.
Return ONLY valid JSON in this shape: {"questions":[{"question":"","options":["","","",""],"correctIndex":0,"explanation":"","topic":""}]}`;
      const text = await callGemini(prompt, { json: true });
      const questions = sanitizeQuestions(parseJsonLoose(text), cleanTopic || subject).slice(0, n);
      if (questions.length >= 3) {
        return res.status(200).json({ success: true, source: 'ai', subject: targetSubject, topic: cleanTopic, difficulty: level, questions });
      }
    }

    const { questions, matchedTopic } = bankQuestions(targetSubject, cleanTopic, level, n);
    if (!questions.length) {
      return res.status(404).json({ success: false, message: 'No questions available for this subject yet.' });
    }
    return res.status(200).json({
      success: true,
      source: 'bank',
      subject: targetSubject,
      topic: cleanTopic,
      difficulty: level,
      matchedTopic,
      note: hasGemini()
        ? 'AI generation was unavailable, so questions were taken from the built-in question bank.'
        : 'Questions come from the built-in question bank. Add GEMINI_API_KEY to server/.env for AI-generated questions.',
      questions,
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate quiz.', error: error.message });
  }
};

// @desc    Submit answers, score the quiz on the server and store the result
// @route   POST /api/quiz/submit
export const submitQuiz = async (req, res) => {
  try {
    const { subject, topic = '', difficulty = 'Medium', source = 'bank', questions, answers, localDate, localHour } = req.body;
    const isAll = subject === 'All' || subject === 'All Subjects';
    if (!isAll && !ALLOWED_SUBJECTS.includes(subject)) {
      return res.status(400).json({ success: false, message: 'Invalid subject.' });
    }
    if (!Array.isArray(questions) || !questions.length || !Array.isArray(answers) || answers.length !== questions.length) {
      return res.status(400).json({ success: false, message: 'Quiz questions and answers do not match.' });
    }

    const graded = questions.map((q, i) => {
      const selected = Number.isInteger(answers[i]) ? answers[i] : null;
      return {
        question: String(q.question),
        options: (q.options || []).map(String),
        correctIndex: Number(q.correctIndex),
        selectedIndex: selected,
        isCorrect: selected !== null && selected === Number(q.correctIndex),
        explanation: String(q.explanation || ''),
        topic: String(q.topic || topic || subject),
      };
    });

    const correctCount = graded.filter((g) => g.isCorrect).length;
    const breakdownMap = new Map();
    graded.forEach((g) => {
      const b = breakdownMap.get(g.topic) || { topic: g.topic, correct: 0, total: 0 };
      b.total += 1;
      if (g.isCorrect) b.correct += 1;
      breakdownMap.set(g.topic, b);
    });
    const topicBreakdown = [...breakdownMap.values()];

    const now = new Date();
    const result = await QuizResult.create({
      userId: req.user._id,
      subject,
      topic: String(topic).trim(),
      difficulty: DIFFICULTIES.includes(difficulty) ? difficulty : 'Medium',
      source: source === 'ai' ? 'ai' : 'bank',
      totalQuestions: graded.length,
      correctCount,
      scorePercent: Math.round((correctCount / graded.length) * 100),
      questions: graded,
      topicBreakdown,
      date: isDateStr(localDate) ? localDate : toDateStr(now),
      hour: Number.isInteger(localHour) ? localHour : now.getHours(),
    });

    const weakTopics = topicBreakdown
      .filter((b) => b.correct < b.total)
      .sort((a, b) => b.total - b.correct - (a.total - a.correct))
      .map((b) => ({ topic: b.topic, wrong: b.total - b.correct, total: b.total }));

    return res.status(201).json({ success: true, result, weakTopics });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save quiz result.', error: error.message });
  }
};

// @desc    Recent quiz results
// @route   GET /api/quiz/results
export const getResults = async (req, res) => {
  try {
    const results = await QuizResult.find({ userId: req.user._id })
      .select('-questions')
      .sort({ createdAt: -1 })
      .limit(15);
    return res.status(200).json({ success: true, results });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load quiz history.', error: error.message });
  }
};
