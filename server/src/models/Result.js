import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // questionId: answer
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  maxScore: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  isPassed: {
    type: Boolean,
    default: false,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  timeTaken: {
    type: Number, // in minutes
  },
  feedback: {
    type: String,
  },
  cheatingFlags: {
    tabSwitches: {
      type: Number,
      default: 0,
    },
    fullscreenExits: {
      type: Number,
      default: 0,
    },
    suspiciousActivities: [{
      type: {
        type: String,
        enum: ['tab_switch', 'fullscreen_exit', 'copy_paste', 'right_click'],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      description: String,
    }],
    isSuspicious: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

// Compound index to ensure one result per student per exam
resultSchema.index({ exam: 1, student: 1 }, { unique: true });

const Result = mongoose.model('Result', resultSchema);

export default Result;
