import React from "react";
import { ShieldCheck, Users, BookOpen, Clock, BarChart3, Smartphone } from "lucide-react";


const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 py-20 text-center text-white">
        <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg">
          About <span className="text-yellow-300">Exam_Web</span>
        </h1>
        <p className="text-lg max-w-3xl mx-auto leading-relaxed text-gray-200">
          Revolutionizing the way online examinations are conducted — secure,
          reliable, and seamless for both <span className="font-semibold">teachers</span> and <span className="font-semibold">students</span>.
        </p>
      </div>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Key Features
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <Users className="w-8 h-8 text-blue-600" />, text: "Role-based access for students and teachers" },
            { icon: <ShieldCheck className="w-8 h-8 text-purple-600" />, text: "Secure authentication with OTP + JWT" },
            { icon: <BookOpen className="w-8 h-8 text-indigo-600" />, text: "Class management & student enrollment" },
            { icon: <Clock className="w-8 h-8 text-red-600" />, text: "Real-time exam taking with timers & auto-save" },
            { icon: <BarChart3 className="w-8 h-8 text-green-600" />, text: "Automated grading & detailed analytics" },
            { icon: <Smartphone className="w-8 h-8 text-yellow-600" />, text: "Responsive design for all devices" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="mb-4">{item.icon}</div>
              <p className="text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-gray-100 py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To empower educational institutions with an efficient, secure, and
              user-friendly examination platform that minimizes fraud,
              simplifies administration, and enhances learning outcomes.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1000&q=80"
              alt="Mission"
              className="w-full h-72 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-xl overflow-hidden shadow-lg order-2 md:order-1">
            <img
              src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1000&q=80"
              alt="Vision"
              className="w-full h-72 object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              To shape the future of digital learning by providing a globally
              trusted online examination platform that ensures fairness, boosts
              accessibility, and adapts to evolving educational needs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
