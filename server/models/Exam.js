import mongoose from 'mongoose';
import { ALLOWED_SUBJECTS } from './StudyPlan.js';

const examSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Please enter an exam name'], trim: true },
    subject: { type: String, required: true, enum: ALLOWED_SUBJECTS },
    date: { type: String, required: true }, // YYYY-MM-DD
    // Optional: total syllabus topics. If omitted, topics are counted from the student's study plans.
    totalTopics: { type: Number, default: null, min: 1 },
    topics: { type: [String], default: [] },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export const Exam = mongoose.model('Exam', examSchema);
