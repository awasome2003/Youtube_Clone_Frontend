import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import VideoCard from "../components/VideoCard";

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [profileUser, setProfileUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    description: "",
    channelName: "",
    website: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Determine if viewing own profile
  const isOwnProfile = currentUser && currentUser._id === userId;

  useEffect(() => {
    loadProfileData();
  }, [userId, activeTab]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const profileResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      setProfileUser(profileResponse.data.data.user);

      // Load user's content based on active tab
      switch (activeTab) {
        case 'videos':
          loadUserVideos();
          break;
        case 'subscriptions':
          loadUserSubscriptions();
          break;
        case 'saved':
          loadUserSavedVideos();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const loadUserVideos = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/videos`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      setVideos(response.data.data.videos);
    } catch (error) {
      console.error("Error loading videos:", error);
      toast.error("Failed to load videos");
    }
  };

  const loadUserSubscriptions = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/subscriptions`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      setSubscriptions(response.data.data.subscriptions);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      toast.error("Failed to load subscriptions");
    }
  };

  const loadUserSavedVideos = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/saved`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      setSavedVideos(response.data.data.savedVideos);
    } catch (error) {
      console.error("Error loading saved videos:", error);
      toast.error("Failed to load saved videos");
    }
  };

  const handleEditClick = () => {
    if (isOwnProfile) {
      setEditing(true);
      setEditData({
        username: profileUser.username,
        email: profileUser.email,
        description: profileUser.description || "",
        channelName: profileUser.channelName || "",
        website: profileUser.website || "",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditData({
      username: profileUser.username,
      email: profileUser.email,
      description: profileUser.description || "",
      channelName: profileUser.channelName || "",
      website: profileUser.website || "",
    });
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare profile data, excluding empty values
      const profileData = {};
      Object.keys(editData).forEach(key => {
        if (editData[key] !== "" && editData[key] !== profileUser[key]) {
          // Special handling for website - ensure proper format
          if (key === 'website') {
            if (editData[key]) {
              // Add protocol if missing
              const websiteValue = editData[key].startsWith('http') 
                ? editData[key] 
                : `https://${editData[key]}`;
              profileData[key] = websiteValue;
            }
          } else {
            profileData[key] = editData[key];
          }
        }
      });
      
      // Update profile info if there are changes
      if (Object.keys(profileData).length > 0) {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/users/me`,
          profileData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Update avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/users/avatar`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      toast.success("Profile updated successfully!");
      setEditing(false);
      
      // Reload profile data
      loadProfileData();
      
      // Update auth context if needed
      if (currentUser && currentUser._id === userId) {
        // Refresh user data in auth context
        const updatedUserResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        // Update localStorage
        localStorage.setItem("user", JSON.stringify(updatedUserResponse.data.data.user));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Banner - Placeholder for now */}
        <div className="h-32 bg-gradient-to-r from-red-500 to-red-600"></div>
        
        <div className="px-6 pb-6 relative">
          <div className="flex items-end -mt-16">
            <img
              src={avatarPreview || 
                (profileUser.avatar && !profileUser.avatar.startsWith('/default') 
                  ? `${import.meta.env.VITE_API_URL}${profileUser.avatar}` 
                  : profileUser.avatar)
                || "https://via.placeholder.com/100x100"
              }
              alt={profileUser.username}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
            
            <div className="ml-6 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {editing ? (
                  <input
                    type="text"
                    name="channelName"
                    value={editData.channelName || editData.username}
                    onChange={handleInputChange}
                    className="input"
                  />
                ) : (
                  profileUser.channelName || profileUser.username
                )}
              </h1>
              <p className="text-gray-600 mt-2">
                {profileUser.subscribersCount} subscribers • {profileUser.videoCount} videos
              </p>
              <p className="text-gray-500">Joined {formatDate(profileUser.joinDate)}</p>
            </div>
            
            {isOwnProfile && (
              <div className="ml-auto">
                {editing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="btn btn-primary px-4 py-2 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-secondary px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="btn btn-secondary px-4 py-2 text-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>
          
          {editing ? (
            <div className="mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="input"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={editData.username}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="textarea"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    name="channelName"
                    value={editData.channelName}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={editData.website}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {profileUser.description && (
                <p className="text-gray-700">{profileUser.description}</p>
              )}
              {profileUser.website && (
                <a 
                  href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline inline-flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                  {profileUser.website}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-0" aria-label="Tabs">
            {['videos', 'subscriptions', 'saved', 'about'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-center font-medium text-sm ${
                  activeTab === tab
                    ? 'border-b-2 border-red-500 text-red-600 bg-red-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'videos' && ` (${videos.length})`}
                {tab === 'subscriptions' && ` (${subscriptions.length})`}
                {tab === 'saved' && ` (${savedVideos.length})`}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'videos' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900">Videos</h2>
              {videos.length > 0 ? (
                <div className="video-grid">
                  {videos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="empty-state-title">No videos yet</h3>
                  <p className="empty-state-description">This channel hasn't uploaded any videos.</p>
                  {isOwnProfile && (
                    <div className="mt-4">
                      <Link 
                        to="/upload" 
                        className="btn btn-primary inline-flex items-center px-4 py-2 text-sm font-medium rounded-md"
                      >
                        Upload Video
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900">Subscriptions</h2>
              {subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {subscriptions.map((sub) => (
                    <div key={sub._id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <img
                        src={sub.avatar && !sub.avatar.startsWith('/default') 
                          ? `${import.meta.env.VITE_API_URL}${sub.avatar}` 
                          : "https://via.placeholder.com/40x40"
                        }
                        alt={sub.username}
                        className="w-12 h-12 rounded-full mr-4 object-cover"
                      />
                      <div className="flex-1">
                        <Link 
                          to={`/profile/${sub._id}`} 
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {sub.username}
                        </Link>
                        <p className="text-sm text-gray-500">{sub.subscribersCount} subscribers</p>
                      </div>
                      <Link 
                        to={`/profile/${sub._id}`} 
                        className="btn btn-secondary px-4 py-2 text-sm"
                      >
                        View Channel
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="empty-state-title">No subscriptions</h3>
                  <p className="empty-state-description">This user isn't subscribed to any channels yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900">Saved Videos</h2>
              {savedVideos.length > 0 ? (
                <div className="video-grid">
                  {savedVideos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <h3 className="empty-state-title">No saved videos</h3>
                  <p className="empty-state-description">No videos have been saved to this list yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900">About</h2>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Channel Information</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Joined:</span> {formatDate(profileUser.joinDate)}</p>
                      <p><span className="font-medium">Subscribers:</span> {profileUser.subscribersCount}</p>
                      <p><span className="font-medium">Videos:</span> {profileUser.videoCount}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{profileUser.description || "No description provided."}</p>
                  </div>
                </div>
                
                {profileUser.website && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Website</h3>
                    <a 
                      href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-600 hover:underline inline-flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                        <path d="M2 12h20" />
                      </svg>
                      {profileUser.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;