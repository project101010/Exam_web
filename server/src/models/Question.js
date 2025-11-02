import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  questionText: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ['mcq', 'multiple', 'text', 'code'],
    default: 'mcq',
  },
  options: [{
    type: String,
  }],
  correctAnswers: [{
    type: String,
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  tags: [{
    type: String,
  }],
  points: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
