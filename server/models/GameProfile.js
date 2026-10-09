import mongoose from 'mongoose';

const gameProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // Dates (YYYY-MM-DD) whose daily mission reward has already been granted
    awardedMissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const GameProfile = mongoose.model('GameProfile', gameProfileSchema);
