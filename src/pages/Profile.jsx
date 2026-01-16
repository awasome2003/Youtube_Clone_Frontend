
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import VideoCard from "../components/VideoCard";
import { Camera, Edit2, Share2, Search, Settings, Save, X, Video, Sparkles, UserPlus, Info } from "lucide-react";

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, token } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [editForm, setEditForm] = useState({
    channelName: "",
    description: "",
  });

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const isOwnProfile = currentUser && currentUser._id === userId;

  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (profileUser && currentUser) {
      const isSub = currentUser.subscribedChannels?.includes(userId) ||
        profileUser.subscribers?.includes(currentUser._id);
      setIsSubscribed(!!isSub);
    }
  }, [profileUser, currentUser, userId]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`);
        setProfileUser(res.data.data.user);
        setEditForm({
          channelName: res.data.data.user.channelName || res.data.data.user.username,
          description: res.data.data.user.description || "",
        });

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

  const handleSubscribe = async () => {
    if (!currentUser) return toast.error("Please login to subscribe");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/subscribe/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsSubscribed(res.data.isSubscribed);
      toast.success(res.data.message);

      setProfileUser(prev => ({
        ...prev,
        subscribersCount: res.data.isSubscribed
          ? (prev.subscribersCount || 0) + 1
          : Math.max((prev.subscribersCount || 0) - 1, 0)
      }));
    } catch (err) {
      toast.error("Failed to subscribe");
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append(type, file);

    try {
      const endpoint = type === 'avatar' ? '/api/users/avatar' : '/api/users/banner';
      const res = await axios.patch(`${import.meta.env.VITE_API_URL}${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setProfileUser(prev => ({ ...prev, [type]: res.data.data.user[type] }));
      toast.success(`${type === 'avatar' ? 'Profile picture' : 'Banner'} updated successfully`);
    } catch (err) {
      toast.error(`Failed to update ${type}`);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        channelName: editForm.channelName,
        description: editForm.description,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfileUser(prev => ({
        ...prev,
        channelName: res.data.data.user.channelName,
        description: res.data.data.user.description
      }));
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) return (
    <div className="animate-pulse px-4 lg:px-10 py-6 max-w-[1500px] mx-auto">
      <div className="h-40 md:h-64 bg-white/5 rounded-[32px] mb-8" />
      <div className="flex flex-col md:flex-row gap-8 mb-8 px-6">
        <div className="h-40 w-40 rounded-full bg-white/5 border-4 border-white/5 shrink-0" />
        <div className="flex flex-col gap-4 flex-1 pt-6">
          <div className="h-10 w-1/3 bg-white/5 rounded-2xl" />
          <div className="h-5 w-1/4 bg-white/5 rounded-xl" />
          <div className="h-20 w-full bg-white/5 rounded-2xl mt-2" />
        </div>
      </div>
    </div>
  );

  if (!profileUser) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="p-6 bg-white/5 rounded-full mb-6">
        <X size={48} className="text-gray-600" />
      </div>
      <h1 className="text-3xl font-black text-white mb-2">Creator not found</h1>
      <p className="text-gray-400">The channel you're looking for doesn't exist or has been removed.</p>
      <Link to="/" className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
        Back to Home
      </Link>
    </div>
  );

  const avatarUrl = profileUser.avatar && !profileUser.avatar.startsWith('/default')
    ? `${import.meta.env.VITE_API_URL}${profileUser.avatar}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}`;

  return (
    <div className="max-w-[1500px] mx-auto pb-10">
      {/* Channel Header */}
      <div className="px-4 md:px-6 lg:px-10">
        {/* Banner */}
        <div className="relative h-40 md:h-56 lg:h-72 mt-4 w-full bg-white/5 rounded-[32px] overflow-hidden group shadow-2xl border border-white/5">
          {profileUser.banner && !profileUser.banner.includes("default-banner") ? (
            <img
              src={`${import.meta.env.VITE_API_URL}${profileUser.banner}`}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-indigo-900 via-purple-900 to-rose-900 opacity-80" />
          )}

          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

          {isOwnProfile && (
            <>
              <input
                type="file"
                ref={bannerInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'banner')}
              />
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur-xl text-white rounded-2xl border border-white/20 hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 font-bold text-xs uppercase tracking-widest shadow-xl"
              >
                <Camera size={18} /> Update Artwork
              </button>
            </>
          )}
        </div>

        {/* Profile Info Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 pt-6 mb-10 px-2">
          <div className="relative group shrink-0 -mt-16 md:-mt-20">
            <div className="relative z-10 p-1.5 bg-white/10 backdrop-blur-3xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20">
              <img
                src={avatarUrl}
                alt={profileUser.username}
                className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover"
              />
            </div>
            {isOwnProfile && (
              <>
                <input
                  type="file"
                  ref={avatarInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'avatar')}
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-2 right-2 z-20 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform border border-white/20"
                >
                  <Camera size={18} />
                </button>
              </>
            )}
          </div>

          {/* User Details */}
          {isEditing ? (
            <div className="flex flex-col gap-4 w-full max-w-2xl bg-white/5 backdrop-blur-2xl p-6 rounded-[24px] border border-white/10 shadow-2xl">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Channel Name</label>
                <input
                  type="text"
                  value={editForm.channelName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, channelName: e.target.value }))}
                  className="w-full text-xl font-bold text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none"
                  placeholder="Enter channel name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">About Channel</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-sm text-gray-300 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                  rows={4}
                  placeholder="Write something about your channel..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateProfile}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Save size={18} /> Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-w-0 text-center md:text-left pt-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                  {profileUser.channelName || profileUser.username}
                </h1>
                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-1.5 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                  <Sparkles size={12} /> Verified Creator
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-gray-400 text-[14px] md:text-[16px] font-bold">
                <span className="text-white">@{profileUser.username}</span>
                <span className="opacity-30">•</span>
                <span>{profileUser.subscribersCount?.toLocaleString() || 0} subscribers</span>
                <span className="opacity-30">•</span>
                <span>{videos.length || 0} videos</span>
              </div>

              {profileUser.description && (
                <p className="text-gray-400 text-[14px] mt-4 line-clamp-2 max-w-2xl font-medium leading-relaxed">
                  {profileUser.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8">
                {isOwnProfile ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2.5 bg-white text-black rounded-full font-black text-sm hover:scale-105 transition-all flex items-center gap-2 shadow-xl"
                    >
                      <Edit2 size={16} /> Customize Profile
                    </button>
                    <button
                      onClick={() => setIsManageMode(!isManageMode)}
                      className={`px-4 py-2.5 rounded-full font-black text-sm transition-all border ${isManageMode ? 'bg-blue-500 text-white border-blue-400' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
                    >
                      {isManageMode ? "Exit Management" : "Manage Videos"}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubscribe}
                      className={`px-8 py-2.5 rounded-full font-black text-sm transition-all flex items-center gap-2 shadow-xl ${isSubscribed
                        ? "bg-white/10 text-white border border-white/20"
                        : "bg-white text-black hover:scale-105 shadow-white/10"
                        }`}
                    >
                      <UserPlus size={18} />
                      {isSubscribed ? "Subscribed" : "Subscribe"}
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2.5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all border border-white/5"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 md:px-6 lg:px-10 border-b border-white/5 sticky top-14 bg-[#0f0f0f]/80 backdrop-blur-xl z-20">
        <div className="flex gap-6 md:gap-12 overflow-x-auto no-scrollbar scroll-smooth">
          {["Home", "Videos", "Shorts", "Playlists", "Community", "About"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`py-5 text-[14px] font-black uppercase tracking-widest whitespace-nowrap border-b-4 transition-all ${activeTab === tab.toLowerCase()
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-500 hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
          <div className="flex-1" />
          <button className="px-4 text-gray-500 hover:text-white transition-colors flex items-center gap-2 font-bold text-sm">
            <Search size={18} /> Search
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 md:px-6 lg:px-10 py-10">
        {(activeTab === "home" || activeTab === "videos") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-5 gap-y-10">
            {videos.length > 0 ? (
              videos.map((video) => (
                <div key={video._id} className="relative group/manage">
                  <VideoCard video={{ ...video, userId: profileUser }} />
                  {isManageMode && isOwnProfile && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-[24px] flex flex-col items-center justify-center gap-4 z-20 animate-in fade-in zoom-in-95 duration-200">
                      <Link
                        to={`/video/${video._id}/edit`}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                      >
                        <Edit2 size={16} /> Edit Asset
                      </Link>
                      <button
                        onClick={() => {
                          if (window.confirm("Permanently purge this cinematic asset from the global index?")) {
                            axios.delete(`${import.meta.env.VITE_API_URL}/api/videos/${video._id}/delete`, {
                              headers: { Authorization: `Bearer ${token}` }
                            }).then(() => {
                              setVideos(prev => prev.filter(v => v._id !== video._id));
                              toast.success("Asset Purged from Vault");
                            }).catch(() => toast.error("Purge Sequence Failed"));
                          }
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600/20 text-red-500 border border-red-500/30 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl"
                      >
                        <Trash2 size={16} /> Purge Asset
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-white/5 rounded-[40px]">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-600 border border-white/5">
                  <Video size={40} />
                </div>
                <h3 className="text-2xl font-black text-white">No content yet</h3>
                <p className="text-gray-400 mt-2 font-medium">This creator hasn't published any videos yet.</p>
                {isOwnProfile && (
                  <Link to="/upload" className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-colors shadow-xl shadow-blue-500/20">
                    Upload Your First Video
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="max-w-6xl flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-10">
              <section className="bg-white/5 backdrop-blur-3xl p-8 rounded-[32px] border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <Info size={20} />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">About the Channel</h3>
                </div>
                <p className="text-gray-400 whitespace-pre-wrap leading-loose font-medium">
                  {profileUser.description || "The creator hasn't written a description for their channel mission yet."}
                </p>
              </section>

              <section className="bg-white/5 backdrop-blur-3xl p-8 rounded-[32px] border border-white/10">
                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-6">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["Instagram", "Twitter", "GitHub", "Personal Website"].map((link) => (
                    <div key={link} className="flex items-center justify-between p-4 bg-white/5 rounded-[20px] border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                      <span className="text-gray-400 font-bold group-hover:text-white">{link}</span>
                      <Share2 size={16} className="text-gray-600 group-hover:text-blue-400" />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="w-full lg:w-96 shrink-0">
              <div className="bg-white/5 rounded-[32px] p-8 border border-white/10 sticky top-40 shadow-2xl">
                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-8">Channel Stats</h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <span className="text-gray-500 font-black text-xs uppercase tracking-tighter">Joined</span>
                    <span className="text-white font-bold">{new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <span className="text-gray-500 font-black text-xs uppercase tracking-tighter">Lifetime Views</span>
                    <span className="text-white font-bold">{videos.reduce((acc, v) => acc + (v.views || 0), 0).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <span className="text-gray-500 font-black text-xs uppercase tracking-tighter">Engagement</span>
                    <span className="text-green-400 font-black tracking-widest">+12.5%</span>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-4">
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black font-black rounded-2xl hover:scale-[1.02] transition-transform shadow-xl"
                  >
                    <Share2 size={20} /> Share Channel
                  </button>

                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all"
                    >
                      <Settings size={20} /> Channel Dashboard
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;