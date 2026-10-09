import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan', default: null },
    subject: { type: String, required: true },
    topic: { type: String, required: true, trim: true },
    goal: { type: String, default: '', trim: true },
    goalMinutes: { type: Number, default: 25 },
    durationSeconds: { type: Number, required: true, min: 0 },
    confidence: { type: Number, min: 1, max: 5, required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    date: { type: String, required: true }, // student's local YYYY-MM-DD when session ended
    startHour: { type: Number, default: 0 }, // student's local hour (0-23) when session started
  },
  { timestamps: true }
);

focusSessionSchema.index({ userId: 1, date: 1 });

export const FocusSession = mongoose.model('FocusSession', focusSessionSchema);
