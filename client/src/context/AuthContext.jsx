import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, removeToken, decodeToken } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser(decoded.user);
        setRole(decoded.role);
      } else {
        removeToken();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      setToken(token);
      const decoded = decodeToken(token);
      setUser(decoded.user);
      setRole(decoded.role);
      toast.success('Login successful!');
      return { success: true, role: decoded.role };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      await api.post('/auth/signup', { name, email, password, role });
      toast.success('Registration successful! Please verify OTP.');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      toast.success(response.data.message);
      if (response.data.token) {
        setToken(response.data.token);
        const decoded = decodeToken(response.data.token);
        setUser(decoded.user);
        setRole(decoded.role);
      }
      return { success: true, token: response.data.token };
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
      return { success: false };
    }
  };

  const resendOTP = async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
      return { success: false };
    }
  };





  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
      return { success: false };
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await api.post('/auth/delete-account');
      toast.success(response.data.message);
      logout();
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Account deletion failed');
      return { success: false };
    }
  };

  const recoverAccountSendOtp = async (email) => {
    try {
      const response = await api.post('/auth/recover-account', { email });
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send recovery OTP');
      return { success: false };
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setRole(null);
    toast.success('Logged out successfully');
  };

  const isAuthenticated = () => !!getToken();

  return (
    <AuthContext.Provider value={{
      user,
      role,
      login,
      register,
      verifyOTP,
      resendOTP,
      changePassword,
      deleteAccount,
      recoverAccountSendOtp,
      logout,
      isAuthenticated,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
