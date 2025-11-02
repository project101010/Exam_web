import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { sendOTPEmail } from '../config/email.js';

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      isVerified: false,
    });

    await user.save();

    const otp = generateOTP();
    const otpDoc = new Otp({
      userId: user._id,
      otp,
      type: 'signup',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    await otpDoc.save();

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, 'signup', name);
    if (!emailSent) {
      // If email fails, delete the created user and return error
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }

    res.status(201).json({ message: 'Registration successful! Please check your email for OTP.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otpDoc = await Otp.findOne({ userId: user._id, otp, expiresAt: { $gt: new Date() } });

    if (!otpDoc) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (otpDoc.type === 'signup') {
      user.isVerified = true;
      await user.save();
      await Otp.deleteMany({ userId: user._id, type: 'signup' });
      const token = jwt.sign(
        { userId: user._id, role: user.role, user: { id: user._id, name: user.name, email: user.email } },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      res.json({ message: 'OTP verified! Welcome to Exam_Web.', token });
    } else if (otpDoc.type === 'recover') {
      user.isDeleted = false;
      user.deletedAt = null;
      await user.save();
      await Otp.deleteMany({ userId: user._id, type: 'recover' });
      res.json({ message: 'Account recovered successfully.' });
    } else if (otpDoc.type === 'forgot') {
      await Otp.deleteMany({ userId: user._id, type: 'forgot' });
      res.json({ message: 'OTP verified. You can now reset your password.' });
    } else {
      res.status(400).json({ message: 'Invalid OTP type' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user || !user.isVerified || user.isDeleted) {
      return res.status(401).json({ message: 'Invalid credentials or user not verified' });
    }

    // Check if user is soft deleted and deletion period expired
    if (user.isDeleted && user.deletedAt && (new Date() - user.deletedAt) > 10 * 24 * 60 * 60 * 1000) {
      // Permanently delete user
      await User.deleteOne({ _id: user._id });
      return res.status(401).json({ message: 'Account permanently deleted' });
    }

    const isMatch = await user.checkPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, user: { id: user._id, name: user.name, email: user.email } },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const otpDoc = new Otp({
      userId: user._id,
      otp,
      type: 'forgot',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await otpDoc.save();

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, 'forgot', user.name);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP sent to your email for password reset.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};




export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.checkPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    // Send deletion confirmation email
    await sendOTPEmail(user.email, '', 'delete', user.name);

    res.json({ message: 'Account scheduled for deletion. You have 10 days to recover it.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Delete any existing signup OTPs for this user
    await Otp.deleteMany({ userId: user._id, type: 'signup' });

    const otp = generateOTP();
    const otpDoc = new Otp({
      userId: user._id,
      otp,
      type: 'signup',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    await otpDoc.save();

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, 'signup', user.name);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP resent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const recoverAccountSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Account does not exist' });
    }

    if (!user.isDeleted) {
      return res.status(400).json({ message: 'Account is not deleted' });
    }

    // Check if within 10 days
    if (user.deletedAt && (new Date() - user.deletedAt) > 10 * 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: 'Recovery period expired' });
    }

    const otp = generateOTP();
    const otpDoc = new Otp({
      userId: user._id,
      otp,
      type: 'recover',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await otpDoc.save();

    // Send OTP via email
    console.log(`Sending recovery OTP to ${email} for user ${user.name}`);
    const emailSent = await sendOTPEmail(email, otp, 'recover', user.name);
    console.log(`Email sent result: ${emailSent}`);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP sent to your email for account recovery.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
