import mongoose from 'mongoose';

const flashcardReviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardKey: { type: String, required: true }, // normalised subject + front
    subject: { type: String, required: true },
    topic: { type: String, default: '' },
    front: { type: String, required: true },
    back: { type: String, required: true },
    againCount: { type: Number, default: 0 },
    gotItCount: { type: Number, default: 0 },
    lastResult: { type: String, enum: ['again', 'got_it'], default: 'got_it' },
    lastReviewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

flashcardReviewSchema.index({ userId: 1, cardKey: 1 }, { unique: true });

export const FlashcardReview = mongoose.model('FlashcardReview', flashcardReviewSchema);
