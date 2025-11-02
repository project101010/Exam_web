import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); // Make sure this is at the very top

// Email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS will be used automatically with STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // your 16-character App Password
  },
  debug: true,
  logger: true
});

// Debug: Check if env vars are loaded
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');

// Email templates (same as yours)
const generateSignupEmailText = (name, otp) => `
Exam_Web Signup Confirmation

Dear ${name},

Thank you for choosing Exam_Web. To complete your registration, please verify your account using the One-Time Password (OTP) below:

OTP: ${otp}

This OTP is valid for 5 minutes. If you did not initiate this registration, please disregard this email.

Welcome to Exam_Web – your trusted platform for online examinations.

Best regards,
The Exam_Web Team
`;

const generateForgotPasswordEmailText = (name, otp) => `
Exam_Web Password Reset

Dear ${name},

We received a request to reset your password for your Exam_Web account. Please use the following OTP to proceed with the password reset:

OTP: ${otp}

This OTP will expire in 5 minutes. For security reasons, please do not share this code with anyone.

If you did not request a password reset, please ignore this email or contact our support team.

Best regards,
The Exam_Web Team
`;

const generateDeleteAccountEmailText = (name) => `
Exam_Web Account Deletion Notice

Dear ${name},

We are writing to inform you that your Exam_Web account has been scheduled for deletion as per your request. Your account will be permanently deleted in 10 days.

During this grace period, you can recover your account within 10 days by using the account recovery feature in the Help Center on our website or from the sign-in page. If you choose to recover your account, all your data will be restored.

If you do not take any action within 10 days, your account and all associated data will be permanently removed from our system in accordance with our privacy policy.

Thank you for being a part of Exam_Web. We hope to see you again in the future.

Best regards,
The Exam_Web Team
`;

const generateRecoverAccountEmailText = (name, otp) => `
Exam_Web Account Recovery

Dear ${name},

We understand you wish to recover your Exam_Web account. To proceed with the recovery process, please use the following OTP:

OTP: ${otp}

This OTP is valid for 5 minutes. Once verified, your account will be fully restored with all previous data intact.

If you did not initiate this recovery request, please contact our support team immediately.

Best regards,
The Exam_Web Team
`;

// Function to send email
const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    console.error('Full error details:', error);
    return false;
  }
};

// Function to send OTP email based on type
const sendOTPEmail = async (email, otp, type, name) => {
  console.log(`Attempting to send ${type} OTP email to: ${email}`);
  let subject, text;

  switch (type) {
    case 'signup':
      subject = 'Exam_Web - Account Verification';
      text = generateSignupEmailText(name, otp);
      break;
    case 'forgot':
      subject = 'Exam_Web - Password Reset Verification';
      text = generateForgotPasswordEmailText(name, otp);
      break;
    case 'delete':
      subject = 'Exam_Web - Account Deletion Notice';
      text = generateDeleteAccountEmailText(name);
      break;
    case 'recover':
      subject = 'Exam_Web - Account Recovery Verification';
      text = generateRecoverAccountEmailText(name, otp);
      break;
    default:
      subject = 'Exam_Web - OTP Verification';
      text = generateSignupEmailText(name, otp);
  }

  return await sendEmail(email, subject, text);
};

export { sendOTPEmail };
