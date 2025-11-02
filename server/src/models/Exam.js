import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1,
  },
  passPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  instructions: {
    type: String,
    trim: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sections: [{
    name: {
      type: String,
      required: true,
    },
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    }],
    totalMarks: Number,
    randomizeQuestions: {
      type: Boolean,
      default: false,
    },
  }],
  isPublished: {
    type: Boolean,
    default: false,
  },
  scheduledAt: {
    type: Date,
  },
  accessCode: {
    type: String,
    trim: true,
  },
  antiCheating: {
    requireFullscreen: {
      type: Boolean,
      default: true,
    },
    monitorTabs: {
      type: Boolean,
      default: true,
    },
    preventCopyPaste: {
      type: Boolean,
      default: true,
    },
    preventRightClick: {
      type: Boolean,
      default: true,
    },
    maxTabSwitches: {
      type: Number,
      default: 3,
    },
    maxFullscreenExits: {
      type: Number,
      default: 2,
    },
  },
}, {
  timestamps: true,
});

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
