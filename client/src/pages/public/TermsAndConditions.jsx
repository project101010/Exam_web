import React from "react";
import { FileText } from "lucide-react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-16 text-center text-white">
        <FileText className="mx-auto mb-4 w-12 h-12" />
        <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
        <p className="max-w-2xl mx-auto text-gray-200 leading-relaxed">
          Please read these terms and conditions carefully before using Exam_Web. By accessing or using our service, you agree to be bound by these terms.
        </p>
      </div>

      {/* Content Section */}
      <main className="flex-grow container mx-auto px-4 py-12 space-y-8 max-w-5xl">
        {/* Acceptance of Terms */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing and using Exam_Web, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        {/* User Responsibilities */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">User Responsibilities</h2>
          <p className="text-gray-700">
            Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.
          </p>
        </section>

        {/* Prohibited Uses */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Prohibited Uses</h2>
          <p className="text-gray-700">
            You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts.
          </p>
        </section>

        {/* Limitation of Liability */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Limitation of Liability</h2>
          <p className="text-gray-700">
            In no event shall Exam_Web be liable for any indirect, incidental, special, consequential, or punitive damages.
          </p>
        </section>

        {/* Contact Us */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about these Terms and Conditions, please contact us at <a href="mailto:legal@examweb.com" className="text-blue-600 hover:underline">legal@examweb.com</a>.
          </p>
        </section>
      </main>
    </div>
  );
};

export default TermsAndConditions;
