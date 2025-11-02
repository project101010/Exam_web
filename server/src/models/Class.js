import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  titleLower: { type: String, required: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
  classCode: { type: String, required: true, unique: true, uppercase: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    enrolledAt: { type: Date, default: Date.now },
  }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

// Create unique compound index on teacher and titleLower for case-insensitive uniqueness
classSchema.index({ teacher: 1, titleLower: 1 }, { unique: true });

// Generate unique 8-digit classCode before saving
classSchema.pre('validate', async function(next) {
  if (!this.classCode) {
    let code;
    let exists = true;
    while (exists) {
      code = Math.floor(10000000 + Math.random() * 90000000).toString(); // 8-digit
      exists = await mongoose.models.Class.findOne({ classCode: code });
    }
    this.classCode = code;
  }
  next();
});

const Class = mongoose.model('Class', classSchema);

export default Class;
