// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import VideoDetails from "./pages/VideoDetails";
import Register from "./pages/Register";
import UploadVideo from "./pages/UploadVideo";
import Profile from "./pages/Profile";
import EditVideo from "./pages/EditVideo";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import axios from 'axios';

function AppContent() {
  const { user, login } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      // Verify token and get user info
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        if (response.data.success) {
          login(response.data.data.user, token, localStorage.getItem('refreshToken'));
        }
      })
      .catch(error => {
        console.error('Token verification failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });
    }
  }, [login, user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/video/:id" element={<VideoDetails />} />
          <Route path="/video/:id/edit" element={<EditVideo />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/upload" element={<ProtectedRoute><UploadVideo /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;