import { Exam } from '../models/Exam.js';
import { ALLOWED_SUBJECTS } from '../models/StudyPlan.js';
import { loadUserData, computeExams } from '../utils/analytics.js';
import { getToday, isDateStr } from '../utils/dates.js';

const listFor = async (userId, todayParam) => {
  const data = await loadUserData(userId);
  return computeExams(data, getToday(todayParam));
};

// @route GET /api/exams
export const getExams = async (req, res) => {
  try {
    const exams = await listFor(req.user._id, req.query.today);
    return res.status(200).json({ success: true, exams });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load exams.', error: error.message });
  }
};

// @route POST /api/exams
export const createExam = async (req, res) => {
  try {
    const { name, subject, date, totalTopics, topics, notes } = req.body;
    if (!name || !String(name).trim() || !subject || !date) {
      return res.status(400).json({ success: false, message: 'Please provide exam name, subject and date.' });
    }
    if (!ALLOWED_SUBJECTS.includes(subject)) {
      return res.status(400).json({ success: false, message: 'Invalid subject.' });
    }
    if (!isDateStr(date)) {
      return res.status(400).json({ success: false, message: 'Please choose a valid exam date.' });
    }
    const exam = await Exam.create({
      userId: req.user._id,
      name: String(name).trim(),
      subject,
      date,
      totalTopics: Number(totalTopics) > 0 ? Math.round(Number(totalTopics)) : null,
      topics: Array.isArray(topics) ? topics.map(t => String(t).trim()).filter(Boolean) : [],
      notes: typeof notes === 'string' ? notes.trim() : '',
    });
    const exams = await listFor(req.user._id, req.body.today);
    return res.status(201).json({ success: true, message: 'Exam added.', exam, exams });
  } catch (error) {
    console.error('Create exam error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to add exam.' });
  }
};

// @route PUT /api/exams/:id
export const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, userId: req.user._id });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });
    const { name, subject, date, totalTopics, topics, notes } = req.body;
    if (name && String(name).trim()) exam.name = String(name).trim();
    if (subject) {
      if (!ALLOWED_SUBJECTS.includes(subject)) return res.status(400).json({ success: false, message: 'Invalid subject.' });
      exam.subject = subject;
    }
    if (date) {
      if (!isDateStr(date)) return res.status(400).json({ success: false, message: 'Invalid exam date.' });
      exam.date = date;
    }
    if (totalTopics !== undefined) exam.totalTopics = Number(totalTopics) > 0 ? Math.round(Number(totalTopics)) : null;
    if (topics !== undefined) exam.topics = Array.isArray(topics) ? topics.map(t => String(t).trim()).filter(Boolean) : [];
    if (notes !== undefined) exam.notes = typeof notes === 'string' ? notes.trim() : '';
    await exam.save();
    const exams = await listFor(req.user._id, req.body.today);
    return res.status(200).json({ success: true, message: 'Exam updated.', exams });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update exam.' });
  }
};

// @route DELETE /api/exams/:id
export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });
    const exams = await listFor(req.user._id, req.query.today);
    return res.status(200).json({ success: true, message: 'Exam deleted.', exams });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete exam.', error: error.message });
  }
};
