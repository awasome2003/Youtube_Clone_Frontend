
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import VideoCard from "../components/VideoCard";
import { Camera, Edit2, Share2, Search, Settings } from "lucide-react";

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, token } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser && currentUser._id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`);
        setProfileUser(res.data.data.user);

        const videoRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}/videos`);
        setVideos(videoRes.data.data.videos || []);
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) return (
    <div className="animate-pulse px-4 lg:px-20 py-6">
      <div className="h-40 md:h-60 bg-gray-100 rounded-3xl mb-6" />
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="h-32 w-32 rounded-full bg-gray-100" />
        <div className="flex flex-col gap-4 flex-1 pt-4">
          <div className="h-8 w-1/4 bg-gray-100 rounded" />
          <div className="h-4 w-1/3 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );

  if (!profileUser) return <div className="text-center py-20">User not found</div>;

  const avatarUrl = profileUser.avatar && !profileUser.avatar.startsWith('/default')
    ? `${import.meta.env.VITE_API_URL}${profileUser.avatar}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}`;

  return (
    <div className="max-w-[1500px] mx-auto pb-10">
      {/* Channel Header (Banner & Profile Info) */}
      <div className="px-4 md:px-6 lg:px-10">
        {/* Banner */}
        <div className="relative h-32 md:h-48 lg:h-64 mt-4 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-[24px] overflow-hidden group">
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          {isOwnProfile && (
            <button className="absolute bottom-4 right-4 p-2.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100">
              <Camera size={20} />
            </button>
          )}
        </div>

        {/* Profile Info Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-6 mb-8">
          <div className="relative group shrink-0">
            <img
              src={avatarUrl}
              alt={profileUser.username}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-sm"
            />
            {isOwnProfile && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex flex-col flex-1 min-w-0 text-center md:text-left pt-2">
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">
              {profileUser.channelName || profileUser.username}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 text-gray-500 text-[14px] md:text-[16px] mt-2 font-medium">
              <span>@{profileUser.username}</span>
              <span>•</span>
              <span>{profileUser.subscribersCount?.toLocaleString() || 0} subscribers</span>
              <span>•</span>
              <span>{videos.length || 0} videos</span>
            </div>
            {profileUser.description && (
              <p className="text-gray-500 text-[14px] mt-2 line-clamp-1 max-w-xl">
                {profileUser.description}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
              {isOwnProfile ? (
                <>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-sm transition-colors">
                    Customize channel
                  </button>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-sm transition-colors">
                    Manage videos
                  </button>
                </>
              ) : (
                <button className="px-6 py-2 bg-black text-white hover:bg-gray-800 rounded-full font-bold text-sm transition-colors">
                  Subscribe
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="px-4 md:px-6 lg:px-10 border-b border-gray-100 sticky top-14 bg-white z-20">
        <div className="flex gap-4 md:gap-10 overflow-x-auto no-scrollbar scroll-smooth">
          {["Home", "Videos", "Shorts", "Playlists", "Community", "About"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`py-3.5 text-[15px] font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === tab.toLowerCase()
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
                }`}
            >
              {tab}
            </button>
          ))}
          <div className="flex-1" />
          <button className="p-2 hover:bg-gray-100 rounded-full hidden md:block">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 md:px-6 lg:px-10 py-8">
        {(activeTab === "home" || activeTab === "videos") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
            {videos.length > 0 ? (
              videos.map((video) => (
                <VideoCard key={video._id} video={{ ...video, userId: profileUser }} />
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Video size={40} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No content available</h3>
                <p className="text-gray-500 mt-1">This channel hasn't uploaded any videos yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="max-w-4xl flex flex-col md:flex-row gap-10">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-4">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {profileUser.description || "No description provided."}
              </p>
            </div>
            <div className="w-full md:w-80 shrink-0">
              <h3 className="text-xl font-bold mb-4">Stats</h3>
              <div className="flex flex-col gap-4 text-sm font-medium border-y border-gray-100 py-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Joined</span>
                  <span>{new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total views</span>
                  <span>{videos.reduce((acc, v) => acc + (v.views || 0), 0).toLocaleString()} views</span>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-full"><Share2 size={20} /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full cursor-not-allowed opacity-50"><Settings size={20} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;