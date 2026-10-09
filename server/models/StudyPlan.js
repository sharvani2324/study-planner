import mongoose from 'mongoose';

export const CANONICAL_SUBJECTS = [
  'DAA',
  'Backend',
  'Python',
  'Mathematics',
  'DBMS',
  'ACS',
  'Web Development',
  'P and S'
];

export const ALLOWED_SUBJECTS = [
  'DAA',
  'Backend',
  'Python',
  'Mathematics',
  'Maths',
  'DBMS',
  'ACS',
  'Web Development',
  'WebDevelopment',
  'P and S',
  'PandS',
  'PNS'
];

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Please select a subject'],
      enum: {
        values: ALLOWED_SUBJECTS,
        message: '{VALUE} is not a supported subject. Allowed: DAA, Backend, Python, Mathematics, DBMS, ACS, Web Development, P and S',
      },
    },
    topic: {
      type: String,
      required: [true, 'Please enter a topic'],
      trim: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Please select a date'],
    },
    time: {
      type: String, // HH:mm
      required: [true, 'Please select a time'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    // Estimated study duration in minutes (used by recommendations & recovery plans)
    estimatedMinutes: {
      type: Number,
      default: 30,
      min: 5,
      max: 480,
    },
    // Completion tracking (set when status becomes Completed)
    completedAt: { type: Date, default: null },
    completedDate: { type: String, default: null }, // student's local YYYY-MM-DD
    completedHour: { type: Number, default: null }, // student's local hour 0-23
  },
  {
    timestamps: true,
  }
);

// Helpful index for querying plans by user and date
studyPlanSchema.index({ userId: 1, date: 1 });
studyPlanSchema.index({ userId: 1, subject: 1 });
studyPlanSchema.index({ userId: 1, status: 1 });

export const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
