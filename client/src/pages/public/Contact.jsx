import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Have questions, feedback, or need support? We’d love to hear from you.
          Fill out the form below or reach us directly through our contact
          details.
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        {/* Contact Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Send a Message</h2>
          <form className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows="5"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="flex items-center space-x-4">
            <Mail className="w-6 h-6 text-blue-600" />
            <span className="text-gray-700">support@examweb.com</span>
          </div>
          <div className="flex items-center space-x-4">
            <Phone className="w-6 h-6 text-blue-600" />
            <span className="text-gray-700">+91 98765 43210</span>
          </div>
          <div className="flex items-center space-x-4">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span className="text-gray-700">Hyderabad, India</span>
          </div>
          <p className="text-gray-500 text-sm">
            Our support team is available Monday – Friday, 9:00 AM – 6:00 PM.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
