import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react"; // optional icons

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Exam_Web</h3>
            <p className="text-gray-400 leading-relaxed">
              Your trusted platform for secure online examinations, connecting
              students and teachers anytime, anywhere.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-yellow-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-yellow-400 transition">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-yellow-400 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/help-center"
                  className="hover:text-yellow-400 transition"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal + Socials */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-white">Legal</h4>
            <ul className="space-y-2 mb-4">
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-yellow-400 transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-yellow-400 transition"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>

            {/* Social Media */}
            <div className="flex space-x-4">
              <a href="#" className="hover:text-yellow-400 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-yellow-400 transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-yellow-400 transition">
                <Linkedin size={20} />
              </a>
              <a href="#" className="hover:text-yellow-400 transition">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Exam_Web. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
