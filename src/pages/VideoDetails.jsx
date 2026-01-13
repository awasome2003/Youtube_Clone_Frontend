
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Download, Scissors, Library, ListPlus, Send, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import VideoCard from "../components/VideoCard";

const VideoDetails = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { user, token } = useAuth();
  const viewRecorded = useRef(null);
  const navigate = useNavigate();

  const videoUrl = `${import.meta.env.VITE_API_URL}/api/videos/${id}/stream`;
  const shareUrl = window.location.href;

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos/${id}`);
      setVideo(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load video");
      toast.error("Failed to load video");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos/${id}/comments`);
      setComments(res.data.data.comments || []);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  const fetchRecommended = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos/${id}/recommendations`);
      setRecommendedVideos(res.data.data || []);
    } catch (err) {
      console.error("Failed to load recommendations", err);
    }
  };

  const recordView = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/videos/${id}/view`,
        {},
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      if (res.data.status === "success") {
        setVideo(prev => prev ? { ...prev, views: res.data.data.views } : prev);
      }
    } catch (err) {
      console.error("Failed to record view", err);
    }
  };

  useEffect(() => {
    fetchVideo();
    fetchComments();
    fetchRecommended();

    // Only record if we haven't for this specific video ID in this mount session
    if (viewRecorded.current !== id) {
      recordView();
      viewRecorded.current = id;
    }

    window.scrollTo(0, 0);
  }, [id]);

  const handleLike = async () => {
    if (!token) return toast.error("Please log in to like videos");
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/videos/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVideo();
    } catch (err) {
      toast.error("Error liking video");
    }
  };

  const handleDislike = async () => {
    if (!token) return toast.error("Please log in to dislike videos");
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/videos/${id}/dislike`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVideo();
    } catch (err) {
      toast.error("Error disliking video");
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!token) return toast.error("Please log in to interact with comments");
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/comments/${commentId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch (err) {
      toast.error("Error liking comment");
    }
  };

  const handleCommentDislike = async (commentId) => {
    if (!token) return toast.error("Please log in to interact with comments");
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/comments/${commentId}/dislike`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch (err) {
      toast.error("Error disliking comment");
    }
  };

  const handleSubscribe = async () => {
    if (!token) return toast.error("Please log in to subscribe");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/subscribe/${video.userId._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);

      // Toggle subscription state locally based on response or current state
      setVideo(prev => ({
        ...prev,
        userId: {
          ...prev.userId,
          subscribers: res.data.isSubscribed
            ? [...(prev.userId.subscribers || []), user._id]
            : (prev.userId.subscribers || []).filter(id => id !== user._id)
        }
      }));
    } catch (err) {
      toast.error("Error subscribing");
    }
  };

  const handleEdit = () => {
    navigate(`/video/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/videos/${id}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Video deleted successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete video");
    }
  };

  const handleDownload = async () => {
    try {
      toast.info("Starting download...");
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${video.title.replace(/\s+/g, '_')}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Try again.");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!token) return toast.error("Please log in to comment");

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/videos/${id}/comments`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      fetchComments();
      toast.success("Comment added!");
    } catch (err) {
      toast.error("Error adding comment");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  if (loading && !video) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-[1700px] mx-auto">
        <div className="flex-1">
          <div className="aspect-video w-full bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-8 w-3/4 bg-gray-100 rounded mt-4 animate-pulse" />
        </div>
        <div className="lg:w-[400px] space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-2 h-24 bg-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">{error || "Video not found"}</h2>
        <Link to="/" className="px-6 py-2 bg-black text-white rounded-full">Explore Videos</Link>
      </div>
    );
  }

  const isSubscribed = user && video.userId?.subscribers?.includes(user._id);
  const isLiked = user && video.likes?.includes(user._id);
  const isDisliked = user && video.dislikes?.includes(user._id);

  return (
    <div className="max-w-[1700px] mx-auto px-4 lg:px-6 py-4">
      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Share</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreHorizontal size={20} className="rotate-90" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 overflow-x-auto no-scrollbar py-2">
                {[
                  { name: 'WhatsApp', color: 'bg-green-500' },
                  { name: 'Facebook', color: 'bg-blue-600' },
                  { name: 'X', color: 'bg-black' },
                  { name: 'Email', color: 'bg-gray-500' }
                ].map(social => (
                  <button key={social.name} className="flex flex-col items-center gap-2 shrink-0">
                    <div className={`${social.color} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform`}>
                      <Share2 size={20} />
                    </div>
                    <span className="text-[11px] font-medium">{social.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center bg-gray-100 p-2 rounded-xl border border-gray-200">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent flex-1 text-sm font-medium px-2 focus:outline-none overflow-hidden text-ellipsis"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setIsShareModalOpen(false)} />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Player */}
          <div className="video-container rounded-xl overflow-hidden shadow-2xl bg-black aspect-video relative group">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
              poster={video.thumbnailUrl ? `${import.meta.env.VITE_API_URL}${video.thumbnailUrl}` : `https://picsum.photos/seed/${video._id}/1280/720`}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Title */}
          <h1 className="text-[20px] font-bold mt-4 leading-tight mb-3 line-clamp-2">
            {video.title}
          </h1>

          {/* Actions & Channel Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${video.userId?._id}`} className="shrink-0">
                <img
                  src={video.userId?.avatar ? `${import.meta.env.VITE_API_URL}${video.userId.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.userId?.username}`}
                  alt={video.userId?.username}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-transparent hover:ring-gray-100 transition-all"
                />
              </Link>
              <div className="flex flex-col min-w-0 mr-2">
                <Link to={`/profile/${video.userId?._id}`} className="font-bold text-[16px] truncate hover:text-gray-700">
                  {video.userId?.username}
                </Link>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {video.userId?.subscribers?.length || 0} subscribers
                </span>
              </div>

              {user?._id.toString() !== video.userId?._id.toString() && (
                <button
                  onClick={handleSubscribe}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ml-1 shrink-0 ${isSubscribed
                    ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-800"
                    }`}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <div className="flex items-center bg-gray-100 rounded-full shrink-0">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-200 transition-colors rounded-l-full border-r border-gray-300 ${isLiked ? 'text-black' : 'text-gray-700'}`}
                >
                  <ThumbsUp size={18} fill={isLiked ? "black" : "none"} />
                  <span className="font-medium text-sm">{video.likes?.length || 0}</span>
                </button>
                <button
                  onClick={handleDislike}
                  className={`px-4 py-2 hover:bg-gray-200 transition-colors rounded-r-full ${isDisliked ? 'text-black' : 'text-gray-700'}`}
                >
                  <ThumbsDown size={18} fill={isDisliked ? "black" : "none"} />
                </button>
              </div>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-medium text-sm transition-colors whitespace-nowrap shrink-0"
              >
                <Share2 size={18} />
                Share
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-medium text-sm transition-colors whitespace-nowrap shrink-0 sm:flex"
              >
                <Download size={18} />
                Download
              </button>

              {user?._id.toString() === video.userId?._id.toString() && (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full font-bold text-sm transition-all whitespace-nowrap shrink-0"
                  >
                    <Edit size={18} />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-full font-bold text-sm transition-all whitespace-nowrap shrink-0"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </>
              )}

              <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors shrink-0">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Description Box */}
          <div className="bg-gray-100 rounded-xl p-3 mb-6 transition-all hover:bg-gray-200/50 cursor-default group">
            <div className="flex items-center gap-3 text-sm font-bold mb-1">
              <span>{video.views?.toLocaleString()} views</span>
              <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
            </div>
            <div className={`text-[14px] whitespace-pre-wrap leading-relaxed ${!isDescExpanded ? 'line-clamp-2' : ''}`}>
              {video.description}
            </div>
            {video.description?.length > 100 && (
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-sm font-bold mt-2 hover:text-gray-600 transition-colors"
              >
                {isDescExpanded ? "Show less" : "...more"}
              </button>
            )}

            {video.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {video.tags.map((tag) => (
                  <span key={tag} className="text-blue-600 text-[13px] font-medium hover:underline cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="mb-8">
            <h3 className="text-[20px] font-bold mb-6 flex items-center gap-2">
              {comments.length} <span className="font-normal text-gray-600">Comments</span>
            </h3>

            {user && (
              <div className="flex gap-4 mb-8">
                <img
                  src={user.avatar ? `${import.meta.env.VITE_API_URL}${user.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username}
                  className="h-10 w-10 rounded-full object-cover shrink-0 shadow-sm"
                />
                <form onSubmit={handleAddComment} className="flex-1 group">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full border-b border-gray-300 py-1 focus:outline-none focus:border-black transition-all bg-transparent text-[15px]"
                  />
                  <div className={`justify-end gap-3 mt-3 ${newComment ? 'flex' : 'hidden'} animate-in fade-in slide-in-from-top-2 duration-300`}>
                    <button
                      type="button"
                      onClick={() => setNewComment("")}
                      className="px-4 py-2 hover:bg-gray-100 rounded-full text-sm font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${newComment.trim() ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      Comment
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-7">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-4 group animate-in slide-in-from-bottom-2 duration-300">
                  <img
                    src={comment.user?.avatar ? `${import.meta.env.VITE_API_URL}${comment.user.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.username}`}
                    alt={comment.user?.username}
                    className="h-10 w-10 rounded-full flex-shrink-0 object-cover shadow-sm"
                  />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold">@{comment.user?.username}</span>
                      <span className="text-[12px] text-gray-500 font-medium">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-[14px] text-gray-900 leading-relaxed font-normal">
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleCommentLike(comment._id)}
                          className="flex items-center justify-center h-8 w-8 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                        >
                          <ThumbsUp size={14} fill={comment.likes?.includes(user?._id) ? "black" : "none"} />
                        </button>
                        <span className="text-[12px] text-gray-500 font-medium ml-1">
                          {comment.likeCount > 0 ? comment.likeCount : ''}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCommentDislike(comment._id)}
                        className="flex items-center justify-center h-8 w-8 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                      >
                        <ThumbsDown size={14} fill={comment.dislikes?.includes(user?._id) ? "black" : "none"} />
                      </button>

                      <button className="text-[12px] font-bold hover:bg-gray-100 px-3 py-1.5 rounded-full transition-all ml-2">Reply</button>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 shrink-0 transition-opacity">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Recommended Section */}
        <div className="lg:w-[400px] shrink-0">
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar scroll-smooth">
            {["All", "Related", "Recently Uploaded"].map(cat => (
              <button key={cat} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${cat === 'All' ? 'bg-black text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {recommendedVideos.map(v => (
              <div key={v._id} className="flex gap-3 group cursor-pointer transition-all hover:bg-gray-50 p-1 rounded-xl">
                <Link
                  to={`/video/${v._id}`}
                  onClick={() => window.scrollTo(0, 0)}
                  className="relative h-[94px] w-[168px] shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm"
                >
                  <img
                    src={v.thumbnailUrl ? `${import.meta.env.VITE_API_URL}${v.thumbnailUrl}` : `https://picsum.photos/seed/${v._id}/320/180`}
                    alt={v.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {v.duration && (
                    <div className="absolute bottom-1 right-1 bg-black/80 text-[11px] text-white px-1.5 rounded font-bold">
                      {v.duration}
                    </div>
                  )}
                </Link>
                <div className="flex flex-col min-w-0 pr-2 py-0.5">
                  <Link to={`/video/${v._id}`} onClick={() => window.scrollTo(0, 0)}>
                    <h4 className="text-[14px] font-bold line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {v.title}
                    </h4>
                  </Link>
                  <Link to={`/profile/${v.creator?._id || v.userId?._id}`} className="text-[12px] text-gray-600 mt-1.5 hover:text-black font-medium truncate">
                    {v.creator?.username || v.userId?.username}
                  </Link>
                  <div className="text-[12px] text-gray-500 mt-0.5 font-medium">
                    {v.views?.toLocaleString()} views • {formatDistanceToNow(new Date(v.createdAt), { addSuffix: false })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;
