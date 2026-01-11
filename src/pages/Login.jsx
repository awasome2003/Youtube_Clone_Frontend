
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Video, ShieldCheck } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-[450px] border border-gray-200 rounded-lg p-8 sm:p-10 shadow-sm animate-fade-in">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-1 mb-2">
            <Video size={32} fill="red" stroke="red" />
            <span className="text-2xl font-bold tracking-tighter text-gray-900">MyTube</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">Sign in</h1>
          <p className="text-gray-600 mt-1">to continue to MyTube</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <ShieldCheck size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="relative group">
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link to="/forgot-password" size="sm" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Forgot password?
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Link to="/register" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Create account
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full sm:w-auto px-8 py-2.5 rounded-full font-semibold text-sm transition-all ${isLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                }`}
            >
              {isLoading ? "Signing in..." : "Next"}
            </button>
          </div>
        </form>

        <div className="mt-12 text-[12px] text-gray-500 flex justify-between items-center">
          <div className="flex gap-4">
            <span>English (United States)</span>
          </div>
          <div className="flex gap-4">
            <span>Help</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
