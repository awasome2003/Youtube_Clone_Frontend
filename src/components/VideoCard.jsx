import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoreVertical, Clock, ListPlus, Download, Share2, Ban, Flag, Trash2, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const VideoCard = ({ video }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();

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
      <Link to={`/video/${video._id}`} className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 group-hover:rounded-none"
          loading="lazy"
        />
        {video.duration && (
          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[12px] font-medium text-white">
            {video.duration}
          </div>
        )}
      </Link>

      {/* Info Section */}
      <div className="flex gap-3 px-1">
        <Link to={`/profile/${video.userId?._id}`} className="flex-shrink-0 mt-0.5">
          <img
            src={avatarUrl}
            alt={video.userId?.username}
            className="h-9 w-9 rounded-full object-cover"
          />
        </Link>
        <div className="flex flex-1 flex-col overflow-hidden">
          <Link to={`/video/${video._id}`}>
            <h3 className="line-clamp-2 text-[16px] font-bold leading-tight text-gray-900 group-hover:text-black">
              {video.title}
            </h3>
          </Link>
          <div className="mt-1 flex flex-col text-[14px] text-gray-500">
            <Link to={`/profile/${video.userId?._id}`} className="hover:text-gray-900 transition-colors truncate">
              {video.userId?.username || "Unknown Channel"}
            </Link>
            <div className="flex items-center gap-1">
              <span>{formatViews(video.views || 0)} views</span>
              <span className="text-[10px]">{" • "}</span>
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
            className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ${isMenuOpen ? 'bg-gray-100 opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <MoreVertical size={18} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              <button onClick={handleWatchLater} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-[14px]">
                <Clock size={16} />
                <span>Save to Watch later</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-[14px]">
                <ListPlus size={16} />
                <span>Save to playlist</span>
              </button>
              <button onClick={handleDownload} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-[14px]">
                <Download size={16} />
                <span>Download</span>
              </button>
              <button onClick={handleShare} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-[14px]">
                <Share2 size={16} />
                <span>Share</span>
              </button>

              {isOwner && (
                <>
                  <div className="h-[1px] bg-gray-100 my-1" />
                  <button onClick={handleEdit} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-[14px] text-blue-600 font-medium">
                    <Edit size={16} />
                    <span>Edit video</span>
                  </button>
                  <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-[14px] text-red-600 font-medium">
                    <Trash2 size={16} />
                    <span>Delete video</span>
                  </button>
                </>
              )}

              {!isOwner && (
                <>
                  <div className="h-[1px] bg-gray-100 my-1" />
                  <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-[14px]">
                    <Ban size={16} />
                    <span>Not interested</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-[14px]">
                    <Flag size={16} />
                    <span>Report</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
