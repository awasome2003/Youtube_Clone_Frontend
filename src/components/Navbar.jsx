
import { Search, Bell, Upload, Menu, User, Mic, Video, MoreVertical } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <nav className="flex items-center justify-between px-4 h-14 bg-white sticky top-0 z-50">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors active:bg-gray-200"
        >
          <Menu size={22} className="text-gray-700" />
        </button>

        <Link to="/" className="flex items-center gap-1 group">
          <div className="relative">
            <Video size={30} fill="red" stroke="red" className="group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-full transition-opacity" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-gray-900 hidden sm:block">MyTube</span>
        </Link>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-[720px] mx-4 hidden md:flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 items-center">
          <div className="flex w-full group">
            <div className="flex flex-1 items-center px-4 py-1.5 border border-gray-300 rounded-l-full group-focus-within:border-blue-500 group-focus-within:ring-1 group-focus-within:ring-blue-500 shadow-inner">
              <Search size={18} className="text-gray-400 mr-3 hidden group-focus-within:block" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-[16px]"
              />
            </div>
            <button
              type="submit"
              className="px-6 bg-gray-50 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-100 transition-colors border-l-gray-300"
              title="Search"
            >
              <Search size={22} className="text-gray-600" />
            </button>
          </div>
        </form>
        <button className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors" title="Search with your voice">
          <Mic size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
        <div className="md:hidden p-2 rounded-full hover:bg-gray-100">
          <Search size={22} className="text-gray-700" />
        </div>

        {user ? (
          <>
            <Link
              to="/upload"
              className="p-2.5 rounded-full hover:bg-gray-100 transition-colors hidden sm:flex items-center gap-2 group"
              title="Create"
            >
              <Video size={20} className="text-gray-700" />
            </Link>

            <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors hidden sm:block" title="Notifications">
              <Bell size={20} className="text-gray-700" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center ml-1 focus:outline-none"
              >
                <img
                  src={user.avatar && !user.avatar.startsWith('/default')
                    ? `${import.meta.env.VITE_API_URL}${user.avatar}`
                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                  }
                  alt="User"
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent hover:ring-gray-200 transition-all"
                />
              </button>

              {isUserDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 flex items-start gap-3 border-b border-gray-100">
                      <img
                        src={user.avatar && !user.avatar.startsWith('/default')
                          ? `${import.meta.env.VITE_API_URL}${user.avatar}`
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                        }
                        alt="User"
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-[16px] truncate">{user.username}</span>
                        <span className="text-gray-500 text-sm truncate">{user.email}</span>
                        <Link to={`/profile/${user._id}`} className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-700">View your channel</Link>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        to={`/profile/${user._id}`}
                        className="flex items-center px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <User className="mr-4 h-5 w-5 text-gray-500" />
                        Your channel
                      </Link>
                      <Link
                        to="/upload"
                        className="flex items-center px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-100 transition-colors sm:hidden"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <Upload className="mr-4 h-5 w-5 text-gray-500" />
                        Upload video
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div className="mr-4 text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" x2="9" y1="12" y2="12" />
                          </svg>
                        </div>
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-full hover:bg-gray-100 hidden sm:block" title="Settings">
              <MoreVertical size={20} className="text-gray-700" />
            </button>
            <Link
              to="/login"
              className="flex items-center gap-2 text-[14px] font-semibold text-blue-600 border border-gray-300 px-3.5 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-100 transition-all whitespace-nowrap"
            >
              <div className="p-0.5 rounded-full border-2 border-blue-600 overflow-hidden">
                <User size={14} className="fill-blue-600" />
              </div>
              Sign in
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
