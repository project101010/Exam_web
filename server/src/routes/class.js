import express from 'express';
import { getStudentClasses, getTeacherClasses, getDeletedClasses, joinClass, createClass, approveStudent, rejectStudent, bulkApproveStudents, bulkRejectStudents, deleteClass, recoverClass, updateClass, exportClassData, importStudents } from '../controllers/classController.js';
import { authenticate, requireStudent, requireTeacher } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/student/classes', authenticate, requireStudent, getStudentClasses);
router.get('/teacher/classes', authenticate, requireTeacher, getTeacherClasses);
router.get('/teacher/deleted-classes', authenticate, requireTeacher, getDeletedClasses);
router.post('/student/join-class', authenticate, requireStudent, joinClass);
router.post('/teacher/create-class', authenticate, requireTeacher, createClass);
router.put('/teacher/update-class/:classId', authenticate, requireTeacher, updateClass);
router.post('/teacher/approve-student/:classId', authenticate, requireTeacher, approveStudent);
router.post('/teacher/reject-student/:classId', authenticate, requireTeacher, rejectStudent);
router.post('/teacher/bulk-approve-students/:classId', authenticate, requireTeacher, bulkApproveStudents);
router.post('/teacher/bulk-reject-students/:classId', authenticate, requireTeacher, bulkRejectStudents);
router.delete('/teacher/delete-class/:classId', authenticate, requireTeacher, deleteClass);
router.post('/teacher/recover-class/:classId', authenticate, requireTeacher, recoverClass);
router.get('/teacher/export-class-data/:classId', authenticate, requireTeacher, exportClassData);
router.post('/teacher/import-students/:classId', authenticate, requireTeacher, upload.single('file'), importStudents);

export default router;
