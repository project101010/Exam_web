import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { role } = useAuth();
  const location = useLocation();

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/classes', label: 'My Classes' },
    { to: '/student/exams', label: 'Exams' },
    { to: '/student/results', label: 'Results' },
    { to: '/student/profile', label: 'Profile' },
    // Removed settings page link as settings moved to profile page
    // { to: '/student/settings', label: 'Settings' },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', label: 'Dashboard' },
    { to: '/teacher/manage-classes', label: 'Manage Classes' },
    { to: '/teacher/question-bank', label: 'Question Bank' },
    { to: '/teacher/create-exam', label: 'Create Exam' },
    { to: '/teacher/manage-exams', label: 'Manage Exams' },
    { to: '/teacher/grade-exams', label: 'Grade Exams' },
    { to: '/teacher/analytics', label: 'Analytics' },
    { to: '/teacher/profile', label: 'Profile' },
    // Removed settings page link as settings moved to profile page
    // { to: '/teacher/settings', label: 'Settings' },
  ];

  const links = role === 'student' ? studentLinks : teacherLinks;

  return (
    <div className="w-64 bg-gray-800 text-white h-full p-4">
      <h2 className="text-xl font-bold mb-4">{role === 'student' ? 'Student' : 'Teacher'} Panel</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={`block p-2 rounded ${
                location.pathname === link.to ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
