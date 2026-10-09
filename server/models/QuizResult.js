import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: String,
    options: [String],
    correctIndex: Number,
    selectedIndex: { type: Number, default: null },
    isCorrect: Boolean,
    explanation: String,
    topic: String,
  },
  { _id: false }
);

const quizResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true },
    topic: { type: String, default: '' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    source: { type: String, enum: ['ai', 'bank'], default: 'bank' },
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    scorePercent: { type: Number, required: true },
    questions: [questionSchema],
    topicBreakdown: [
      {
        _id: false,
        topic: String,
        correct: Number,
        total: Number,
      },
    ],
    date: { type: String, required: true }, // student's local YYYY-MM-DD
    hour: { type: Number, default: 0 },
  },
  { timestamps: true }
);

quizResultSchema.index({ userId: 1, date: 1 });

export const QuizResult = mongoose.model('QuizResult', quizResultSchema);
