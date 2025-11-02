import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const authenticated = isAuthenticated();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinkClasses = (path) =>
    `hover:text-yellow-300 transition ${location.pathname === path ? "font-semibold underline" : ""}`;

  return (
    <nav className="shadow-md bg-blue-600 text-white dark:bg-blue-900 dark:text-white">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold tracking-wide">Exam_Web</Link>
        <div className="hidden md:flex space-x-6 items-center">
          {!authenticated ? (
            <>
              <Link to="/" className={navLinkClasses("/")}>Home</Link>
              <Link to="/about" className={navLinkClasses("/about")}>About</Link>
              <Link to="/contact" className={navLinkClasses("/contact")}>Contact</Link>
              <Link to="/help-center" className={navLinkClasses("/help-center")}>Help Center</Link>
              <Link
                to="/signin-signup"
                className="px-4 py-2 rounded-lg font-semibold shadow transition bg-blue-500 text-white hover:bg-blue-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Sign In / Sign Up
              </Link>

            </>
          ) : (
            <>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-semibold transition bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;