import Class from '../models/Class.js';
import Exam from '../models/Exam.js';
import User from '../models/User.js';
import Result from '../models/Result.js';
import { Parser } from 'json2csv';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

export const getStudentClasses = async (req, res) => {
  try {
    const userId = req.user._id;
    const classes = await Class.find({ 'students.student': userId, 'students.status': 'approved' })
      .select('title description classCode students')
      .populate('teacher', 'name email');

    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// New controller to import students from CSV
export const importStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user._id;

    const classDoc = await Class.findOne({ _id: classId, teacher: teacherId, isDeleted: false });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const added = [];
        const errors = [];

        for (const row of results) {
          const { name, email } = row;
          if (!name || !email) {
            errors.push({ row, error: 'Missing name or email' });
            continue;
          }

          try {
            let user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
              user = new User({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                role: 'student',
                password: 'password123', // default password
              });
              await user.save();
            }

            const existing = classDoc.students.find(s => s.student.toString() === user._id.toString());
            if (existing) {
              errors.push({ row, error: 'Already enrolled' });
              continue;
            }

            classDoc.students.push({
              student: user._id,
              status: 'pending',
            });
            added.push({ name, email });
          } catch (err) {
            errors.push({ row, error: err.message });
          }
        }

        await classDoc.save();
        fs.unlinkSync(req.file.path);

        res.json({ message: `Imported ${added.length} students`, added, errors });
      })
      .on('error', (err) => {
        res.status(500).json({ message: 'Error parsing CSV' });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const classes = await Class.find({ teacher: teacherId, isDeleted: false })
      .populate('students.student', 'name email');

    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDeletedClasses = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const classes = await Class.find({
      teacher: teacherId,
      isDeleted: true,
      deletedAt: { $gte: twoDaysAgo }
    })
      .populate('students.student', 'name email');

    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const joinClass = async (req, res) => {
  try {
    const { classCode } = req.body;
    const studentId = req.user._id;

    if (!classCode) {
      return res.status(400).json({ message: 'Class code is required' });
    }

    const classDoc = await Class.findOne({ classCode: classCode.toUpperCase() });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if student is already enrolled
    const existingEnrollment = classDoc.students.find(
      s => s.student.toString() === studentId.toString()
    );

    if (existingEnrollment) {
      return res.status(409).json({ message: 'Already enrolled in this class' });
    }

    classDoc.students.push({
      student: studentId,
      status: 'pending',
    });

    await classDoc.save();

    res.json({ message: 'Joined class successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const createClass = async (req, res) => {
  try {
    const { title, description } = req.body;
    const teacherId = req.user._id;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const trimmedTitle = title.trim();

    // Check if a class with the same title (case-insensitive) already exists for this teacher
    const existingClass = await Class.findOne({ teacher: teacherId, titleLower: trimmedTitle.toLowerCase() });
    if (existingClass) {
      return res.status(409).json({ message: 'A class with this title already exists for your account' });
    }

    // Only title, description, teacher provided
    const newClass = new Class({
      title: trimmedTitle,
      titleLower: trimmedTitle.toLowerCase(),
      description,
      teacher: teacherId,
    });

    await newClass.validate(); // trigger pre('validate') to generate classCode
    await newClass.save();

    res.status(201).json({
      message: 'Class created successfully!',
      class: {
        _id: newClass._id,
        title: newClass.title,
        description: newClass.description,
        classCode: newClass.classCode,
        students: [],
        createdAt: newClass.createdAt,
        updatedAt: newClass.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) { // Duplicate key error
      res.status(409).json({ message: 'A class with this title already exists for your account' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};


export const approveStudent = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;
    const teacherId = req.user._id;

    const classDoc = await Class.findOne({ _id: classId, teacher: teacherId });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const studentEnrollment = classDoc.students.find(
      s => s.student.toString() === studentId
    );

    if (!studentEnrollment) {
      return res.status(404).json({ message: 'Student not found in class' });
    }

    studentEnrollment.status = 'approved';
    await classDoc.save();

    res.json({ message: 'Student approved!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectStudent = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;
    const teacherId = req.user._id;

    const classDoc = await Class.findOne({ _id: classId, teacher: teacherId });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const studentEnrollment = classDoc.students.find(
      s => s.student.toString() === studentId
    );

    if (!studentEnrollment) {
      return res.status(404).json({ message: 'Student not found in class' });
    }

    studentEnrollment.status = 'rejected';
    await classDoc.save();

    res.json({ message: 'Student rejected!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const bulkApproveStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentIds } = req.body;
    const teacherId = req.user._id;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'studentIds must be a non-empty array' });
    }

    const classDoc = await Class.findOne({ _id: classId, teacher: teacherId });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    let approvedCount = 0;
    studentIds.forEach(studentId => {
      const studentEnrollment = classDoc.students.find(
        s => s.student.toString() === studentId
      );
      if (studentEnrollment && studentEnrollment.status !== 'approved') {
        studentEnrollment.status = 'approved';
        approvedCount++;
      }
    });

    await classDoc.save();

    res.json({ message: `${approvedCount} student(s) approved!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const bulkRejectStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentIds } = req.body;
    const teacherId = req.user._id;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'studentIds must be a non-empty array' });
    }

    const classDoc = await Class.findOne({ _id: classId, teacher: teacherId });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    let rejectedCount = 0;
    studentIds.forEach(studentId => {
      const studentEnrollment = classDoc.students.find(
        s => s.student.toString() === studentId
      );
      if (studentEnrollment && studentEnrollment.status !== 'rejected') {
        studentEnrollment.status = 'rejected';
        rejectedCount++;
      }
    });

    await classDoc.save();

    res.json({ message: `${rejectedCount} student(s) rejected!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

  
// New controller to delete all rejected students in a class
export const deleteRejectedStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user._id;

    const classDoc = await Class.findOne({ _id: classId, teacher: teacherId });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    classDoc.students = classDoc.students.filter(
      s => s.status !== 'rejected'
    );

    await classDoc.save();

    res.json({ message: 'All rejected students deleted!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// New controller to soft delete a class with checks and 2-day recovery window
export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user._id;

    const classDoc = await Class.findOne({ _id: classId, teacher: teacherId, isDeleted: false });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found or already deleted' });
    }

    // Check if class has any approved students
    const hasApprovedStudents = classDoc.students.some(s => s.status === 'approved');
    if (hasApprovedStudents) {
      return res.status(400).json({ message: 'Cannot delete class with approved students' });
    }

    // Check if class has any exams (assuming Exam model is imported)
    const examCount = await Exam.countDocuments({ class: classId });
    if (examCount > 0) {
      return res.status(400).json({ message: 'Cannot delete class with active exams' });
    }

    // Soft delete: mark isDeleted and set deletedAt timestamp
    classDoc.isDeleted = true;
    classDoc.deletedAt = new Date();

    await classDoc.save();

    res.json({ message: 'Class deleted successfully. It can be recovered within 2 days.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// New controller to recover a deleted class within 2 days
export const recoverClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user._id;

    const classDoc = await Class.findOne({ _id: classId, teacher: teacherId, isDeleted: true });

    if (!classDoc) {
      return res.status(404).json({ message: 'Deleted class not found' });
    }

    // Check if within 2 days
    const now = new Date();
    const deletedAt = new Date(classDoc.deletedAt);
    const diffTime = Math.abs(now - deletedAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 2) {
      return res.status(400).json({ message: 'Recovery period has expired. Class has been permanently deleted.' });
    }

    // Recover: unset isDeleted and deletedAt
    classDoc.isDeleted = false;
    classDoc.deletedAt = undefined;

    await classDoc.save();

    res.json({ message: 'Class recovered successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description } = req.body;
    const teacherId = req.user._id;

    const classDoc = await Class.findOne({ _id: classId, teacher: teacherId, isDeleted: false });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const trimmedTitle = title.trim();

    // Check if another class with the same title (case-insensitive) exists for this teacher
    const existingClass = await Class.findOne({
      teacher: teacherId,
      titleLower: trimmedTitle.toLowerCase(),
      _id: { $ne: classId } // Exclude current class
    });
    if (existingClass) {
      return res.status(409).json({ message: 'A class with this title already exists for your account' });
    }

    // Update fields
    classDoc.title = trimmedTitle;
    classDoc.titleLower = trimmedTitle.toLowerCase();
    classDoc.description = description || '';

    await classDoc.save();

    res.json({
      message: 'Class updated successfully!',
      class: {
        _id: classDoc._id,
        title: classDoc.title,
        description: classDoc.description,
        classCode: classDoc.classCode,
        students: classDoc.students,
        createdAt: classDoc.createdAt,
        updatedAt: classDoc.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) { // Duplicate key error
      res.status(409).json({ message: 'A class with this title already exists for your account' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// Function to permanently delete expired deleted classes (older than 2 days)
export const deleteExpiredClasses = async () => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const result = await Class.deleteMany({
      isDeleted: true,
      deletedAt: { $lt: twoDaysAgo }
    });

    if (result.deletedCount > 0) {
      console.log(`Permanently deleted ${result.deletedCount} expired classes`);
    }
  } catch (error) {
    console.error('Error deleting expired classes:', error);
  }
};

import PDFDocument from 'pdfkit';
import stream from 'stream';

// New controller to export class data as CSV or PDF with filters
export const exportClassData = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId, examId, format } = req.query;
    const teacherId = req.user._id;

    const classDoc = await Class.findOne({ _id: classId, teacher: teacherId, isDeleted: false })
      .populate('students.student', 'name email');

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Filter exams by examId if provided
    let examFilter = { class: classId };
    if (examId) {
      examFilter._id = examId;
    }
    const exams = await Exam.find(examFilter).select('title');

    // Filter students by studentId if provided
    let students = classDoc.students;
    if (studentId) {
      students = students.filter(s => s.student._id.toString() === studentId);
    }

    const examIds = exams.map(exam => exam._id);
    const studentIds = students.map(s => s.student._id);

    const results = await Result.find({
      exam: { $in: examIds },
      student: { $in: studentIds }
    }).populate('exam', 'title').populate('student', 'name email');

    if (format === 'pdf') {
      // Generate PDF
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${classDoc.title}-data.pdf"`);
        res.send(pdfData);
      });

      doc.fontSize(18).text(`Class Data Report: ${classDoc.title}`, { align: 'center' });
      doc.moveDown();

      students.forEach(studentEnrollment => {
        const student = studentEnrollment.student;
        doc.fontSize(14).text(`Student: ${student.name} (${student.email}) - Status: ${studentEnrollment.status}`);
        exams.forEach(exam => {
          const result = results.find(r => r.exam._id.toString() === exam._id.toString() && r.student._id.toString() === student._id.toString());
          if (result) {
            doc.fontSize(12).list([
              `${exam.title} Score: ${result.score}`,
              `${exam.title} Max Score: ${result.maxScore}`,
              `${exam.title} Percentage: ${result.percentage}`,
              `${exam.title} Passed: ${result.isPassed ? 'Yes' : 'No'}`
            ]);
          } else {
            doc.fontSize(12).text(`${exam.title}: No result`);
          }
        });
        doc.moveDown();
      });

      doc.end();
    } else {
      // Default CSV export
      const csvData = [];

      students.forEach(studentEnrollment => {
        const student = studentEnrollment.student;
        const row = {
          'Student Name': student.name,
          'Email': student.email,
          'Status': studentEnrollment.status,
        };

        exams.forEach(exam => {
          const result = results.find(r => r.exam._id.toString() === exam._id.toString() && r.student._id.toString() === student._id.toString());
          if (result) {
            row[`${exam.title} Score`] = result.score;
            row[`${exam.title} Max Score`] = result.maxScore;
            row[`${exam.title} Percentage`] = result.percentage;
            row[`${exam.title} Passed`] = result.isPassed ? 'Yes' : 'No';
          } else {
            row[`${exam.title} Score`] = 'N/A';
            row[`${exam.title} Max Score`] = 'N/A';
            row[`${exam.title} Percentage`] = 'N/A';
            row[`${exam.title} Passed`] = 'N/A';
          }
        });

        csvData.push(row);
      });

      const parser = new Parser();
      const csv = parser.parse(csvData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${classDoc.title}-data.csv"`);
      res.send(csv);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


