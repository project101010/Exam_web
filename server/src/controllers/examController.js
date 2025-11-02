import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import Class from '../models/Class.js';
import Question from '../models/Question.js';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

export const getStudentExams = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find classes where student is approved
    const classes = await Class.find({ 'students.student': studentId, 'students.status': 'approved' });
    const classIds = classes.map(c => c._id);

    const exams = await Exam.find({ class: { $in: classIds }, isPublished: true })
      .select('title duration scheduledAt')
      .populate('class', 'title')
      .sort({ scheduledAt: 1 });

    const now = new Date();
    const examsWithStatus = exams.map(exam => {
      let status = 'upcoming';
      if (exam.scheduledAt && exam.scheduledAt <= now) {
        // Check if student has submitted
        const hasResult = false; // TODO: check results
        status = hasResult ? 'completed' : 'ongoing';
      }
      return {
        id: exam._id,
        title: exam.title,
        status,
        date: exam.scheduledAt?.toISOString().split('T')[0],
      };
    });

    res.json(examsWithStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeacherExams = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { search, classId, status, startDate, endDate } = req.query;

    let filter = { teacher: teacherId };

    // Search by title
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // Filter by class
    if (classId) {
      filter.class = classId;
    }

    // Filter by status
    if (status) {
      if (status === 'published') {
        filter.isPublished = true;
      } else if (status === 'draft') {
        filter.isPublished = false;
      }
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const exams = await Exam.find(filter)
      .populate('class', 'title')
      .sort({ createdAt: -1 });

    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const exportGradebook = async (req, res) => {
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
        res.setHeader('Content-Disposition', `attachment; filename="${classDoc.title}-gradebook.pdf"`);
        res.send(pdfData);
      });

      doc.fontSize(18).text(`Gradebook Report: ${classDoc.title}`, { align: 'center' });
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
      res.setHeader('Content-Disposition', `attachment; filename="${classDoc.title}-gradebook.csv"`);
      res.send(csv);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createExam = async (req, res) => {
  try {
    const { title, duration, passPercentage, instructions, classId, sections, accessCode } = req.body;
    const teacherId = req.user._id;

    if (!title || !duration || !passPercentage || !classId || !sections || sections.length === 0) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify teacher owns the class
    const classDoc = await Class.findOne({ _id: classId, teacher: teacherId });
    if (!classDoc) {
      return res.status(403).json({ message: 'Unauthorized to create exam for this class' });
    }

    // Validate that all question IDs exist and belong to the teacher
    for (const section of sections) {
      for (const questionId of section.questions) {
        const question = await Question.findOne({ _id: questionId, teacher: teacherId });
        if (!question) {
          return res.status(400).json({ message: `Question ${questionId} not found or not owned by you` });
        }
      }
    }

    const exam = new Exam({
      title,
      duration,
      passPercentage,
      instructions,
      class: classId,
      teacher: teacherId,
      sections,
      accessCode: accessCode ? accessCode.trim() : undefined,
    });

    await exam.save();

    res.status(201).json({ message: 'Exam created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { accessCode } = req.query;
    const studentId = req.user._id;

    const exam = await Exam.findById(examId).populate('class', 'title');

    if (!exam || !exam.isPublished) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check access code if required
    if (exam.accessCode && exam.accessCode !== accessCode) {
      return res.status(403).json({ message: 'Invalid access code' });
    }

    // Check if student is enrolled in the class
    const classDoc = await Class.findById(exam.class);
    const isEnrolled = classDoc.students.some(
      s => s.student.toString() === studentId.toString() && s.status === 'approved'
    );

    if (!isEnrolled) {
      return res.status(403).json({ message: 'Not authorized to access this exam' });
    }

    // Check if exam is available (scheduled time)
    if (exam.scheduledAt && exam.scheduledAt > new Date()) {
      return res.status(403).json({ message: 'Exam not yet available' });
    }

    // Check if already submitted
    const existingResult = await Result.findOne({ exam: examId, student: studentId });
    if (existingResult) {
      return res.status(403).json({ message: 'Exam already submitted' });
    }

    // Flatten questions from sections and populate them
    const allQuestionIds = exam.sections.flatMap(section => section.questions);
    const questions = await Question.find({ _id: { $in: allQuestionIds } });

    // Create a map for quick lookup
    const questionMap = questions.reduce((map, q) => {
      map[q._id.toString()] = q;
      return map;
    }, {});

    // Build sections with populated questions
    const sectionsWithQuestions = exam.sections.map(section => {
      let sectionQuestions = section.questions.map(qId => {
        const question = questionMap[qId.toString()];
        return {
          id: question._id,
          question: question.questionText,
          type: question.questionType,
          options: question.options,
        };
      });

      // Randomize questions if enabled for this section
      if (section.randomizeQuestions) {
        sectionQuestions = sectionQuestions.sort(() => Math.random() - 0.5);
      }

      return {
        title: section.title,
        instructions: section.instructions,
        questions: sectionQuestions,
      };
    });

    res.json({
      id: exam._id,
      title: exam.title,
      duration: exam.duration,
      instructions: exam.instructions,
      sections: sectionsWithQuestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers, cheatingFlags } = req.body;
    const studentId = req.user._id;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if already submitted
    const existingResult = await Result.findOne({ exam: examId, student: studentId });
    if (existingResult) {
      return res.status(409).json({ message: 'Exam already submitted' });
    }

    // Flatten questions from sections and populate them
    const allQuestionIds = exam.sections.flatMap(section => section.questions);
    const questions = await Question.find({ _id: { $in: allQuestionIds } });

    // Calculate score
    let score = 0;
    const maxScore = questions.length;

    questions.forEach((question) => {
      const questionId = question._id.toString();
      const studentAnswer = answers[questionId];

      if (studentAnswer !== undefined) {
        if (question.questionType === 'mcq') {
          if (studentAnswer === question.correctAnswers[0]) score++;
        } else if (question.questionType === 'multiple') {
          // For multiple choice, check if arrays match
          if (JSON.stringify(studentAnswer.sort()) === JSON.stringify(question.correctAnswers.sort())) score++;
        } else if (question.questionType === 'text' || question.questionType === 'code') {
          // For text/code, simple string comparison (could be improved with NLP)
          if (studentAnswer.trim().toLowerCase() === question.correctAnswers[0].trim().toLowerCase()) score++;
        }
      }
    });

    const percentage = (score / maxScore) * 100;
    const isPassed = percentage >= exam.passPercentage;

    // Determine if suspicious based on cheating flags
    const isSuspicious = cheatingFlags ?
      (cheatingFlags.tabSwitches > exam.antiCheating.maxTabSwitches ||
       cheatingFlags.fullscreenExits > exam.antiCheating.maxFullscreenExits ||
       cheatingFlags.suspiciousActivities.length > 5) : false;

    const result = new Result({
      exam: examId,
      student: studentId,
      answers,
      score,
      maxScore,
      percentage,
      isPassed,
      cheatingFlags: cheatingFlags || {
        tabSwitches: 0,
        fullscreenExits: 0,
        suspiciousActivities: [],
        isSuspicious: false,
      },
    });

    // Override isSuspicious if calculated as suspicious
    if (isSuspicious) {
      result.cheatingFlags.isSuspicious = true;
    }

    await result.save();

    res.json({ message: 'Exam submitted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentResults = async (req, res) => {
  try {
    const studentId = req.user._id;
    const results = await Result.find({ student: studentId })
      .populate('exam', 'title sections')
      .sort({ submittedAt: -1 });

    const formattedResults = await Promise.all(results.map(async (result) => {
      const exam = result.exam;
      const sectionScores = [];

      // Calculate section-wise scores
      for (const section of exam.sections) {
        let sectionScore = 0;
        let sectionMaxScore = section.questions.length;

        for (const questionId of section.questions) {
          const question = await Question.findById(questionId);
          const studentAnswer = result.answers.get(questionId.toString());

          if (studentAnswer !== undefined) {
            if (question.questionType === 'mcq') {
              if (studentAnswer === question.correctAnswers[0]) sectionScore++;
            } else if (question.questionType === 'multiple') {
              if (JSON.stringify(studentAnswer.sort()) === JSON.stringify(question.correctAnswers.sort())) sectionScore++;
            } else if (question.questionType === 'text' || question.questionType === 'code') {
              if (studentAnswer.trim().toLowerCase() === question.correctAnswers[0].trim().toLowerCase()) sectionScore++;
            }
          }
        }

        sectionScores.push({
          sectionName: section.name,
          score: sectionScore,
          maxScore: sectionMaxScore,
          percentage: sectionMaxScore > 0 ? (sectionScore / sectionMaxScore) * 100 : 0,
        });
      }

      return {
        _id: result._id,
        examTitle: exam.title,
        totalScore: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
        isPassed: result.isPassed,
        submittedAt: result.submittedAt,
        sectionScores,
      };
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeacherResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const teacherId = req.user._id;

    const exam = await Exam.findOne({ _id: examId, teacher: teacherId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const results = await Result.find({ exam: examId })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getExamSubmissions = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const exams = await Exam.find({ teacher: teacherId }).select('_id');
    const examIds = exams.map(e => e._id);
    const submissions = await Result.find({ exam: { $in: examIds } })
      .populate('exam', 'title')
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;
    const teacherId = req.user._id;
    const result = await Result.findById(submissionId).populate('exam');
    if (!result || result.exam.teacher.toString() !== teacherId.toString()) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    result.score = score;
    result.percentage = (score / result.maxScore) * 100;
    result.isPassed = result.percentage >= result.exam.passPercentage;
    if (feedback) result.feedback = feedback;
    await result.save();
    res.json({ message: 'Submission graded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const exams = await Exam.find({ teacher: teacherId }).populate('class', 'title');
    const examIds = exams.map(e => e._id);
    const results = await Result.find({ exam: { $in: examIds } }).populate('exam', 'title class');
    const totalExams = exams.length;
    const totalSubmissions = results.length;
    const averageScore = results.length > 0 ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length : 0;
    const passRate = results.length > 0 ? (results.filter(r => r.isPassed).length / results.length) * 100 : 0;

    // Exam-wise analytics
    const examAnalytics = exams.map(exam => {
      const examResults = results.filter(r => r.exam._id.toString() === exam._id.toString());
      const avgScore = examResults.length > 0 ? examResults.reduce((sum, r) => sum + r.percentage, 0) / examResults.length : 0;
      const passRateExam = examResults.length > 0 ? (examResults.filter(r => r.isPassed).length / examResults.length) * 100 : 0;
      return {
        examTitle: exam.title,
        classTitle: exam.class.title,
        submissions: examResults.length,
        averageScore: Math.round(avgScore * 100) / 100,
        passRate: Math.round(passRateExam * 100) / 100
      };
    });

    // Class-wise analytics
    const classMap = {};
    exams.forEach(exam => {
      if (!classMap[exam.class._id]) {
        classMap[exam.class._id] = { title: exam.class.title, exams: [], results: [] };
      }
      classMap[exam.class._id].exams.push(exam);
    });
    results.forEach(result => {
      const classId = result.exam.class._id.toString();
      if (classMap[classId]) {
        classMap[classId].results.push(result);
      }
    });
    const classAnalytics = Object.values(classMap).map(cls => {
      const avgScore = cls.results.length > 0 ? cls.results.reduce((sum, r) => sum + r.percentage, 0) / cls.results.length : 0;
      const passRateCls = cls.results.length > 0 ? (cls.results.filter(r => r.isPassed).length / cls.results.length) * 100 : 0;
      return {
        classTitle: cls.title,
        totalExams: cls.exams.length,
        totalSubmissions: cls.results.length,
        averageScore: Math.round(avgScore * 100) / 100,
        passRate: Math.round(passRateCls * 100) / 100
      };
    });

    res.json({
      totalExams,
      totalSubmissions,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      examAnalytics,
      classAnalytics
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getExamForGrading = async (req, res) => {
  try {
    const { examId } = req.params;
    const teacherId = req.user._id;
    const exam = await Exam.findOne({ _id: examId, teacher: teacherId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const publishExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const teacherId = req.user._id;
    const exam = await Exam.findOne({ _id: examId, teacher: teacherId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    exam.isPublished = true;
    await exam.save();
    res.json({ message: 'Exam published successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const unpublishExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const teacherId = req.user._id;
    const exam = await Exam.findOne({ _id: examId, teacher: teacherId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    exam.isPublished = false;
    await exam.save();
    res.json({ message: 'Exam unpublished successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const scheduleExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { scheduledAt } = req.body;
    const teacherId = req.user._id;
    const exam = await Exam.findOne({ _id: examId, teacher: teacherId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    exam.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    await exam.save();
    res.json({ message: 'Exam scheduled successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { title, duration, passPercentage, instructions, sections, accessCode, classId } = req.body;
    const teacherId = req.user._id;
    const exam = await Exam.findOne({ _id: examId, teacher: teacherId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // If classId is provided, verify teacher owns the new class
    if (classId && classId !== exam.class.toString()) {
      const classDoc = await Class.findOne({ _id: classId, teacher: teacherId });
      if (!classDoc) {
        return res.status(403).json({ message: 'Unauthorized to move exam to this class' });
      }
      exam.class = classId;
    }

    // Validate sections if provided
    if (sections) {
      for (const section of sections) {
        for (const questionId of section.questions) {
          const question = await Question.findOne({ _id: questionId, teacher: teacherId });
          if (!question) {
            return res.status(400).json({ message: `Question ${questionId} not found or not owned by you` });
          }
        }
      }
    }

    if (title) exam.title = title;
    if (duration) exam.duration = duration;
    if (passPercentage) exam.passPercentage = passPercentage;
    if (instructions !== undefined) exam.instructions = instructions;
    if (sections) exam.sections = sections;
    if (accessCode !== undefined) exam.accessCode = accessCode ? accessCode.trim() : undefined;
    await exam.save();
    res.json({ message: 'Exam updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const teacherId = req.user._id;
    const exam = await Exam.findOne({ _id: examId, teacher: teacherId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    await Exam.findByIdAndDelete(examId);
    // Also delete related results
    await Result.deleteMany({ exam: examId });
    res.json({ message: 'Exam deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const previewExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const teacherId = req.user._id;

    const exam = await Exam.findOne({ _id: examId, teacher: teacherId }).populate('class', 'title');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const duplicateExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const teacherId = req.user._id;

    const originalExam = await Exam.findOne({ _id: examId, teacher: teacherId });
    if (!originalExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Find the next available copy number
    const baseTitle = originalExam.title;
    let copyNumber = 1;
    let newTitle = `${baseTitle} Copy ${copyNumber}`;

    // Check if title already exists and increment until we find a unique one
    while (await Exam.findOne({ title: newTitle, teacher: teacherId })) {
      copyNumber++;
      newTitle = `${baseTitle} Copy ${copyNumber}`;
    }

    const duplicatedExam = new Exam({
      title: newTitle,
      duration: originalExam.duration,
      passPercentage: originalExam.passPercentage,
      instructions: originalExam.instructions,
      class: originalExam.class,
      teacher: teacherId,
      sections: originalExam.sections,
      accessCode: originalExam.accessCode,
      isPublished: false, // Always create as draft
    });

    await duplicatedExam.save();

    res.status(201).json({ message: 'Exam duplicated successfully!', examId: duplicatedExam._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Question CRUD endpoints
export const createQuestion = async (req, res) => {
  try {
    const { questionText, questionType, options, correctAnswers, difficulty, tags, points, classId } = req.body;
    const teacherId = req.user._id;

    const question = new Question({
      teacher: teacherId,
      classId,
      questionText,
      questionType,
      options,
      correctAnswers,
      difficulty,
      tags,
      points,
    });

    await question.save();
    res.status(201).json({ message: 'Question created successfully!', question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { difficulty, tags, classId, search } = req.query;

    let filter = { teacher: teacherId };

    if (difficulty) filter.difficulty = difficulty;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (classId) filter.classId = classId;
    if (search) filter.questionText = { $regex: search, $options: 'i' };

    const questions = await Question.find(filter).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const teacherId = req.user._id;
    const updates = req.body;

    const question = await Question.findOneAndUpdate(
      { _id: questionId, teacher: teacherId },
      updates,
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question updated successfully!', question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const teacherId = req.user._id;

    const question = await Question.findOneAndDelete({ _id: questionId, teacher: teacherId });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


