import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, HelpCircle, Search } from "lucide-react";

const faqs = [
  {
    question: "How do I create an account?",
    answer: 'Click on the "Register" tab in the sign-in/sign-up page and fill in your details.',
  },
  {
    question: "How do I take an exam?",
    answer: "Log in to your account, navigate to the Exams section, and select the exam you want to take.",
  },
  {
    question: "What if I forget my password?",
    answer: 'Use the "Forgot Password" link on the login page to reset your password.',
  },
  {
    question: "How do I contact support?",
    answer: "Visit the Contact page and fill out the form to reach our support team.",
  },
  {
    question: "How do I view and update my profile?",
    answer: "Log in and navigate to the Profile page from the sidebar to view your information.",
  },
  {
    question: "How do I change my password?",
    answer: "Go to the Settings page and use the Change Password form.",
  },
  {
    question: "How do I delete my account?",
    answer: "In the Settings page, click the Delete Account button. Note: You can recover your account within 10 days via the Recover Account page.",
  },
  {
    question: "How do I recover a deleted account?",
    answer: (
      <>
        Go to the <Link to="/recover-account" className="text-blue-600 hover:underline">Recover Account page</Link> (accessible from the sign-in page), enter your email, receive an OTP, and verify to restore your account. This must be done within 10 days of deletion.
      </>
    ),
  },
  {
    question: "What is the difference between students and teachers?",
    answer: "Students can take exams and view results. Teachers can create and manage exams, classes, and grade exams.",
  },
  {
    question: "How do I create an exam as a teacher?",
    answer: "Navigate to Create Exam in the teacher dashboard and fill in the exam details.",
  },
  {
    question: "How do I manage my classes?",
    answer: "Teachers can use the Manage Classes section to create and organize classes.",
  },
];

const HelpCenter = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-16 text-center text-white">
        <HelpCircle className="mx-auto mb-4 w-12 h-12" />
        <h1 className="text-4xl font-bold mb-2">Help Center</h1>
        <p className="max-w-2xl mx-auto leading-relaxed text-gray-200">
          Find answers to frequently asked questions about Exam_Web.
        </p>
        <div className="mt-6 max-w-md mx-auto relative">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* FAQ Section */}
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.length === 0 ? (
            <p className="text-center text-gray-500">No FAQs match your search.</p>
          ) : (
            filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-4 focus:outline-none"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="p-4 pt-0 text-gray-700 border-t border-gray-200 transition-all">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;
