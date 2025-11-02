import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const RecoverAccount = () => {
  const [step, setStep] = useState(1); // 1: enter email, 2: enter OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { recoverAccountSendOtp, verifyOTP } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    const result = await recoverAccountSendOtp(email);
    setLoading(false);
    if (result.success) {
      setStep(2);
      setCountdown(60); // 60 second countdown for resend
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }
    setLoading(true);
    const result = await verifyOTP(email, otp);
    setLoading(false);
    if (result.success) {
      toast.success('Account recovered successfully. Please sign in.');
      navigate('/signin-signup');
    } else {
      toast.error(result.message || 'Failed to recover account. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    const result = await recoverAccountSendOtp(email);
    setResendLoading(false);
    if (result.success) {
      setCountdown(60);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Recover Account
        </h2>
        {step === 1 ? (
          <>
            <p className="text-gray-600 text-center mb-6">
              Enter your email address and we'll send you an OTP to recover your account.
            </p>
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-gray-600 text-center mb-6">
              Enter the OTP sent to {email}
            </p>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || resendLoading}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendLoading ? 'Sending...' : countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Recovering...' : 'Recover Account'}
              </button>
            </form>
          </>
        )}
        <div className="text-center mt-4">
          <Link to="/signin-signup" className="text-blue-600 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecoverAccount;
