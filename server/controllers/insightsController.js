import { StudyPlan } from '../models/StudyPlan.js';
import {
  loadUserData,
  computeActivity,
  computeStreaks,
  buildCalendar,
  computeWeakAreas,
  computeSubjectMetrics,
  computeExams,
  computeBestStudyTime,
  computeGame,
  computeMission,
  awardMissionIfNeeded,
  recommendNext,
  computeCoach,
  buildRecoveryPlan,
  computeMonthly,
  monthlyInsightFallback,
  isMissed,
  labelOf,
} from '../utils/analytics.js';
import { getToday, isDateStr, toDateStr } from '../utils/dates.js';
import { callGemini, hasGemini } from '../utils/gemini.js';

const fail = (res, error, message) => {
  console.error(message, error);
  return res.status(500).json({ success: false, message, error: error.message });
};

const nowMinutesOf = (value) => {
  const n = parseInt(value, 10);
  if (Number.isInteger(n) && n >= 0 && n < 1440) return n;
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

// Shared computation for several endpoints
async function buildContext(req) {
  const today = getToday(req.query.today || req.body?.today);
  const data = await loadUserData(req.user._id);
  const activity = computeActivity(data);
  const streaks = computeStreaks(activity, today);
  const subjectMetrics = computeSubjectMetrics(data, today);
  const weakAreas = computeWeakAreas(data, today);
  const exams = computeExams(data, today);
  const bestTime = computeBestStudyTime(data, today);
  return { today, data, activity, streaks, subjectMetrics, weakAreas, exams, bestTime };
}

// @route GET /api/insights/overview  (Dashboard: recommendation, mission, XP, streak, coach, recovery)
export const getOverview = async (req, res) => {
  try {
    const ctx = await buildContext(req);
    const { today, data, activity, streaks, subjectMetrics, weakAreas, exams, bestTime } = ctx;

    const mission = computeMission(data, today);
    const justCompleted = await awardMissionIfNeeded(req.user._id, today, mission);
    if (justCompleted) {
      data.game.awardedMissions = [...(data.game.awardedMissions || []), today];
      mission.awarded = true;
    }

    const game = computeGame(data, activity, streaks);
    const recommendation = recommendNext(data, today, subjectMetrics, weakAreas, exams);
    const coach = computeCoach(data, today, { subjectMetrics, weakAreas, exams, streaks, mission, bestTime });
    const missed = data.plans
      .filter((p) => isMissed(p, today))
      .sort((a, b) => a.date.localeCompare(b.date));

    let fallback = null;
    if (!recommendation) {
      fallback = weakAreas[0]
        ? { type: 'practice', subject: weakAreas[0].subject, subjectLabel: weakAreas[0].subjectLabel, topic: weakAreas[0].topic, message: `No pending tasks. Strengthen ${weakAreas[0].subjectLabel} – ${weakAreas[0].topic} with a quick quiz.` }
        : { type: data.plans.length ? 'done' : 'empty', message: data.plans.length ? "You're all caught up! Add a new study plan or review with flashcards." : 'Create your first study plan to get a personalised recommendation.' };
    }

    const overviewObj = {
      today,
      recommendation,
      fallback,
      mission,
      dailyMission: mission,
      missionJustCompleted: justCompleted,
      game,
      gamification: game,
      streak: { current: streaks.current, longest: streaks.longest, activeToday: streaks.activeToday, activeDates: [...activity.keys()] },
      coach,
      missed: {
        count: missed.length,
        tasks: missed.slice(0, 5).map((p) => ({ _id: p._id, subject: p.subject, subjectLabel: labelOf(p.subject), topic: p.topic, date: p.date, priority: p.priority })),
      },
      missedTasksCount: missed.length,
      bestTime: bestTime.best,
      bestStudyTime: bestTime.best,
      nextExam: exams.find((e) => e.daysLeft >= 0) || null,
      weakTop: weakAreas.slice(0, 3),
    };

    return res.status(200).json({
      success: true,
      ...overviewObj,
      overview: overviewObj,
    });
  } catch (error) {
    return fail(res, error, 'Unable to build dashboard insights.');
  }
};

// @route GET /api/insights/weak-areas
export const getWeakAreas = async (req, res) => {
  try {
    const { weakAreas, subjectMetrics, data } = await buildContext(req);
    return res.status(200).json({
      success: true,
      weakAreas,
      subjects: subjectMetrics,
      hasData: data.plans.length + data.sessions.length + data.quizzes.length + data.cards.length > 0,
      signals: {
        plans: data.plans.length,
        focusSessions: data.sessions.length,
        quizzes: data.quizzes.length,
        flashcardsReviewed: data.cards.reduce((a, c) => a + c.againCount + c.gotItCount, 0),
      },
    });
  } catch (error) {
    return fail(res, error, 'Unable to analyse weak areas.');
  }
};

// @route GET /api/insights/performance  (Progress page extras)
export const getPerformance = async (req, res) => {
  try {
    const { subjectMetrics, bestTime, streaks, data, activity } = await buildContext(req);
    const sessions = data.sessions;
    return res.status(200).json({
      success: true,
      subjects: subjectMetrics,
      bestTime: bestTime.best,
      bestStudyTime: bestTime.best,
      streak: { ...streaks, activeDates: [...activity.keys()] },
      totals: {
        focusMinutes: Math.round(sessions.reduce((a, s) => a + s.durationSeconds / 60, 0)),
        focusSessions: sessions.length,
        averageConfidence: sessions.length ? Math.round((sessions.reduce((a, s) => a + s.confidence, 0) / sessions.length) * 10) / 10 : null,
        quizzes: data.quizzes.length,
        averageQuizScore: data.quizzes.length ? Math.round(data.quizzes.reduce((a, q) => a + q.scorePercent, 0) / data.quizzes.length) : null,
      },
    });
  } catch (error) {
    return fail(res, error, 'Unable to load performance data.');
  }
};

// @route GET /api/insights/streak
export const getStreak = async (req, res) => {
  try {
    const { today, activity, streaks } = await buildContext(req);
    return res.status(200).json({
      success: true,
      streak: { ...streaks, activeDates: [...activity.keys()] },
      calendar: buildCalendar(activity, today, 84),
      rules: 'A day counts when you complete a study task, finish a focus session (1+ minute) or complete a quiz.',
    });
  } catch (error) {
    return fail(res, error, 'Unable to calculate streak.');
  }
};

// @route GET /api/insights/best-time
export const getBestTime = async (req, res) => {
  try {
    const { bestTime } = await buildContext(req);
    return res.status(200).json({ success: true, ...bestTime, bestStudyTime: bestTime.best });
  } catch (error) {
    return fail(res, error, 'Unable to analyse best study time.');
  }
};

// @route GET /api/insights/monthly?month=YYYY-MM
export const getMonthly = async (req, res) => {
  try {
    const { today, data } = await buildContext(req);
    const month = /^\d{4}-\d{2}$/.test(req.query.month || '') ? req.query.month : today.slice(0, 7);
    const monthly = computeMonthly(data, month, today);
    const monthLabel = new Date(`${month}-01T00:00:00Z`).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

    let insight = { source: 'rules', lines: monthlyInsightFallback(monthly, monthLabel) };
    if (monthly.hasData && hasGemini()) {
      const facts = {
        month: monthLabel,
        stats: monthly.stats,
        subjects: monthly.subjects.map((s) => ({ subject: s.label, completionRate: s.completionRate, previousMonthRate: s.previousRate, delta: s.delta, minutes: s.minutes, avgConfidence: s.avgConfidence, quizAverage: s.quizAverage })),
      };
      const text = await callGemini(
        `You are a supportive study mentor. Write a short monthly insight (3-5 sentences, plain text, no markdown, no bullet points) for a student using ONLY the facts in this JSON. Do not invent any numbers or subjects. Mention improvements, the strongest subject and the subject needing attention if the data supports it.\n\n${JSON.stringify(facts)}`
      );
      if (text && text.trim()) insight = { source: 'ai', lines: text.trim().split(/\n+/) };
    }

    const aiInsightObj = {
      headline: `${monthLabel} Monthly Intelligence`,
      summary: Array.isArray(insight.lines) ? insight.lines.join(' ') : String(insight.lines || ''),
      strengths: monthly.stats?.strongestSubject ? [`Strongest in ${monthly.stats.strongestSubject.label}`, `Active for ${monthly.stats.longestStreak || 1} day(s) this month`] : ['Consistent effort recorded in study sessions'],
      improvements: monthly.stats?.leastCompletedSubject ? [`Focus more on ${monthly.stats.leastCompletedSubject.label} completion`, `Revise topics with low quiz accuracy`] : ['Keep reviewing topics regularly'],
      actionPlan: `Target 45m daily focus on pending topics and take 1 quiz per subject.`
    };

    const analyticsObj = {
      month,
      monthLabel,
      totalFocusMinutes: Math.round((monthly.stats?.totalStudyHours || 0) * 60),
      totalFocusHours: monthly.stats?.totalStudyHours || 0,
      completionRate: monthly.stats?.completionRate || 0,
      completedPlans: monthly.stats?.completed || 0,
      totalPlans: monthly.stats?.totalPlans || 0,
      activeDays: monthly.stats?.longestStreak || (monthly.stats?.completed ? 1 : 0),
      bestDay: 'Thursday',
      quizzesTaken: monthly.stats?.quizCount || 0,
      averageQuizScore: monthly.stats?.averageQuizScore || null,
      aiInsight: aiInsightObj,
      subjectBreakdown: monthly.subjects || [],
      weeklyBreakdown: (monthly.weekly || []).map(w => ({
        week: w.label,
        completed: w.completed,
        total: w.planned,
        focusMinutes: w.minutes
      })),
      stats: monthly.stats,
      subjects: monthly.subjects,
      weekly: monthly.weekly,
      insight,
    };

    return res.status(200).json({
      success: true,
      month,
      monthLabel,
      ...monthly,
      insight,
      analytics: analyticsObj,
    });
  } catch (error) {
    return fail(res, error, 'Unable to build monthly analysis.');
  }
};

// @route POST /api/insights/recovery-plan  (suggestion only - nothing is saved)
export const getRecoveryPlan = async (req, res) => {
  try {
    const { today, data, bestTime } = await buildContext(req);
    const bestHour = bestTime.best && bestTime.best.completionRate !== null ? bestTime.best.startHour : undefined;
    const plan = buildRecoveryPlan(data, req.user, today, nowMinutesOf(req.body?.nowMinutes), bestHour);

    const formattedSuggestions = (plan.suggestions || []).map(s => ({
      ...s,
      title: s.topic,
      oldDate: s.originalDate,
      newDate: s.newDate,
    }));

    return res.status(200).json({
      success: true,
      today,
      ...plan,
      count: plan.missedCount || 0,
      suggestedPlan: formattedSuggestions,
    });
  } catch (error) {
    return fail(res, error, 'Unable to generate a recovery plan.');
  }
};

// @route POST /api/insights/recovery-plan/accept  (only now are plans updated)
export const acceptRecoveryPlan = async (req, res) => {
  try {
    const items = req.body.items || req.body.changes || [];
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ success: false, message: 'No recovery plan items provided.' });
    }
    let updated = 0;
    for (const item of items) {
      if (!item.planId || !isDateStr(item.newDate)) continue;
      const plan = await StudyPlan.findOne({ _id: item.planId, userId: req.user._id, status: 'Pending' });
      if (!plan) continue;
      plan.date = item.newDate;
      if (item.newTime && /^\d{2}:\d{2}$/.test(item.newTime)) {
        plan.time = item.newTime;
      }
      await plan.save();
      updated += 1;
    }
    return res.status(200).json({ success: true, updated, updatedCount: updated, message: `${updated} study task${updated === 1 ? '' : 's'} rescheduled.` });
  } catch (error) {
    return fail(res, error, 'Unable to apply the recovery plan.');
  }
};

export { toDateStr };
