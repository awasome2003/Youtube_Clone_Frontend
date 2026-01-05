import { Search, Bell, Upload, Menu, User, Home, Video, History, Library, Settings, HelpCircle } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${searchQuery}`);
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-4 py-3 bg-white shadow-sm sticky top-0 z-50">
        {/* Left - Logo and Menu */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 lg:hidden"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">MyTube</span>
          </Link>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="flex">
            <div className="flex w-full">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button 
                type="submit"
                className="bg-gray-100 px-6 rounded-r-full hover:bg-gray-200 transition-colors duration-200"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>

        {/* Right - User Controls */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link 
                to="/upload"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 hidden sm:block"
                title="Upload"
              >
                <Upload size={20} />
              </Link>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 hidden sm:block" title="Notifications">
                <Bell size={20} />
              </button>
              <div className="relative group">
                <Link 
                  to={`/profile/${user._id}`}
                  className="flex items-center space-x-2"
                >
                  <img
                    src={user.avatar && !user.avatar.startsWith('/default') 
                      ? `${import.meta.env.VITE_API_URL}${user.avatar}` 
                      : "https://via.placeholder.com/32"
                    }
                    alt="User"
                    className="h-8 w-8 rounded-full cursor-pointer object-cover"
                  />
                </Link>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50 border border-gray-200">
                  <Link 
                    to={`/profile/${user._id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Your Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span className="mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" x2="9" y1="12" y2="12" />
                      </svg>
                    </span>
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full transition-colors duration-200"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
      
      {/* Mobile Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-lg font-bold text-gray-900">MyTube</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="mt-4">
              <Link 
                to="/" 
                className={`flex items-center px-4 py-3 text-base font-medium ${location.pathname === '/' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="mr-3 h-5 w-5" />
                Home
              </Link>
              <Link 
                to="/trending" 
                className={`flex items-center px-4 py-3 text-base font-medium ${location.pathname === '/trending' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Video className="mr-3 h-5 w-5" />
                Trending
              </Link>
              <Link 
                to="/subscriptions" 
                className={`flex items-center px-4 py-3 text-base font-medium ${location.pathname === '/subscriptions' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Video className="mr-3 h-5 w-5" />
                Subscriptions
              </Link>
              
              {user && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link 
                    to={`/profile/${user._id}`} 
                    className={`flex items-center px-4 py-3 text-base font-medium ${location.pathname.includes('/profile') ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-3 h-5 w-5" />
                    Your Channel
                  </Link>
                  <Link 
                    to="/upload" 
                    className={`flex items-center px-4 py-3 text-base font-medium ${location.pathname === '/upload' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Upload className="mr-3 h-5 w-5" />
                    Upload
                  </Link>
                  <Link 
                    to="/history" 
                    className={`flex items-center px-4 py-3 text-base font-medium ${location.pathname === '/history' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <History className="mr-3 h-5 w-5" />
                    History
                  </Link>
                  <Link 
                    to="/library" 
                    className={`flex items-center px-4 py-3 text-base font-medium ${location.pathname === '/library' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Library className="mr-3 h-5 w-5" />
                    Library
                  </Link>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                    Sign out
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
