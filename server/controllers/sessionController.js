import { FocusSession } from '../models/FocusSession.js';
import { StudyPlan, ALLOWED_SUBJECTS } from '../models/StudyPlan.js';
import { applyStatusChange } from '../utils/planHelpers.js';
import { isDateStr, toDateStr } from '../utils/dates.js';

// @desc    Save a finished focus session (actual duration + confidence)
// @route   POST /api/sessions
export const createSession = async (req, res) => {
  try {
    const { planId, subject, topic, goal = '', goalMinutes = 25, durationSeconds, confidence, startedAt, localDate, startHour, completePlan = false } = req.body;

    if (!ALLOWED_SUBJECTS.includes(subject)) {
      return res.status(400).json({ success: false, message: 'Please choose a valid subject.' });
    }
    if (!topic || !String(topic).trim()) {
      return res.status(400).json({ success: false, message: 'Please provide the topic you studied.' });
    }
    const conf = Number(confidence);
    if (!Number.isInteger(conf) || conf < 1 || conf > 5) {
      return res.status(400).json({ success: false, message: 'Confidence must be a number from 1 to 5.' });
    }
    const seconds = Math.round(Number(durationSeconds));
    if (!Number.isFinite(seconds) || seconds < 0 || seconds > 24 * 3600) {
      return res.status(400).json({ success: false, message: 'Invalid session duration.' });
    }

    const endedAt = new Date();
    const started = startedAt && !Number.isNaN(Date.parse(startedAt)) ? new Date(startedAt) : new Date(endedAt.getTime() - seconds * 1000);

    let plan = null;
    if (planId) {
      plan = await StudyPlan.findOne({ _id: planId, userId: req.user._id });
    }

    const session = await FocusSession.create({
      userId: req.user._id,
      planId: plan ? plan._id : null,
      subject,
      topic: String(topic).trim(),
      goal: String(goal || '').trim(),
      goalMinutes: Number(goalMinutes) || 25,
      durationSeconds: seconds,
      confidence: conf,
      startedAt: started,
      endedAt,
      date: isDateStr(localDate) ? localDate : toDateStr(endedAt),
      startHour: Number.isInteger(startHour) && startHour >= 0 && startHour <= 23 ? startHour : started.getHours(),
    });

    let updatedPlan = null;
    if (plan && completePlan && plan.status !== 'Completed') {
      applyStatusChange(plan, 'Completed', session.date, endedAt.getHours());
      await plan.save();
      updatedPlan = plan;
    }

    return res.status(201).json({ success: true, message: 'Focus session saved.', session, plan: updatedPlan });
  } catch (error) {
    console.error('Error saving focus session:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to save focus session.' });
  }
};

// @desc    Recent focus sessions
// @route   GET /api/sessions
export const getSessions = async (req, res) => {
  try {
    const sessions = await FocusSession.find({ userId: req.user._id }).sort({ endedAt: -1 }).limit(20);
    return res.status(200).json({ success: true, sessions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load focus sessions.', error: error.message });
  }
};
