// Analytics engine: every number returned here is computed from the logged-in student's
// own MongoDB records (study plans, focus sessions, quiz results, flashcard reviews, exams).
import { StudyPlan, ALLOWED_SUBJECTS, CANONICAL_SUBJECTS } from '../models/StudyPlan.js';
import { FocusSession } from '../models/FocusSession.js';
import { QuizResult } from '../models/QuizResult.js';
import { FlashcardReview } from '../models/FlashcardReview.js';
import { Exam } from '../models/Exam.js';
import { GameProfile } from '../models/GameProfile.js';
import {
  addDays,
  diffDays,
  toDateStr,
  weekdayOf,
  WEEKDAY_NAMES,
  hourOfTime,
  minutesOfTime,
  timeFromMinutes,
  bucketOfHour,
  TIME_BUCKETS,
  formatHour,
  monthRange,
  prevMonth,
} from './dates.js';

export function normalizeCanonicalSubject(s) {
  if (!s) return 'DAA';
  const clean = String(s).trim();
  if (clean === 'Maths' || clean === 'Mathematics') return 'Mathematics';
  if (clean === 'WebDevelopment' || clean === 'Web Development') return 'Web Development';
  if (clean === 'PandS' || clean === 'PNS' || clean === 'P and S') return 'P and S';
  return clean;
}

export const SUBJECT_LABELS = {
  DAA: 'DAA',
  Backend: 'Backend',
  Python: 'Python',
  Mathematics: 'Mathematics',
  Maths: 'Mathematics',
  DBMS: 'DBMS',
  'Web Development': 'Web Development',
  WebDevelopment: 'Web Development',
  ACS: 'ACS',
  'P and S': 'P and S',
  PandS: 'P and S',
  PNS: 'P and S',
};
export const labelOf = (s) => SUBJECT_LABELS[s] || s;

export const MISSION_GOALS = { tasks: 3, minutes: 90, quizzes: 1 };
export const MISSION_XP = 50;
const MIN_MEANINGFUL_SESSION_SECONDS = 60;

const PRIORITY_POINTS = { High: 30, Medium: 18, Low: 8 };
const PRIORITY_RANK = { High: 3, Medium: 2, Low: 1 };

const estMin = (p) => p.estimatedMinutes || 30;
const round = (n, d = 0) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : null);

export const completedDateOf = (p) =>
  p.status === 'Completed' ? p.completedDate || (p.updatedAt ? toDateStr(new Date(p.updatedAt)) : p.date) : null;
export const isMissed = (p, today) => p.status === 'Pending' && p.date < today;
const countsAsSession = (s) => s.durationSeconds >= MIN_MEANINGFUL_SESSION_SECONDS;

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------
export async function loadUserData(userId) {
  const [plans, sessions, quizzes, cards, exams, game] = await Promise.all([
    StudyPlan.find({ userId }).lean(),
    FocusSession.find({ userId }).lean(),
    QuizResult.find({ userId }).lean(),
    FlashcardReview.find({ userId }).lean(),
    Exam.find({ userId }).lean(),
    GameProfile.findOne({ userId }).lean(),
  ]);
  return { plans, sessions, quizzes, cards, exams, game: game || { awardedMissions: [] } };
}

// ---------------------------------------------------------------------------
// Activity + streaks
// ---------------------------------------------------------------------------
export function computeActivity(data) {
  const map = new Map();
  const touch = (date) => {
    if (!map.has(date)) map.set(date, { tasks: 0, sessions: 0, quizzes: 0, minutes: 0 });
    return map.get(date);
  };
  data.plans.forEach((p) => {
    const d = completedDateOf(p);
    if (d) touch(d).tasks += 1;
  });
  data.sessions.filter(countsAsSession).forEach((s) => {
    const a = touch(s.date);
    a.sessions += 1;
    a.minutes += s.durationSeconds / 60;
  });
  data.quizzes.forEach((q) => {
    touch(q.date).quizzes += 1;
  });
  return map;
}

export function longestStreakOf(dates) {
  const sorted = [...new Set(dates)].sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  sorted.forEach((d) => {
    run = prev && diffDays(d, prev) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  });
  return longest;
}

export function computeStreaks(activity, today) {
  const dates = [...activity.keys()];
  const longest = longestStreakOf(dates);
  let cursor = activity.has(today) ? today : addDays(today, -1);
  let current = 0;
  while (activity.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  const lastActive = dates.sort().slice(-1)[0] || null;
  return { current, longest, activeToday: activity.has(today), lastActive, totalActiveDays: dates.length };
}

export function buildCalendar(activity, today, span = 84) {
  const days = [];
  for (let i = span - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const a = activity.get(date);
    days.push({
      date,
      weekday: weekdayOf(date),
      tasks: a?.tasks || 0,
      sessions: a?.sessions || 0,
      quizzes: a?.quizzes || 0,
      minutes: a ? Math.round(a.minutes) : 0,
      count: a ? a.tasks + a.sessions + a.quizzes : 0,
    });
  }
  return days;
}

// ---------------------------------------------------------------------------
// Topic / subject weakness model
// ---------------------------------------------------------------------------
const normTopic = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const topicsMatch = (a, b) => {
  if (!a || !b) return false;
  if (a === b) return true;
  return Math.min(a.length, b.length) >= 4 && (a.includes(b) || b.includes(a));
};

const freshTopic = (subject, label, key) => ({
  subject,
  key,
  label,
  plansTotal: 0,
  completed: 0,
  missed: 0,
  confs: [],
  quizCorrect: 0,
  quizTotal: 0,
  cardAgain: 0,
  cardGot: 0,
  difficultCards: 0,
  minutes: 0,
});

class TopicIndex {
  constructor() {
    this.items = [];
  }
  get(subject, topic) {
    const key = normTopic(topic);
    let item = this.items.find((i) => i.subject === subject && topicsMatch(i.key, key));
    if (!item) {
      item = freshTopic(subject, topic || 'General', key);
      this.items.push(item);
    }
    return item;
  }
}

// Combines the available signals into a 0-100 weakness score (higher = weaker)
function weaknessFromParts({ completed, missed, confs, quizCorrect, quizTotal, cardAgain, cardGot }) {
  const parts = [];
  const resolved = completed + missed;
  if (resolved > 0) {
    parts.push({ w: 0.3, weak: 1 - completed / resolved });
    parts.push({ w: 0.15, weak: Math.min(1, missed / 3) });
  }
  if (confs.length) {
    const recent = confs.slice(-5);
    parts.push({ w: 0.3, weak: (5 - avg(recent)) / 4 });
  }
  if (quizTotal > 0) parts.push({ w: 0.3, weak: 1 - quizCorrect / quizTotal });
  if (cardAgain + cardGot > 0) parts.push({ w: 0.15, weak: cardAgain / (cardAgain + cardGot) });
  if (!parts.length) return null;
  const totalW = parts.reduce((a, p) => a + p.w, 0);
  return Math.round((parts.reduce((a, p) => a + p.w * p.weak, 0) / totalW) * 100);
}

function buildTopicIndex(data, today) {
  const idx = new TopicIndex();
  data.plans.forEach((p) => {
    const t = idx.get(p.subject, p.topic);
    t.plansTotal += 1;
    if (p.status === 'Completed') t.completed += 1;
    else if (isMissed(p, today)) t.missed += 1;
  });
  data.sessions.forEach((s) => {
    const t = idx.get(s.subject, s.topic);
    t.confs.push(s.confidence);
    t.minutes += s.durationSeconds / 60;
  });
  data.quizzes.forEach((q) => {
    (q.topicBreakdown || []).forEach((b) => {
      const t = idx.get(q.subject, b.topic || q.topic);
      t.quizCorrect += b.correct;
      t.quizTotal += b.total;
    });
  });
  data.cards.forEach((c) => {
    const t = idx.get(c.subject, c.topic || 'General');
    t.cardAgain += c.againCount;
    t.cardGot += c.gotItCount;
    if (c.againCount > c.gotItCount || c.lastResult === 'again') t.difficultCards += 1;
  });
  return idx;
}

export function computeWeakAreas(data, today) {
  const idx = buildTopicIndex(data, today);
  const items = idx.items
    .map((t) => {
      const score = weaknessFromParts(t);
      const confidence = t.confs.length ? round(avg(t.confs.slice(-5)), 1) : null;
      const completion = pct(t.completed, t.plansTotal);
      const quizAccuracy = pct(t.quizCorrect, t.quizTotal);
      const reasons = [];
      if (confidence !== null && confidence <= 3) reasons.push(`Confidence ${confidence}/5`);
      if (t.missed > 0) reasons.push(`${t.missed} missed task${t.missed > 1 ? 's' : ''}`);
      if (completion !== null && t.completed + t.missed > 0 && completion < 70) reasons.push(`Completion ${completion}%`);
      if (quizAccuracy !== null && quizAccuracy < 70) reasons.push(`Quiz accuracy ${quizAccuracy}%`);
      if (t.difficultCards > 0) reasons.push(`${t.difficultCards} difficult flashcard${t.difficultCards > 1 ? 's' : ''}`);
      return {
        subject: t.subject,
        subjectLabel: labelOf(t.subject),
        topic: t.label,
        score,
        severity: score >= 70 ? 'Critical' : score >= 55 ? 'High' : 'Moderate',
        confidence,
        completion,
        missedTasks: t.missed,
        quizAccuracy,
        difficultCards: t.difficultCards,
        plansTotal: t.plansTotal,
        studiedMinutes: Math.round(t.minutes),
        reasons,
      };
    })
    .filter((t) => t.score !== null && t.score >= 40 && t.reasons.length > 0)
    .sort((a, b) => b.score - a.score);
  return items;
}

export function computeSubjectMetrics(data, today) {
  return CANONICAL_SUBJECTS.map((subject) => {
    const plans = data.plans.filter((p) => normalizeCanonicalSubject(p.subject) === subject);
    const sessions = data.sessions.filter((s) => normalizeCanonicalSubject(s.subject) === subject);
    const quizzes = data.quizzes.filter((q) => normalizeCanonicalSubject(q.subject) === subject);
    const cards = data.cards.filter((c) => normalizeCanonicalSubject(c.subject) === subject);
    const completed = plans.filter((p) => p.status === 'Completed').length;
    const missed = plans.filter((p) => isMissed(p, today)).length;
    const confs = sessions.map((s) => s.confidence);
    const quizCorrect = quizzes.reduce((a, q) => a + q.correctCount, 0);
    const quizTotal = quizzes.reduce((a, q) => a + q.totalQuestions, 0);
    const cardAgain = cards.reduce((a, c) => a + c.againCount, 0);
    const cardGot = cards.reduce((a, c) => a + c.gotItCount, 0);
    const weakness = weaknessFromParts({ completed, missed, confs, quizCorrect, quizTotal, cardAgain, cardGot });
    return {
      subject,
      label: labelOf(subject),
      total: plans.length,
      completed,
      pending: plans.length - completed,
      missed,
      completionRate: pct(completed, plans.length),
      focusMinutes: Math.round(sessions.reduce((a, s) => a + s.durationSeconds / 60, 0)),
      sessions: sessions.length,
      avgConfidence: confs.length ? round(avg(confs), 1) : null,
      quizCount: quizzes.length,
      quizAverage: quizzes.length ? Math.round(avg(quizzes.map((q) => q.scorePercent))) : null,
      cardsReviewed: cardAgain + cardGot,
      difficultCards: cards.filter((c) => c.againCount > c.gotItCount || c.lastResult === 'again').length,
      weakness,
      strength: weakness === null ? null : 100 - weakness,
    };
  });
}

// ---------------------------------------------------------------------------
// Exams
// ---------------------------------------------------------------------------
export function computeExams(data, today) {
  return data.exams
    .map((exam) => {
      const daysLeft = diffDays(exam.date, today);
      const plans = data.plans.filter((p) => p.subject === exam.subject && p.date <= exam.date);
      const doneTopics = new Set(plans.filter((p) => p.status === 'Completed').map((p) => normTopic(p.topic)));
      const topicsTotal = exam.totalTopics || plans.length;
      const topicsDone = exam.totalTopics
        ? Math.min(exam.totalTopics, doneTopics.size)
        : plans.filter((p) => p.status === 'Completed').length;

      const sessions = data.sessions.filter((s) => s.subject === exam.subject);
      const quizzes = data.quizzes.filter((q) => q.subject === exam.subject);
      const parts = [];
      if (topicsTotal > 0) parts.push({ w: 0.5, v: topicsDone / topicsTotal });
      if (sessions.length) parts.push({ w: 0.25, v: avg(sessions.slice(-5).map((s) => s.confidence)) / 5 });
      if (quizzes.length) {
        const c = quizzes.reduce((a, q) => a + q.correctCount, 0);
        const t = quizzes.reduce((a, q) => a + q.totalQuestions, 0);
        if (t) parts.push({ w: 0.25, v: c / t });
      }
      const totalW = parts.reduce((a, p) => a + p.w, 0);
      const preparation = totalW ? Math.round((parts.reduce((a, p) => a + p.w * p.v, 0) / totalW) * 100) : 0;
      return {
        _id: exam._id,
        name: exam.name,
        subject: exam.subject,
        subjectLabel: labelOf(exam.subject),
        date: exam.date,
        daysLeft,
        status: daysLeft < 0 ? 'Passed' : daysLeft === 0 ? 'Today' : 'Upcoming',
        totalTopics: exam.totalTopics || null,
        topicsDone,
        topicsTotal,
        preparation,
        hasData: parts.length > 0,
        pendingTasks: plans.filter((p) => p.status === 'Pending').length,
      };
    })
    .sort((a, b) => {
      const ap = a.daysLeft < 0 ? 1 : 0;
      const bp = b.daysLeft < 0 ? 1 : 0;
      return ap - bp || Math.abs(a.daysLeft) - Math.abs(b.daysLeft);
    });
}

// ---------------------------------------------------------------------------
// Best study time (from scheduled-task completion + focus sessions)
// ---------------------------------------------------------------------------
export function computeBestStudyTime(data, today) {
  const samples = [];
  data.plans.forEach((p) => {
    if (p.status === 'Completed') samples.push({ hour: hourOfTime(p.time), done: true });
    else if (isMissed(p, today)) samples.push({ hour: hourOfTime(p.time), done: false });
  });

  const buckets = TIME_BUCKETS.map((b) => {
    const inBucket = samples.filter((s) => bucketOfHour(s.hour) === b.id);
    const sessions = data.sessions.filter((s) => bucketOfHour(s.startHour) === b.id);
    const done = inBucket.filter((s) => s.done).length;
    return {
      id: b.id,
      label: b.label,
      range: b.range,
      scheduled: inBucket.length,
      completed: done,
      completionRate: pct(done, inBucket.length),
      focusMinutes: Math.round(sessions.reduce((a, s) => a + s.durationSeconds / 60, 0)),
      sessions: sessions.length,
      avgConfidence: sessions.length ? round(avg(sessions.map((s) => s.confidence)), 1) : null,
    };
  });

  // Best 2-hour window using scheduled-task outcomes
  let bestWindow = null;
  for (let h = 0; h < 24; h++) {
    const inWin = samples.filter((s) => s.hour === h || s.hour === (h + 1) % 24);
    if (inWin.length < 2) continue;
    const done = inWin.filter((s) => s.done).length;
    const rate = done / inWin.length;
    if (
      !bestWindow ||
      rate > bestWindow.rate ||
      (rate === bestWindow.rate && inWin.length > bestWindow.samples)
    ) {
      bestWindow = { start: h, rate, samples: inWin.length, completed: done };
    }
  }

  const ranked = buckets
    .filter((b) => b.scheduled >= 2)
    .sort((a, b) => b.completionRate - a.completionRate || b.focusMinutes - a.focusMinutes);

  let best = null;
  if (bestWindow) {
    best = {
      label: `${formatHour(bestWindow.start)} – ${formatHour(bestWindow.start + 2)}`,
      period: bucketOfHour(bestWindow.start),
      completionRate: Math.round(bestWindow.rate * 100),
      samples: bestWindow.samples,
      basis: 'scheduled study tasks',
      startHour: bestWindow.start,
    };
  } else if (ranked.length) {
    best = {
      label: ranked[0].range,
      period: ranked[0].id,
      completionRate: ranked[0].completionRate,
      samples: ranked[0].scheduled,
      basis: 'scheduled study tasks',
      startHour: TIME_BUCKETS.find((b) => b.id === ranked[0].id).from % 24,
    };
  } else {
    const bySession = buckets.filter((b) => b.sessions > 0).sort((a, b) => b.avgConfidence - a.avgConfidence || b.focusMinutes - a.focusMinutes);
    if (bySession.length) {
      best = {
        label: bySession[0].range,
        period: bySession[0].id,
        completionRate: null,
        avgConfidence: bySession[0].avgConfidence,
        samples: bySession[0].sessions,
        basis: 'focus-session confidence',
        startHour: TIME_BUCKETS.find((b) => b.id === bySession[0].id).from % 24,
      };
    }
  }
  return { best, buckets, totalSamples: samples.length, totalSessions: data.sessions.length };
}

// ---------------------------------------------------------------------------
// XP, levels, achievements
// ---------------------------------------------------------------------------
const xpNeededForLevel = (level) => 200 + (level - 1) * 100;
const levelTitle = (level) =>
  level >= 12 ? 'Master' : level >= 8 ? 'Achiever' : level >= 5 ? 'Scholar' : level >= 3 ? 'Learner' : 'Beginner';

export function computeGame(data, activity, streaks) {
  const completed = data.plans.filter((p) => p.status === 'Completed');
  const taskXp = completed.reduce((a, p) => a + 20 + (p.priority === 'High' ? 10 : p.priority === 'Medium' ? 5 : 0), 0);
  const sessionXp = data.sessions
    .filter(countsAsSession)
    .reduce((a, s) => a + 10 + Math.min(60, Math.floor(s.durationSeconds / 60)), 0);
  const quizXp = data.quizzes.reduce((a, q) => a + 10 + q.correctCount * 6, 0);
  const cardXp = data.cards.reduce((a, c) => a + c.gotItCount * 2 + c.againCount, 0);
  const missionXp = (data.game.awardedMissions || []).length * MISSION_XP;
  const xp = taskXp + sessionXp + quizXp + cardXp + missionXp;

  let level = 1;
  let remaining = xp;
  while (remaining >= xpNeededForLevel(level)) {
    remaining -= xpNeededForLevel(level);
    level += 1;
  }

  const focusHours = data.sessions.filter(countsAsSession).reduce((a, s) => a + s.durationSeconds, 0) / 3600;
  const goodQuizzes = data.quizzes.filter((q) => q.scorePercent >= 80).length;
  const gotItTotal = data.cards.reduce((a, c) => a + c.gotItCount, 0);
  const missionsDone = (data.game.awardedMissions || []).length;

  const defs = [
    { id: 'first_plan', title: 'First Study Plan', description: 'Create your first study plan', icon: 'BookOpen', value: data.plans.length, target: 1 },
    { id: 'first_focus', title: 'First Focus Session', description: 'Complete a focus session', icon: 'Timer', value: data.sessions.filter(countsAsSession).length, target: 1 },
    { id: 'streak_7', title: '7 Day Streak', description: 'Study 7 days in a row', icon: 'Flame', value: streaks.longest, target: 7 },
    { id: 'tasks_50', title: '50 Tasks Completed', description: 'Complete 50 study tasks', icon: 'CheckCircle2', value: completed.length, target: 50 },
    { id: 'first_quiz', title: 'First Quiz', description: 'Finish your first quiz', icon: 'HelpCircle', value: data.quizzes.length, target: 1 },
    { id: 'quiz_master', title: 'Quiz Master', description: 'Score 80%+ on 3 quizzes', icon: 'Trophy', value: goodQuizzes, target: 3 },
    { id: 'card_collector', title: 'Card Collector', description: 'Master 50 flashcard reviews', icon: 'Layers', value: gotItTotal, target: 50 },
    { id: 'mission_hero', title: 'Mission Hero', description: 'Complete 3 daily missions', icon: 'Target', value: missionsDone, target: 3 },
    { id: 'focus_10h', title: 'Deep Focus', description: 'Log 10 hours in focus mode', icon: 'Brain', value: Math.floor(focusHours * 10) / 10, target: 10 },
  ];
  const achievements = defs.map((d) => ({
    ...d,
    value: Math.min(d.value, d.target),
    unlocked: d.value >= d.target,
  }));

  return {
    xp,
    level,
    title: levelTitle(level),
    xpInLevel: remaining,
    xpForNext: xpNeededForLevel(level),
    breakdown: { tasks: taskXp, focus: sessionXp, quizzes: quizXp, flashcards: cardXp, missions: missionXp },
    achievements,
    unlockedCount: achievements.filter((a) => a.unlocked).length,
  };
}

// ---------------------------------------------------------------------------
// Daily mission
// ---------------------------------------------------------------------------
export function computeMission(data, today) {
  const tasks = data.plans.filter((p) => completedDateOf(p) === today).length;
  const minutes = Math.floor(
    data.sessions.filter((s) => s.date === today).reduce((a, s) => a + s.durationSeconds, 0) / 60
  );
  const quizzes = data.quizzes.filter((q) => q.date === today).length;
  const completed =
    tasks >= MISSION_GOALS.tasks && minutes >= MISSION_GOALS.minutes && quizzes >= MISSION_GOALS.quizzes;
  const awarded = (data.game.awardedMissions || []).includes(today);
  return {
    date: today,
    goals: MISSION_GOALS,
    progress: { tasks, minutes, quizzes },
    completed,
    awarded,
    rewardXp: MISSION_XP,
  };
}

export async function awardMissionIfNeeded(userId, today, mission) {
  if (!mission.completed) return false;
  try {
    const updated = await GameProfile.findOneAndUpdate(
      { userId, awardedMissions: { $ne: today } },
      { $push: { awardedMissions: today } },
      { new: true }
    );
    if (updated) return true;
    const exists = await GameProfile.exists({ userId });
    if (exists) return false; // already awarded today
    await GameProfile.create({ userId, awardedMissions: [today] });
    return true;
  } catch (err) {
    // Duplicate key from a concurrent request: the other request granted it
    if (err.code !== 11000) console.error('Mission award error:', err.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// "What should I study now?"
// ---------------------------------------------------------------------------
export function recommendNext(data, today, subjectMetrics, weakAreas, exams) {
  const pending = data.plans.filter((p) => p.status === 'Pending');
  if (!pending.length) return null;
  const metricOf = (s) => subjectMetrics.find((m) => m.subject === s);
  const upcoming = exams.filter((e) => e.daysLeft >= 0);

  const scored = pending.map((p) => {
    const d = diffDays(p.date, today);
    const sm = metricOf(p.subject);
    const topicWeak = weakAreas.find((w) => w.subject === p.subject && topicsMatch(normTopic(w.topic), normTopic(p.topic)));
    const exam = upcoming.filter((e) => e.subject === p.subject).sort((a, b) => a.daysLeft - b.daysLeft)[0];

    let duePts = 0;
    if (d < 0) duePts = 40 + Math.min(-d, 7) * 2;
    else if (d === 0) duePts = 36;
    else if (d === 1) duePts = 28;
    else if (d <= 3) duePts = 20;
    else if (d <= 7) duePts = 10;

    const priorityPts = PRIORITY_POINTS[p.priority] || 18;
    const weakPts = (sm?.weakness ?? 0) * 0.2 + (topicWeak?.score ?? 0) * 0.1;
    const completionPts = sm && sm.total >= 2 && sm.completionRate !== null ? (1 - sm.completionRate / 100) * 10 : 0;
    const examPts = exam && exam.daysLeft <= 21 ? ((21 - exam.daysLeft) / 21) * 20 : 0;
    const score = duePts + priorityPts + weakPts + completionPts + examPts;

    const dueText =
      d < 0 ? `was due ${-d} day${-d > 1 ? 's' : ''} ago` : d === 0 ? 'is due today' : d === 1 ? 'is due tomorrow' : `is due in ${d} days`;
    const extras = [];
    if (p.priority === 'High') extras.push('it is High priority');
    if (sm && sm.total >= 2 && sm.completionRate !== null && sm.completionRate < 70) {
      extras.push(`your ${sm.label} completion rate is currently ${sm.completionRate}%`);
    }
    if (sm?.avgConfidence !== null && sm?.avgConfidence <= 3) {
      extras.push(`your ${sm.label} confidence is ${sm.avgConfidence}/5`);
    }
    if (exam && exam.daysLeft <= 21) {
      extras.push(`${exam.name} is in ${exam.daysLeft} day${exam.daysLeft === 1 ? '' : 's'}`);
    }
    const clauses = [`This task ${dueText}`, ...extras.slice(0, 2)];
    const reason =
      clauses.length === 1
        ? `${clauses[0]}.`
        : clauses.length === 2
        ? `${clauses[0]} and ${clauses[1]}.`
        : `${clauses[0]}, ${clauses[1]} and ${clauses[2]}.`;

    return { plan: p, score, reason, overdue: d < 0, daysUntilDue: d };
  });

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      (PRIORITY_RANK[b.plan.priority] || 0) - (PRIORITY_RANK[a.plan.priority] || 0) ||
      a.plan.date.localeCompare(b.plan.date) ||
      a.plan.time.localeCompare(b.plan.time)
  );
  const top = scored[0];
  const p = top.plan;
  return {
    plan: {
      _id: p._id,
      subject: p.subject,
      subjectLabel: labelOf(p.subject),
      topic: p.topic,
      priority: p.priority,
      date: p.date,
      time: p.time,
      notes: p.notes || '',
      estimatedMinutes: estMin(p),
    },
    reason: top.reason,
    overdue: top.overdue,
    daysUntilDue: top.daysUntilDue,
    alternatives: scored.slice(1, 3).map((s) => ({
      _id: s.plan._id,
      subject: s.plan.subject,
      subjectLabel: labelOf(s.plan.subject),
      topic: s.plan.topic,
      priority: s.plan.priority,
      date: s.plan.date,
      estimatedMinutes: estMin(s.plan),
    })),
  };
}

// ---------------------------------------------------------------------------
// AI Study Coach (data-driven mentor messages)
// ---------------------------------------------------------------------------
export function computeCoach(data, today, ctx) {
  const { subjectMetrics, weakAreas, exams, streaks, mission, bestTime } = ctx;
  const msgs = [];

  const missed = data.plans.filter((p) => isMissed(p, today));
  if (missed.length) {
    msgs.push({
      id: 'missed',
      tone: 'warn',
      text: `You have ${missed.length} overdue study task${missed.length > 1 ? 's' : ''}. A recovery plan can get you back on track.`,
      action: { tab: 'dashboard', label: 'See recovery plan' },
    });
  }

  const topPending = subjectMetrics.filter((m) => m.pending - m.missed >= 0 && m.pending >= 2).sort((a, b) => b.pending - a.pending)[0];
  if (topPending) {
    msgs.push({
      id: 'pending',
      tone: 'info',
      text: `You have ${topPending.pending} pending ${topPending.label} tasks.`,
      action: { tab: 'plans', label: 'Open plans' },
    });
  }

  // Confidence trend per subject (last 7 days vs the 7 days before)
  const since = addDays(today, -6);
  const before = addDays(today, -13);
  for (const m of subjectMetrics) {
    const recent = data.sessions.filter((s) => s.subject === m.subject && s.date >= since && s.date <= today);
    const prior = data.sessions.filter((s) => s.subject === m.subject && s.date >= before && s.date < since);
    if (recent.length && prior.length) {
      const diff = avg(recent.map((s) => s.confidence)) - avg(prior.map((s) => s.confidence));
      if (diff <= -0.5) {
        msgs.push({ id: `conf-down-${m.subject}`, tone: 'warn', text: `Your ${m.label} confidence has decreased this week.`, action: { tab: 'quiz', label: 'Practice', subject: m.subject } });
      } else if (diff >= 0.5) {
        msgs.push({ id: `conf-up-${m.subject}`, tone: 'success', text: `Your ${m.label} confidence has improved this week.` });
      }
    }
  }

  if (streaks.current >= 2) {
    msgs.push({ id: 'streak', tone: 'success', text: `You have maintained a ${streaks.current}-day streak. Keep it going!` });
  } else if (!streaks.activeToday) {
    msgs.push({
      id: 'streak-start',
      tone: 'info',
      text: streaks.current === 1 ? "Complete one study activity today to extend your streak." : 'Complete a task, focus session or quiz today to start a new streak.',
      action: { tab: 'focus', label: 'Start focus' },
    });
  }

  const nextExam = exams.find((e) => e.daysLeft >= 0);
  if (nextExam) {
    msgs.push({
      id: 'exam',
      tone: nextExam.daysLeft <= 7 ? 'warn' : 'info',
      text: `You have your ${nextExam.name} in ${nextExam.daysLeft} day${nextExam.daysLeft === 1 ? '' : 's'}${nextExam.hasData ? ` and your preparation is ${nextExam.preparation}%` : ''}.`,
      action: { tab: 'exams', label: 'View exams' },
    });
  }

  if (weakAreas[0]) {
    const w = weakAreas[0];
    msgs.push({
      id: 'weak',
      tone: 'warn',
      text: `${w.subjectLabel} – ${w.topic} needs attention (${w.reasons[0]}).`,
      action: { tab: 'weak', label: 'View weak areas' },
    });
  }

  if (!mission.completed) {
    const left = [];
    if (mission.progress.tasks < mission.goals.tasks) left.push(`${mission.goals.tasks - mission.progress.tasks} more task${mission.goals.tasks - mission.progress.tasks > 1 ? 's' : ''}`);
    if (mission.progress.minutes < mission.goals.minutes) left.push(`${mission.goals.minutes - mission.progress.minutes} more minutes`);
    if (mission.progress.quizzes < mission.goals.quizzes) left.push('a quiz');
    if (left.length && left.length < 3) {
      msgs.push({ id: 'mission', tone: 'info', text: `Daily mission almost there: ${left.join(' and ')} to go.` });
    }
  }

  if (bestTime.best && bestTime.best.completionRate !== null) {
    msgs.push({ id: 'best-time', tone: 'info', text: `You complete the most tasks around ${bestTime.best.label} (${bestTime.best.completionRate}%). Schedule hard topics then.` });
  }

  if (!data.plans.length) {
    return [{ id: 'start', tone: 'info', text: 'Add your first study plan and I will start coaching you with insights from your own progress.', action: { tab: 'plans', label: 'Add a plan' } }];
  }
  if (!msgs.length) {
    msgs.push({ id: 'all-good', tone: 'success', text: "You're on track. Finish a focus session to keep the momentum going." });
  }
  const toneRank = { warn: 0, success: 1, info: 2 };
  return msgs.sort((a, b) => toneRank[a.tone] - toneRank[b.tone]).slice(0, 5);
}

// ---------------------------------------------------------------------------
// Smart rescheduling / recovery plan
// ---------------------------------------------------------------------------
export function buildRecoveryPlan(data, user, today, nowMinutes, bestHour) {
  const missed = data.plans.filter((p) => isMissed(p, today));
  if (!missed.length) return { missedCount: 0, suggestions: [], summary: 'No missed tasks.' };

  const exams = computeExams(data, today).filter((e) => e.daysLeft >= 0);
  const examFor = (subject) => exams.filter((e) => e.subject === subject).sort((a, b) => a.daysLeft - b.daysLeft)[0];

  const urgency = (p) => {
    const exam = examFor(p.subject);
    const examPts = exam ? Math.max(0, 30 - exam.daysLeft) : 0;
    const overdueDays = Math.min(diffDays(today, p.date), 14);
    return (PRIORITY_RANK[p.priority] || 2) * 10 + examPts + overdueDays;
  };
  const queue = [...missed].sort((a, b) => urgency(b) - urgency(a));

  // Existing schedule load (pending tasks that are not being moved)
  const missedIds = new Set(missed.map((p) => String(p._id)));
  const busy = new Map(); // date -> [{start,end}]
  data.plans
    .filter((p) => p.status === 'Pending' && p.date >= today && !missedIds.has(String(p._id)))
    .forEach((p) => {
      const start = minutesOfTime(p.time);
      if (!busy.has(p.date)) busy.set(p.date, []);
      busy.get(p.date).push({ start, end: start + estMin(p) });
    });

  const capacity = Math.max(60, (user.targetHoursPerDay || 4) * 60);
  const preferredStart = (bestHour ?? 18) * 60;
  const dayEnd = 22 * 60 + 30;
  const suggestions = [];

  for (const p of queue) {
    const duration = estMin(p);
    let placed = null;
    for (let offset = 0; offset < 21 && !placed; offset++) {
      const date = addDays(today, offset);
      const slots = (busy.get(date) || []).sort((a, b) => a.start - b.start);
      const used = slots.reduce((a, s) => a + (s.end - s.start), 0);
      if (used + duration > capacity && slots.length > 0) continue;

      let start = preferredStart;
      if (offset === 0) start = Math.max(start, Math.ceil((nowMinutes + 15) / 15) * 15);
      for (const s of slots) {
        if (start < s.end + 10 && start + duration + 10 > s.start) start = s.end + 10;
      }
      if (start + duration <= dayEnd) {
        placed = { date, start };
        if (!busy.has(date)) busy.set(date, []);
        busy.get(date).push({ start, end: start + duration });
      }
    }
    if (!placed) {
      // Fall back to the next day at the preferred time when everything is saturated
      const date = addDays(today, 1);
      placed = { date, start: preferredStart };
    }

    const exam = examFor(p.subject);
    const reasonParts = [`Missed on ${p.date}`, `${p.priority} priority`];
    if (exam && exam.daysLeft <= 30) reasonParts.push(`${exam.name} in ${exam.daysLeft} day${exam.daysLeft === 1 ? '' : 's'}`);
    suggestions.push({
      planId: p._id,
      subject: p.subject,
      subjectLabel: labelOf(p.subject),
      topic: p.topic,
      priority: p.priority,
      estimatedMinutes: duration,
      originalDate: p.date,
      originalTime: p.time,
      newDate: placed.date,
      newTime: timeFromMinutes(placed.start),
      reason: reasonParts.join(' • '),
      beforeExam: exam ? placed.date <= exam.date : null,
    });
  }

  suggestions.sort((a, b) => a.newDate.localeCompare(b.newDate) || a.newTime.localeCompare(b.newTime));
  const lastDate = suggestions[suggestions.length - 1].newDate;
  const totalMin = suggestions.reduce((a, s) => a + s.estimatedMinutes, 0);
  return {
    missedCount: missed.length,
    suggestions,
    totalMinutes: totalMin,
    spanDays: diffDays(lastDate, today) + 1,
    summary: `${suggestions.length} missed task${suggestions.length > 1 ? 's' : ''} spread over ${diffDays(lastDate, today) + 1} day${diffDays(lastDate, today) > 0 ? 's' : ''} (${Math.round(totalMin / 60 * 10) / 10} hours total), high priority and exam-linked topics first.`,
  };
}

// ---------------------------------------------------------------------------
// Monthly analysis
// ---------------------------------------------------------------------------
function subjectSnapshot(plans, sessions, quizzes, today) {
  return CANONICAL_SUBJECTS.map((subject) => {
    const sp = plans.filter((p) => normalizeCanonicalSubject(p.subject) === subject);
    const completed = sp.filter((p) => p.status === 'Completed').length;
    const missed = sp.filter((p) => isMissed(p, today)).length;
    const ss = sessions.filter((s) => normalizeCanonicalSubject(s.subject) === subject);
    const qs = quizzes.filter((q) => normalizeCanonicalSubject(q.subject) === subject);
    const weakness = weaknessFromParts({
      completed,
      missed,
      confs: ss.map((s) => s.confidence),
      quizCorrect: qs.reduce((a, q) => a + q.correctCount, 0),
      quizTotal: qs.reduce((a, q) => a + q.totalQuestions, 0),
      cardAgain: 0,
      cardGot: 0,
    });
    return {
      subject,
      label: labelOf(subject),
      total: sp.length,
      completed,
      missed,
      pending: sp.length - completed - missed,
      completionRate: pct(completed, sp.length),
      minutes: Math.round(ss.reduce((a, s) => a + s.durationSeconds / 60, 0)),
      sessions: ss.length,
      avgConfidence: ss.length ? round(avg(ss.map((s) => s.confidence)), 1) : null,
      quizAverage: qs.length ? Math.round(avg(qs.map((q) => q.scorePercent))) : null,
      quizCount: qs.length,
      strength: weakness === null ? null : 100 - weakness,
    };
  });
}

export function computeMonthly(data, monthStr, today) {
  const { start, end, days } = monthRange(monthStr);
  const inMonth = (d) => d >= start && d <= end;
  const plans = data.plans.filter((p) => inMonth(p.date));
  const sessions = data.sessions.filter((s) => inMonth(s.date));
  const quizzes = data.quizzes.filter((q) => inMonth(q.date));

  const completed = plans.filter((p) => p.status === 'Completed').length;
  const missed = plans.filter((p) => isMissed(p, today)).length;
  const pending = plans.length - completed - missed;

  const totalMinutes = sessions.reduce((a, s) => a + s.durationSeconds / 60, 0);
  const elapsedDays = today < start ? 0 : today > end ? days : diffDays(today, start) + 1;
  const subjects = subjectSnapshot(plans, sessions, quizzes, today);

  const prev = prevMonth(monthStr);
  const prevRange = monthRange(prev);
  const prevSubjects = subjectSnapshot(
    data.plans.filter((p) => p.date >= prevRange.start && p.date <= prevRange.end),
    data.sessions.filter((s) => s.date >= prevRange.start && s.date <= prevRange.end),
    data.quizzes.filter((q) => q.date >= prevRange.start && q.date <= prevRange.end),
    today
  );
  const withDelta = subjects.map((s) => {
    const p = prevSubjects.find((x) => x.subject === s.subject);
    const comparable = p && p.total >= 2 && s.total >= 2 && p.completionRate !== null && s.completionRate !== null;
    return { ...s, previousRate: p?.completionRate ?? null, delta: comparable ? s.completionRate - p.completionRate : null };
  });

  const active = withDelta.filter((s) => s.total > 0 || s.minutes > 0);
  const mostStudied = [...withDelta].filter((s) => s.minutes > 0).sort((a, b) => b.minutes - a.minutes)[0] || null;
  const leastCompleted = [...withDelta].filter((s) => s.total > 0).sort((a, b) => a.completionRate - b.completionRate || b.missed - a.missed)[0] || null;
  const scored = withDelta.filter((s) => s.strength !== null);
  const strongest = [...scored].sort((a, b) => b.strength - a.strength)[0] || null;
  const weakest = [...scored].sort((a, b) => a.strength - b.strength)[0] || null;

  // Activity within the month
  const activity = computeActivity({ plans: data.plans, sessions: data.sessions, quizzes: data.quizzes });
  const monthActiveDates = [...activity.keys()].filter(inMonth);
  const longestStreak = longestStreakOf(monthActiveDates);

  // Most productive weekday
  const dayStats = Array.from({ length: 7 }, (_, i) => ({ weekday: i, name: WEEKDAY_NAMES[i], tasks: 0, minutes: 0 }));
  monthActiveDates.forEach((d) => {
    const a = activity.get(d);
    const ds = dayStats[weekdayOf(d)];
    ds.tasks += a.tasks;
    ds.minutes += a.minutes;
  });
  const productive = [...dayStats].filter((d) => d.tasks > 0 || d.minutes > 0).sort((a, b) => b.tasks - a.tasks || b.minutes - a.minutes)[0] || null;

  // Weekly performance
  const weekRanges = [];
  for (let s = 1; s <= days; s += 7) weekRanges.push({ from: s, to: Math.min(days, s + 6) });
  const dayOf = (d) => parseInt(d.slice(8, 10), 10);
  const weekly = weekRanges.map((w, i) => {
    const wp = plans.filter((p) => dayOf(p.date) >= w.from && dayOf(p.date) <= w.to);
    const done = wp.filter((p) => p.status === 'Completed').length;
    const ws = sessions.filter((s) => dayOf(s.date) >= w.from && dayOf(s.date) <= w.to);
    return {
      week: i + 1,
      label: `Week ${i + 1}`,
      range: `${w.from}–${w.to}`,
      planned: wp.length,
      completed: done,
      missed: wp.filter((p) => isMissed(p, today)).length,
      completionRate: pct(done, wp.length),
      minutes: Math.round(ws.reduce((a, s) => a + s.durationSeconds / 60, 0)),
    };
  });

  // Productivity trend (daily series up to today)
  const lastDay = today > end ? end : today < start ? start : today;
  const trend = [];
  if (today >= start) {
    for (let d = start; d <= lastDay; d = addDays(d, 1)) {
      const a = activity.get(d);
      trend.push({ date: d, tasks: a?.tasks || 0, minutes: a ? Math.round(a.minutes) : 0 });
    }
  }
  const ratedWeeks = weekly.filter((w) => w.completionRate !== null && w.planned > 0);
  let trendLabel = 'Not enough data';
  if (ratedWeeks.length >= 2) {
    const delta = ratedWeeks[ratedWeeks.length - 1].completionRate - ratedWeeks[ratedWeeks.length - 2].completionRate;
    trendLabel = delta > 5 ? 'Improving' : delta < -5 ? 'Declining' : 'Steady';
  }

  const stats = {
    month: monthStr,
    totalPlans: plans.length,
    completed,
    pending,
    missed,
    completionRate: pct(completed, plans.length) ?? 0,
    totalStudyHours: round(totalMinutes / 60, 1),
    avgStudyHoursPerDay: elapsedDays ? round(totalMinutes / 60 / elapsedDays, 2) : 0,
    focusSessions: sessions.length,
    mostStudiedSubject: mostStudied ? { subject: mostStudied.subject, label: mostStudied.label, minutes: mostStudied.minutes } : null,
    leastCompletedSubject: leastCompleted ? { subject: leastCompleted.subject, label: leastCompleted.label, completionRate: leastCompleted.completionRate } : null,
    strongestSubject: strongest ? { subject: strongest.subject, label: strongest.label, strength: strongest.strength } : null,
    weakestSubject: weakest && weakest.subject !== strongest?.subject ? { subject: weakest.subject, label: weakest.label, strength: weakest.strength } : null,
    longestStreak,
    averageQuizScore: quizzes.length ? Math.round(avg(quizzes.map((q) => q.scorePercent))) : null,
    quizCount: quizzes.length,
    averageConfidence: sessions.length ? round(avg(sessions.map((s) => s.confidence)), 1) : null,
    mostProductiveDay: productive ? { name: productive.name, tasks: productive.tasks, minutes: Math.round(productive.minutes) } : null,
    trendLabel,
  };

  return { stats, weekly, subjects: active, trend, hasData: plans.length > 0 || sessions.length > 0 || quizzes.length > 0 };
}

// Rule-based narrative built only from the computed monthly stats
export function monthlyInsightFallback(monthly, monthLabel) {
  const { stats, subjects, hasData } = monthly;
  if (!hasData) return [`No study activity has been recorded for ${monthLabel} yet. Add plans and complete tasks to unlock your insight.`];
  const lines = [];
  lines.push(
    `You completed ${stats.completed} of ${stats.totalPlans} planned task${stats.totalPlans === 1 ? '' : 's'} (${stats.completionRate}%)` +
      (stats.focusSessions ? ` and logged ${stats.totalStudyHours} hours across ${stats.focusSessions} focus session${stats.focusSessions === 1 ? '' : 's'}.` : '.')
  );
  const improved = subjects.filter((s) => s.delta !== null && s.delta >= 10).sort((a, b) => b.delta - a.delta)[0];
  if (improved) lines.push(`You improved your ${improved.label} completion rate this month (${improved.previousRate}% → ${improved.completionRate}%).`);
  if (stats.strongestSubject) lines.push(`${stats.strongestSubject.label} was your strongest subject.`);
  const dropped = subjects.filter((s) => s.delta !== null && s.delta <= -10).sort((a, b) => a.delta - b.delta)[0];
  if (dropped) {
    lines.push(`${dropped.label} needs more attention because your completion rate dropped (${dropped.previousRate}% → ${dropped.completionRate}%).`);
  } else if (stats.weakestSubject) {
    lines.push(`${stats.weakestSubject.label} needs more attention based on completion, confidence and quiz results.`);
  } else if (stats.leastCompletedSubject && stats.leastCompletedSubject.completionRate < 70) {
    lines.push(`${stats.leastCompletedSubject.label} has the lowest completion (${stats.leastCompletedSubject.completionRate}%).`);
  }
  if (stats.averageQuizScore !== null) lines.push(`Your average quiz score was ${stats.averageQuizScore}% over ${stats.quizCount} quiz${stats.quizCount === 1 ? '' : 'zes'}.`);
  if (stats.mostProductiveDay) lines.push(`${stats.mostProductiveDay.name} is your most productive day.`);
  return lines;
}
