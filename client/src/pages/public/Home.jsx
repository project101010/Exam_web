import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <main className="flex-grow bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center px-6 py-16">
        <div className="text-center text-white max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
            Welcome to <span className="text-yellow-300">Exam_Web</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 leading-relaxed">
            A secure and user-friendly online examination platform designed for{" "}
            <span className="font-semibold">Students</span> and{" "}
            <span className="font-semibold">Teachers</span>.
            Conduct, attend, and evaluate exams seamlessly — anytime, anywhere.
          </p>

          <div className="space-x-4">
            <Link
              to="/signin-signup"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
            >
              Sign In / Sign Up
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 px-8 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div className="p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-3 text-blue-600">For Students</h3>
            <p>
              Join private classes, attempt exams securely with anti-cheating
              measures, and view instant performance reports.
            </p>
          </div>
          <div className="p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-3 text-purple-600">For Teachers</h3>
            <p>
              Create exams with ease, manage classes, auto-evaluate results, and
              track student progress in real time.
            </p>
          </div>
          <div className="p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-3 text-yellow-600">Security</h3>
            <p>
              OTP + JWT authentication, anti-cheating features, and safe exam
              sessions ensure reliability and fairness.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
