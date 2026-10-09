import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    avatar: {
      type: String,
      default: '🎓',
    },
    college: {
      type: String,
      default: 'Computer Science & Engineering',
    },
    semester: {
      type: String,
      default: 'Semester 4',
    },
    targetHoursPerDay: {
      type: Number,
      default: 4,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
