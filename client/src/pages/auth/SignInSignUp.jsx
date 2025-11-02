import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const SignInSignUp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register, verifyOTP } = useAuth(); // Assuming you have verifyOTP logic in context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!isLogin && role === "") {
      alert("Please select a role.");
      return;
    }

    setLoading(true);

    if (isLogin) {
      const result = await login(email, password);
      setLoading(false);
      if (result.success) navigate(`/${result.role}/dashboard`);
    } else {
      // Register the user
      const result = await register(name, email, password, role);

      setLoading(false);

      if (result.success) {
        // Redirect to OTP verification page
        // After OTP verification, redirect based on role
        navigate("/otp-verify", { state: { email, role } });
      }
    }
  };

  // Handle switching between Sign In and Sign Up
  const toggleForm = (loginState) => {
    setIsLogin(loginState);
    // Clear all fields when toggling
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Toggle Buttons */}
        <div className="flex mb-6 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleForm(true)}
            className={`flex-1 py-2 text-center font-semibold transition ${
              isLogin
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => toggleForm(false)}
            className={`flex-1 py-2 text-center font-semibold transition ${
              !isLogin
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Sign Up
          </button>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isLogin ? "Sign In to Exam_Web" : "Create an Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    autoComplete="new-password"
                    required
                  />
                  <span
                    className="absolute right-3 top-3 cursor-pointer text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            </>
          )}

          {isLogin && (
            <div className="text-right mb-2 space-y-1">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:underline text-sm block"
              >
                Forgot Password?
              </Link>
              <Link
                to="/recover-account"
                className="text-blue-600 hover:underline text-sm block"
              >
                Recover Account
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
            disabled={loading}
          >
            {loading
              ? isLogin
                ? "Signing In..."
                : "Signing Up..."
              : isLogin
              ? "Sign In"
              : "Sign Up"}
          </button>
        </form>

        {!isLogin && (
          <p className="text-gray-500 text-sm mt-4 text-center">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="text-blue-600 hover:underline">
              Terms & Conditions
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default SignInSignUp;
