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
import Search from "./pages/Search";
import LikedVideos from "./pages/LikedVideos";
import History from "./pages/History";
import WatchLater from "./pages/WatchLater";
import PlaylistDetails from "./pages/PlaylistDetails";
import Shorts from "./pages/Shorts";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVideos from "./pages/admin/AdminVideos";
import SupadataImport from "./pages/admin/SupadataImport";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import axios from 'axios';

function AppContent() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0f0f0f] relative text-white">
      {/* Background Decorative Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse z-0 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-700 z-0 pointer-events-none" />

      <div className="relative z-10">
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex pt-14">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-60" : "ml-0 lg:ml-[72px]"}`}>
            <div className="p-4 pt-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shorts" element={<Shorts />} />
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
                <Route path="/video/:id" element={<VideoDetails />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/video/:id/edit" element={<EditVideo />} />
                  <Route path="/upload" element={<UploadVideo />} />
                </Route>
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/search" element={<Search />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/liked-videos" element={<LikedVideos />} />
                  <Route path="/watch-later" element={<WatchLater />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/playlist/:id" element={<PlaylistDetails />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute />}>
                  {user?.role === "admin" && (
                    <>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/videos" element={<AdminVideos />} />
                      <Route path="/admin/import" element={<SupadataImport />} />
                    </>
                  )}
                </Route>
              </Routes>
            </div>
          </main>
        </div>
      </div>
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
        theme="dark"
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