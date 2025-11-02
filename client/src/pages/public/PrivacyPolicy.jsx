import React from "react";
import { ShieldCheck } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-16 text-center text-white">
        <ShieldCheck className="mx-auto mb-4 w-12 h-12" />
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="max-w-2xl mx-auto text-gray-200 leading-relaxed">
          Learn how Exam_Web collects, protects, and uses your personal information to keep your data secure.
        </p>
      </div>

      {/* Content Section */}
      <main className="flex-grow container mx-auto px-4 py-12 space-y-8 max-w-5xl">
        {/* Information We Collect */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Information We Collect</h2>
          <p className="text-gray-700">
            We collect information you provide directly to us, such as when you create an account, take exams, or contact us.
          </p>
        </section>

        {/* How We Use Information */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">How We Use Your Information</h2>
          <p className="text-gray-700">
            We use your information to provide and improve our services, communicate with you, and ensure the security of our platform.
          </p>
        </section>

        {/* Data Protection */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Data Protection</h2>
          <p className="text-gray-700">
            We implement appropriate security measures to protect your personal information against unauthorized access or disclosure.
          </p>
        </section>

        {/* Contact Us */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@examweb.com" className="text-blue-600 hover:underline">privacy@examweb.com</a>.
          </p>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
