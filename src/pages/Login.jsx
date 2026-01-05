// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData.email, formData.password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left branding section */}
      <div className="hidden lg:flex flex-col justify-center px-20 bg-gradient-to-br from-red-600 to-red-800 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
        <p className="text-lg text-red-100 max-w-md">
          Sign in to upload videos, manage your channel, and explore content from
          creators around the world.
        </p>
      </div>

      {/* Right form section */}
      <div className="flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
          </div>

          <h2 className="text-center text-2xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="text-center text-sm text-gray-500 mt-1">
            Enter your credentials to continue
          </p>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-red-600 hover:text-red-700"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
