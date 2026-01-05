// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, register } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      //   toast.success("Registration successful! Redirecting...", {
      //     position: "top-right",
      //     autoClose: 2000,
      //   });
      // No need to manually navigate here if your AuthContext already does it
    } catch (err) {
      toast.error(err.message || "Registration failed", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div>
            <div className="mx-auto h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
              Create your account
            </h2>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Username field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your username"
                />
              </div>

              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your password"
                />
              </div>

              {/* Confirm Password field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="spinner mr-2"></span>
                    Registering...
                  </span>
                ) : (
                  "Register"
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-red-600 hover:text-red-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
