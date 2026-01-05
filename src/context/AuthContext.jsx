// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (token) {
          // Verify token with backend
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // Update user data from fresh backend response
          const userData = res.data.data.user;
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        }
      } catch (err) {
        // If verification fails, clear auth state
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`,
        {
          email,
          password,
        }
      );

      // Store all auth data
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));

      // Update state
      setToken(res.data.accessToken);
      setUser(res.data.data.user);

      // Show success notification
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 2000,
      });

      // Navigate to home
      navigate("/", { replace: true });
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed", {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        username,
        email,
        password,
      });

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      
      setToken(res.data.accessToken);
      setUser(res.data.data.user);

      // Success notification
      toast.success("Registration successful! Redirecting...", {
        position: "top-right",
        autoClose: 2000,
      });

      navigate("/");
    } catch (err) {
      throw err.response?.data?.message || "Registration failed";
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/refresh-token`, {
        refreshToken,
      });

      const newAccessToken = res.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);
      setToken(newAccessToken);
      
      return newAccessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, refreshAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
