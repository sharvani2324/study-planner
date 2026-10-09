import { FlashcardReview } from '../models/FlashcardReview.js';
import { ALLOWED_SUBJECTS } from '../models/StudyPlan.js';
import { callGemini, parseJsonLoose, hasGemini } from '../utils/gemini.js';
import { bankFlashcards, SUBJECT_INFO } from '../data/contentBank.js';

const keyOf = (subject, front) => `${subject}::${String(front).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()}`;

// @desc    Generate flashcards (AI when configured, otherwise the built-in bank)
// @route   POST /api/flashcards/generate
export const generateFlashcards = async (req, res) => {
  try {
    const { subject, topic = '', count = 8 } = req.body;
    const isAll = subject === 'All' || subject === 'All Subjects' || subject === 'all';
    if (!isAll && !ALLOWED_SUBJECTS.includes(subject)) {
      return res.status(400).json({ success: false, message: 'Please select a valid subject.' });
    }
    const targetSubject = isAll ? 'All Subjects' : subject;
    const n = Math.min(24, Math.max(3, parseInt(count, 10) || 8));
    const cleanTopic = String(topic).trim();
    let cards = [];
    let source = 'bank';
    let note;

    if (!isAll && hasGemini()) {
      const subjectFull = SUBJECT_INFO[subject] || subject;
      const prompt = `You are a university tutor for "${subjectFull}".
Create exactly ${n} concise flashcards${cleanTopic ? ` on the topic "${cleanTopic}"` : ' covering the core syllabus'}.
Each card has a "front" (a clear question) and a "back" (a short, accurate answer of 1-3 sentences) and a "topic" (specific sub-topic).
Return ONLY valid JSON: {"cards":[{"front":"","back":"","topic":""}]}`;
      const parsed = parseJsonLoose(await callGemini(prompt, { json: true }));
      const list = Array.isArray(parsed) ? parsed : parsed?.cards;
      if (Array.isArray(list)) {
        cards = list
          .map((c) => ({
            front: String(c.front || '').trim(),
            back: String(c.back || '').trim(),
            topic: String(c.topic || cleanTopic || subject).trim(),
            subject: subject,
          }))
          .filter((c) => c.front && c.back)
          .slice(0, n);
        if (cards.length >= 3) source = 'ai';
        else cards = [];
      }
    }

    if (!cards.length) {
      cards = bankFlashcards(targetSubject, cleanTopic, n).cards;
      note = hasGemini()
        ? 'AI generation was unavailable, so cards were taken from the built-in deck.'
        : 'Cards come from the built-in deck. Add GEMINI_API_KEY to server/.env for AI-generated flashcards.';
    }
    if (!cards.length) {
      return res.status(404).json({ success: false, message: 'No flashcards available for this subject yet.' });
    }

    // Mark cards the student has previously found difficult
    const keys = cards.map((c) => keyOf(c.subject || targetSubject, c.front));
    const history = await FlashcardReview.find({ userId: req.user._id, cardKey: { $in: keys } }).lean();
    const historyMap = new Map(history.map((h) => [h.cardKey, h]));
    const withState = cards.map((c, i) => {
      const cardSub = c.subject || targetSubject;
      const h = historyMap.get(keys[i]);
      return {
        ...c,
        subject: cardSub,
        cardKey: keys[i],
        difficult: !!h && (h.againCount > h.gotItCount || h.lastResult === 'again'),
        reviews: h ? h.againCount + h.gotItCount : 0,
      };
    });
    // Difficult cards come first so they get revised first
    withState.sort((a, b) => Number(b.difficult) - Number(a.difficult));

    return res.status(200).json({
      success: true,
      source,
      note,
      subject: targetSubject,
      topic: cleanTopic,
      cards: withState,
      flashcards: withState,
    });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate flashcards.', error: error.message });
  }
};

// @desc    Record a review result (again / got_it) for a card
// @route   POST /api/flashcards/review
export const reviewFlashcard = async (req, res) => {
  try {
    const { subject, topic = '', front, back, result } = req.body;
    const isAll = subject === 'All' || subject === 'All Subjects';
    if ((!isAll && !ALLOWED_SUBJECTS.includes(subject)) || !front || !back || !['again', 'got_it'].includes(result)) {
      return res.status(400).json({ success: false, message: 'Invalid flashcard review.' });
    }
    const doc = await FlashcardReview.findOneAndUpdate(
      { userId: req.user._id, cardKey: keyOf(subject, front) },
      {
        $inc: result === 'again' ? { againCount: 1 } : { gotItCount: 1 },
        $set: { subject, topic: String(topic), front, back, lastResult: result, lastReviewedAt: new Date() },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({ success: true, card: doc });
  } catch (error) {
    console.error('Flashcard review error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save review.', error: error.message });
  }
};

// @desc    Cards the student finds difficult
// @route   GET /api/flashcards/difficult
export const getDifficultCards = async (req, res) => {
  try {
    const all = await FlashcardReview.find({ userId: req.user._id }).lean();
    const difficult = all
      .filter((c) => c.againCount > c.gotItCount || c.lastResult === 'again')
      .sort((a, b) => b.againCount - a.againCount)
      .slice(0, 30);
    return res.status(200).json({
      success: true,
      difficult,
      difficultCards: difficult,
      totals: {
        cards: all.length,
        reviews: all.reduce((a, c) => a + c.againCount + c.gotItCount, 0),
        mastered: all.filter((c) => c.gotItCount > c.againCount && c.lastResult === 'got_it').length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load flashcard progress.', error: error.message });
  }
};
