import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthenticatedNotFound = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoDashboard = () => {
    navigate(`/${role}/dashboard`);
  };

  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">The page you are looking for does not exist.</p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Go Back
          </button>

          <button
            onClick={handleGoDashboard}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedNotFound;
