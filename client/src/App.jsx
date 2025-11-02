 import React from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ClassProvider } from './context/ClassContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import SignInSignUp from './pages/auth/SignInSignUp';
import OTPVerify from './pages/auth/OTPVerify';
import ForgotPassword from './pages/auth/ForgotPassword';
import RecoverAccount from './pages/auth/RecoverAccount';
import Contact from './pages/public/Contact';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsAndConditions from './pages/public/TermsAndConditions';
import NotFound from './pages/NotFound';
import AuthenticatedNotFound from './pages/AuthenticatedNotFound';
import HelpCenter from './pages/public/HelpCenter';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import MyClasses from './pages/student/MyClasses';
import Exams from './pages/student/Exams';
import TakeExam from './pages/student/TakeExam';
import Results from './pages/student/Results';
import StudentProfile from './pages/student/Profile';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import ManageClasses from './pages/teacher/ManageClasses';
import ClassDetails from './pages/teacher/ClassDetails';
import CreateExam from './pages/teacher/CreateExam';
import ManageExams from './pages/teacher/ManageExams';
import QuestionBank from './pages/teacher/QuestionBank';
import GradeExams from './pages/teacher/GradeExams';
import Analytics from './pages/teacher/Analytics';
import TeacherProfile from './pages/teacher/Profile';

const StudentRoutes = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

const TeacherRoutes = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

const App = () => {
  const location = useLocation();
  const isPublic =
    !location.pathname.startsWith('/student') &&
    !location.pathname.startsWith('/teacher');

  return (
    <AuthProvider>
      <ClassProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/signin-signup" element={<SignInSignUp />} />
          <Route path="/otp-verify" element={<OTPVerify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/recover-account" element={<RecoverAccount />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/help-center" element={<HelpCenter />} />

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentRoutes />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="classes" element={<MyClasses />} />
              <Route path="exams" element={<Exams />} />
              <Route path="take-exam/:id" element={<TakeExam />} />
              <Route path="results" element={<Results />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="*" element={<AuthenticatedNotFound />} />
            </Route>
          </Route>

          {/* Protected Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher" element={<TeacherRoutes />}>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="manage-classes" element={<ManageClasses />} />
              <Route path="manage-classes/:classId" element={<ClassDetails />} />
              <Route path="create-exam" element={<CreateExam />} />
              <Route path="manage-exams" element={<ManageExams />} />
              <Route path="question-bank" element={<QuestionBank />} />
              <Route path="grade-exams" element={<GradeExams />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<TeacherProfile />} />
              <Route path="*" element={<AuthenticatedNotFound />} />
            </Route>
          </Route>

          {/* Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {isPublic && <Footer />}
      </ClassProvider>
    </AuthProvider>
  );
};

export default App;
