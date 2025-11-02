import express from 'express';
import { getStudentExams, getTeacherExams, createExam, getExam, submitExam, getStudentResults, getTeacherResults, getExamSubmissions, gradeSubmission, getTeacherAnalytics, getExamForGrading, publishExam, unpublishExam, scheduleExam, updateExam, deleteExam, exportGradebook, previewExam, duplicateExam, createQuestion, getQuestions, updateQuestion, deleteQuestion } from '../controllers/examController.js';
import { authenticate, requireStudent, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

router.get('/student/exams', authenticate, requireStudent, getStudentExams);
router.get('/teacher/exams', authenticate, requireTeacher, getTeacherExams);
router.post('/teacher/create-exam', authenticate, requireTeacher, createExam);
router.get('/student/exam/:examId', authenticate, requireStudent, getExam);
router.post('/student/submit-exam/:examId', authenticate, requireStudent, submitExam);
router.get('/student/results', authenticate, requireStudent, getStudentResults);
router.get('/teacher/results/:examId', authenticate, requireTeacher, getTeacherResults);
router.get('/teacher/submissions', authenticate, requireTeacher, getExamSubmissions);
router.post('/teacher/grade/:submissionId', authenticate, requireTeacher, gradeSubmission);
router.get('/teacher/analytics', authenticate, requireTeacher, getTeacherAnalytics);
router.get('/teacher/exam/:examId', authenticate, requireTeacher, getExamForGrading);
router.post('/teacher/publish/:examId', authenticate, requireTeacher, publishExam);
router.post('/teacher/unpublish/:examId', authenticate, requireTeacher, unpublishExam);
router.post('/teacher/schedule/:examId', authenticate, requireTeacher, scheduleExam);
router.put('/teacher/exam/:examId', authenticate, requireTeacher, updateExam);
router.delete('/teacher/exam/:examId', authenticate, requireTeacher, deleteExam);
router.get('/teacher/export-gradebook/:classId', authenticate, requireTeacher, exportGradebook);
router.get('/teacher/preview/:examId', authenticate, requireTeacher, previewExam);
router.post('/teacher/duplicate/:examId', authenticate, requireTeacher, duplicateExam);

// Question bank routes
router.post('/questions', authenticate, requireTeacher, createQuestion);
router.get('/questions', authenticate, requireTeacher, getQuestions);
router.put('/questions/:questionId', authenticate, requireTeacher, updateQuestion);
router.delete('/questions/:questionId', authenticate, requireTeacher, deleteQuestion);

export default router;
