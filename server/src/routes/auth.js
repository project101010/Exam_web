import express from 'express';
import { signup, verifyOtp, login, forgotPassword, changePassword, deleteAccount, resendOtp, recoverAccountSendOtp } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', authenticate, changePassword);
router.post('/delete-account', authenticate, deleteAccount);
router.post('/recover-account', recoverAccountSendOtp);

export default router;
