import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, Edit3, Play } from "lucide-react";

const VideoCard = ({ video, fetchVideos }) => {
  const { user } = useAuth();
  
  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/videos/${video._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (res.data.status === "success") {
        toast.success("Liked the video!");
        fetchVideos();
      } else if (res.data.message === "You already liked this video") {
        toast.info("Already liked");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error liking video");
    }
  };

  const handleDislike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/videos/${video._id}/dislike`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (res.data.status === "success") {
        toast.success("Disliked the video!");
        fetchVideos();
      } else if (res.data.message === "You already disliked this video") {
        toast.info("Already disliked");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error disliking video");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/videos/save`,
        { videoId: video._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Saved to Watch Later!");
        fetchVideos();
      } else {
        toast.info("Already in Watch Later");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving video");
    }
  };

  const isLiked = user && video.likes?.includes(user._id);
  const isDisliked = user && video.dislikes?.includes(user._id);
  const isSaved = user && user.watchLaterVideos?.includes(video._id);

  return (
    <div className="video-card">
      {/* Video Thumbnail */}
      <div className="relative group">
        <Link to={`/video/${video._id}`} className="block aspect-video overflow-hidden">
          <img
            src={
              video.thumbnailUrl
                ? `${import.meta.env.VITE_API_URL}${video.thumbnailUrl}`
                : "/default-thumbnail.jpg"
            }
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Play className="text-white w-12 h-12" fill="currentColor" />
            </div>
          </div>
        </Link>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration || "0:00"}
        </div>
      </div>

      {/* Video Info */}
      <div className="p-3">
        <div className="flex space-x-3">
          <Link to={`/channel/${video.userId?._id || video.userId}`} className="flex-shrink-0">
            <img
              src={video.userId?.avatar || "/default-avatar.jpg"}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 leading-tight">
              <Link to={`/video/${video._id}`} className="hover:underline block" title={video.title}>
                {video.title}
              </Link>
            </h3>
            <p className="text-gray-600 text-sm mb-1">
              <Link to={`/channel/${video.userId?._id || video.userId}`} className="hover:underline">
                {video.userId?.username || "Unknown"}
              </Link>
            </p>
            <div className="flex text-gray-500 text-xs space-x-2">
              <span>{video.views || 0} views</span>
              <span>•</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center space-x-1 transition-colors duration-200 ${
                isLiked ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <ThumbsUp size={16} />
              <span className="text-sm">{video.likes?.length || 0}</span>
            </button>
            <button
              onClick={handleDislike}
              disabled={!user}
              className={`flex items-center space-x-1 transition-colors duration-200 ${
                isDisliked ? "text-red-600" : "text-gray-600 hover:text-red-600"
              }`}
            >
              <ThumbsDown size={16} />
              <span className="text-sm">{video.dislikes?.length || 0}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!user}
              className={`flex items-center space-x-1 transition-colors duration-200 ${
                isSaved
                  ? "text-green-600"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          </div>
          
          {/* Edit button for video owner */}
          {user && video.userId && user._id === video.userId._id && (
            <Link 
              to={`/video/${video._id}/edit`}
              className="text-gray-600 hover:text-red-600 transition-colors duration-200"
              title="Edit Video"
            >
              <Edit3 size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
