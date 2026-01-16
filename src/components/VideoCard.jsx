import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoreVertical, Clock, ListPlus, Download, Share2, Ban, Flag, Trash2, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import SaveToPlaylistModal from "./SaveToPlaylistModal";

const VideoCard = ({ video }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  const isOwner = user?._id === video.userId?._id;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return toast.error("Please login to save videos");

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/videos/save`,
        { videoId: video._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Added to saved videos");
      setIsMenuOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save video");
    }
  };

  const handleWatchLater = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return toast.error("Please login to use Watch Later");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/watch-later/${video._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || "Watch Later updated");
      setIsMenuOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update Watch Later");
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const videoUrl = `${window.location.origin}/video/${video._id}`;
    navigator.clipboard.writeText(videoUrl);
    toast.success("Link copied to clipboard!");
    setIsMenuOpen(false);
  };

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Simplified download - in a real app, you'd fetch the blob
    window.open(`${import.meta.env.VITE_API_URL}/api/videos/${video._id}/stream`, '_blank');
    setIsMenuOpen(false);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/video/${video._id}/edit`);
    setIsMenuOpen(false);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/videos/${video._id}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Video deleted successfully");
      setIsMenuOpen(false);
      // Trigger a refresh of the page or parent component
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete video");
    }
  };

  // Helper to format views
  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + "M";
    if (views >= 1000) return (views / 1000).toFixed(1) + "K";
    return views;
  };

  // Helper to get relative time
  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };

  const thumbnailUrl = video.thumbnailUrl
    ? video.thumbnailUrl.startsWith('http')
      ? video.thumbnailUrl
      : `${import.meta.env.VITE_API_URL}${video.thumbnailUrl}`
    : `https://picsum.photos/seed/${video._id}/640/360`;

  const avatarUrl = video.userId?.avatar
    ? video.userId.avatar.startsWith('http')
      ? video.userId.avatar
      : `${import.meta.env.VITE_API_URL}${video.userId.avatar}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.userId?.username || 'default'}`;

  return (
    <div className="flex flex-col gap-3 group">
      {/* Thumbnail */}
      <Link to={`/video/${video._id}`} className="relative aspect-video w-full overflow-hidden rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/20 transition-all shadow-lg shadow-black/20">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {video.duration && (
          <div className="absolute bottom-2 right-2 rounded-lg bg-black/80 backdrop-blur-md px-2 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
            {video.duration}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Info Section */}
      <div className="flex gap-3 px-1 mt-1">
        <Link to={`/profile/${video.userId?._id}`} className="flex-shrink-0">
          <img
            src={avatarUrl}
            alt={video.userId?.username}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-white/10 transition-all shadow-md"
          />
        </Link>
        <div className="flex flex-1 flex-col overflow-hidden">
          <Link to={`/video/${video._id}`}>
            <h3 className="line-clamp-2 text-[15px] font-black leading-tight text-white group-hover:text-blue-400 transition-colors">
              {video.title}
            </h3>
          </Link>
          <div className="mt-1.5 flex flex-col text-[13px] text-gray-400 font-medium">
            <Link to={`/profile/${video.userId?._id}`} className="hover:text-white transition-colors truncate flex items-center gap-1.5">
              {video.userId?.username || "Unknown Channel"}
              <div className="w-3 h-3 bg-gray-600 rounded-full flex items-center justify-center text-[8px] text-white">✓</div>
            </Link>
            <div className="flex items-center gap-1 mt-0.5 opacity-80">
              <span>{formatViews(video.views || 0)} views</span>
              <span className="text-[10px] opacity-40">{" • "}</span>
              <span>{getTimeAgo(video.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white ${isMenuOpen ? 'bg-white/10 opacity-100 shadow-xl' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <MoreVertical size={18} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-10 w-56 bg-[#1a1a1a]/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right overflow-hidden">
              <button onClick={handleWatchLater} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-[14px] text-gray-300 font-medium hover:text-white transition-all">
                <Clock size={16} />
                <span>Save to Watch later</span>
              </button>
              <button onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!token) return toast.error("Please login to save to playlist");
                setIsPlaylistModalOpen(true);
                setIsMenuOpen(false);
              }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-[14px] text-gray-300 font-medium hover:text-white transition-all">
                <ListPlus size={16} />
                <span>Save to playlist</span>
              </button>
              <button onClick={handleDownload} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-[14px] text-gray-300 font-medium hover:text-white transition-all">
                <Download size={16} />
                <span>Download</span>
              </button>
              <button onClick={handleShare} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-[14px] text-gray-300 font-medium hover:text-white transition-all">
                <Share2 size={16} />
                <span>Share</span>
              </button>

              {isOwner && (
                <>
                  <div className="h-[1px] bg-white/5 my-2" />
                  <button onClick={handleEdit} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-500/10 text-[14px] text-blue-400 font-bold hover:text-blue-300 transition-all">
                    <Edit size={16} />
                    <span>Edit video</span>
                  </button>
                  <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-[14px] text-red-500 font-bold hover:text-red-400 transition-all">
                    <Trash2 size={16} />
                    <span>Delete video</span>
                  </button>
                </>
              )}

              {!isOwner && (
                <>
                  <div className="h-[1px] bg-white/5 my-2" />
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-[14px] text-gray-400 font-medium hover:text-white-all">
                    <Ban size={16} />
                    <span>Not interested</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-[14px] text-red-400 font-medium hover:text-red-300 transition-all">
                    <Flag size={16} />
                    <span>Report</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {isPlaylistModalOpen && (
          <SaveToPlaylistModal
            isOpen={isPlaylistModalOpen}
            onClose={(e) => {
              if (e && e.preventDefault) { e.preventDefault(); e.stopPropagation(); }
              setIsPlaylistModalOpen(false);
            }}
            videoId={video._id}
            token={token}
          />
        )}
      </div>
    </div>
  );
};

export default VideoCard;
