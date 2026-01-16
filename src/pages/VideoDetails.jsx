
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Download, Scissors, Library, ListPlus, Send, Edit, Trash2, Sparkles, X, Heart, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import VideoCard from "../components/VideoCard";
import InsightIQ from "../components/InsightIQ";
import SaveToPlaylistModal from "../components/SaveToPlaylistModal";

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
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const { user, token } = useAuth();
  const viewRecorded = useRef(null);
  const videoRef = useRef(null);
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

  const handleSeek = (timeInSeconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timeInSeconds;
      videoRef.current.play();
    }
  };

  if (loading && !video) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-[1700px] mx-auto">
        <div className="flex-1">
          <div className="aspect-video w-full bg-white/5 rounded-[32px] animate-pulse shadow-2xl" />
          <div className="h-10 w-3/4 bg-white/5 rounded-2xl mt-6 animate-pulse" />
          <div className="h-24 w-full bg-white/5 rounded-2xl mt-4 animate-pulse" />
        </div>
        <div className="lg:w-[400px] space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-4 h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-500">
          <Video size={40} />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">{error || "Video not found"}</h2>
        <p className="text-gray-400 mb-8">This video may have been removed or is currently unavailable.</p>
        <Link to="/" className="px-10 py-3 bg-white text-black font-black rounded-full hover:scale-105 transition-transform shadow-xl">
          Back to Explore
        </Link>
      </div>
    );
  }

  const isSubscribed = user && video.userId?.subscribers?.includes(user._id);
  const isLiked = user && video.likes?.includes(user._id);
  const isDisliked = user && video.dislikes?.includes(user._id);

  return (
    <div className="max-w-[1700px] mx-auto px-4 lg:px-8 py-6 pb-20">
      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-[32px] w-full max-w-md overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-black text-white uppercase tracking-wider">Spread the word</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8 overflow-x-auto no-scrollbar py-2">
                {[
                  { name: 'WhatsApp', color: 'bg-green-500' },
                  { name: 'Facebook', color: 'bg-blue-600' },
                  { name: 'X', color: 'bg-black border border-white/10' },
                  { name: 'Email', color: 'bg-gray-600' }
                ].map(social => (
                  <button key={social.name} className="flex flex-col items-center gap-3 shrink-0 group">
                    <div className={`${social.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Share2 size={24} />
                    </div>
                    <span className="text-[12px] font-bold text-gray-400 group-hover:text-white transition-colors">{social.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center bg-white/5 p-2.5 rounded-2xl border border-white/10 group focus-within:border-blue-500/50 transition-all">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent flex-1 text-sm font-medium px-3 focus:outline-none overflow-hidden text-ellipsis text-gray-300"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-white text-black px-6 py-2 rounded-xl text-sm font-black hover:scale-[1.02] active:scale-95 transition-all shrink-0 shadow-lg"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setIsShareModalOpen(false)} />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Player Container */}
          <div className="relative group aspect-video w-full rounded-[32px] overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.6)] border border-white/5 bg-black">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
              poster={video.thumbnailUrl ? `${import.meta.env.VITE_API_URL}${video.thumbnailUrl}` : `https://picsum.photos/seed/${video._id}/1280/720`}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Title and Metadata */}
          <div className="mt-8">
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-4 tracking-tight">
              {video.title}
            </h1>

            {/* Actions Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-white/5">
              <div className="flex items-center gap-4">
                <Link to={`/profile/${video.userId?._id}`} className="shrink-0 group">
                  <div className="p-1 rounded-full bg-white/10 group-hover:bg-blue-500/20 transition-all">
                    <img
                      src={video.userId?.avatar ? `${import.meta.env.VITE_API_URL}${video.userId.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.userId?.username}`}
                      alt={video.userId?.username}
                      className="h-12 w-12 rounded-full object-cover shadow-xl"
                    />
                  </div>
                </Link>
                <div className="flex flex-col min-w-0 mr-4">
                  <Link to={`/profile/${video.userId?._id}`} className="font-black text-[18px] text-white truncate hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    {video.userId?.username}
                    <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-[7px] text-white">✓</div>
                  </Link>
                  <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                    {video.userId?.subscribers?.length || 0} subscribers
                  </span>
                </div>

                {user?._id.toString() !== video.userId?._id.toString() && (
                  <button
                    onClick={handleSubscribe}
                    className={`px-8 py-2.5 rounded-full text-sm font-black transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 ${isSubscribed
                      ? "bg-white/10 text-white border border-white/10 hover:bg-white/20"
                      : "bg-white text-black"
                      }`}
                  >
                    {!isSubscribed && <Heart size={16} className="fill-current" />}
                    {isSubscribed ? "Subscribed" : "Subscribe"}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
                {/* Like/Dislike Group */}
                <div className="flex items-center bg-white/5 border border-white/10 rounded-[20px] p-1 shadow-xl">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-6 py-2.5 hover:bg-white/10 transition-all rounded-l-[16px] border-r border-white/10 group ${isLiked ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'}`}
                  >
                    <ThumbsUp size={18} className={`${isLiked ? 'fill-current' : 'group-hover:scale-110'}`} />
                    <span className="font-black text-sm">{video.likes?.length || 0}</span>
                  </button>
                  <button
                    onClick={handleDislike}
                    className={`px-5 py-2.5 hover:bg-white/10 transition-all rounded-r-[16px] group ${isDisliked ? 'text-red-400 bg-red-500/10' : 'text-gray-300'}`}
                  >
                    <ThumbsDown size={18} className={`${isDisliked ? 'fill-current' : 'group-hover:scale-110'}`} />
                  </button>
                </div>

                {/* Ask AI Button */}
                <button
                  onClick={() => setIsInsightOpen(true)}
                  className="group relative flex items-center gap-2 px-8 py-3 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-[20px] font-black text-sm transition-all shadow-[0_10px_30px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.6)] hover:scale-105 active:scale-95 shrink-0 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Sparkles size={18} className="animate-pulse" />
                  <span className="relative">InsightIQ AI</span>
                </button>

                {/* Other Actions */}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[20px] font-black text-sm transition-all whitespace-nowrap shrink-0 group"
                >
                  <Share2 size={18} className="group-hover:rotate-12 transition-transform" />
                  Share
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[20px] font-black text-sm transition-all whitespace-nowrap shrink-0"
                >
                  <Download size={18} />
                  Download
                </button>

                {user?._id.toString() === video.userId?._id.toString() && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-[20px] font-black text-sm transition-all whitespace-nowrap shrink-0"
                    >
                      <Edit size={18} /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-[20px] font-black text-sm transition-all whitespace-nowrap shrink-0"
                    >
                      <Trash2 size={18} /> Delete
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    if (!token) return toast.error("Please login to save to playlist");
                    setIsPlaylistModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[20px] font-black text-sm transition-all whitespace-nowrap shrink-0 group"
                >
                  <ListPlus size={18} className="group-hover:scale-110 transition-transform" />
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Description View */}
          <div className="bg-white/5 backdrop-blur-3xl rounded-[28px] p-6 mt-8 border border-white/10 hover:border-white/20 transition-all shadow-2xl relative">
            <div className="flex items-center gap-4 text-sm font-black text-white mb-4 tracking-wider uppercase">
              <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-blue-400" /> {video.views?.toLocaleString()} views</span>
              <span className="opacity-20">•</span>
              <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
            </div>

            <div className={`text-[15px] text-gray-300 whitespace-pre-wrap leading-relaxed font-medium ${!isDescExpanded ? 'line-clamp-3' : ''}`}>
              {video.description}
            </div>

            {(video.description?.length > 150 || video.tags?.length > 0) && (
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-sm font-black text-white mt-4 bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10 transition-all border border-white/5"
              >
                {isDescExpanded ? "Show less" : "Read more about this video"}
              </button>
            )}

            {isDescExpanded && video.tags?.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/5">
                {video.tags.map((tag) => (
                  <span key={tag} className="text-blue-400 text-[13px] font-black hover:text-blue-300 cursor-pointer bg-blue-400/5 px-3 py-1 rounded-lg border border-blue-400/10">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-10">
              <MessageCircle size={28} className="text-white" />
              <h3 className="text-2xl font-black text-white">
                {comments.length} <span className="text-gray-500 text-xl font-bold ml-1">Comments</span>
              </h3>
            </div>

            {user && (
              <div className="flex gap-4 mb-12 bg-white/5 p-6 rounded-[24px] border border-white/5 shadow-2xl">
                <img
                  src={user.avatar ? `${import.meta.env.VITE_API_URL}${user.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username}
                  className="h-12 w-12 rounded-full object-cover shrink-0 ring-2 ring-white/5 shadow-xl"
                />
                <form onSubmit={handleAddComment} className="flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Contribute to the conversation..."
                    className="w-full bg-transparent border-b-2 border-white/10 py-2 focus:outline-none focus:border-blue-500 transition-all text-white text-[16px] placeholder:text-gray-600"
                  />
                  <div className={`justify-end gap-3 mt-4 ${newComment ? 'flex' : 'hidden'} animate-in fade-in slide-in-from-top-4 duration-500`}>
                    <button
                      type="button"
                      onClick={() => setNewComment("")}
                      className="px-6 py-2.5 text-gray-400 hover:text-white font-black text-sm transition-all"
                    >
                      Dismiss
                    </button>
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className={`px-8 py-2.5 rounded-2xl text-sm font-black transition-all shadow-xl ${newComment.trim() ? 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95' : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'}`}
                    >
                      Post Comment
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-10 px-2 mt-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-5 group animate-in slide-in-from-bottom-6 duration-700">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex-shrink-0 relative">
                    <img
                      src={comment.user?.avatar ? `${import.meta.env.VITE_API_URL}${comment.user.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.username}`}
                      alt={comment.user?.username}
                      className="h-full w-full rounded-full object-cover shadow-lg border border-white/5"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-black text-white hover:text-blue-400 cursor-pointer transition-colors">@{comment.user?.username}</span>
                      <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-[15px] text-gray-300 leading-relaxed font-medium">
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        <button
                          onClick={() => handleCommentLike(comment._id)}
                          className={`flex items-center justify-center h-6 w-6 transition-all ${comment.likes?.includes(user?._id) ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
                        >
                          <ThumbsUp size={16} fill={comment.likes?.includes(user?._id) ? "currentColor" : "none"} />
                        </button>
                        <span className="text-[13px] text-gray-400 font-black">
                          {comment.likeCount > 0 ? comment.likeCount : '0'}
                        </span>
                        <div className="h-3 w-[1px] bg-white/10 mx-1" />
                        <button
                          onClick={() => handleCommentDislike(comment._id)}
                          className={`flex items-center justify-center h-6 w-6 transition-all ${comment.dislikes?.includes(user?._id) ? 'text-red-400' : 'text-gray-500 hover:text-white'}`}
                        >
                          <ThumbsDown size={16} fill={comment.dislikes?.includes(user?._id) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <button className="text-[12px] font-black text-gray-500 hover:text-white uppercase tracking-widest px-4 py-2 hover:bg-white/5 rounded-xl transition-all">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Sidebar */}
        <div className="lg:w-[420px] shrink-0">
          <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar scroll-smooth">
            {["All Feed", "Related", "From Creator", "Trending"].map(cat => (
              <button key={cat} className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${cat === 'All Feed' ? 'bg-white text-black shadow-xl shadow-white/5' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            {recommendedVideos.map(v => (
              <div key={v._id} className="flex gap-4 group cursor-pointer">
                <Link
                  to={`/video/${v._id}`}
                  onClick={() => window.scrollTo(0, 0)}
                  className="relative h-24 w-44 shrink-0 rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-white/20 transition-all shadow-xl"
                >
                  <img
                    src={v.thumbnailUrl ? `${import.meta.env.VITE_API_URL}${v.thumbnailUrl}` : `https://picsum.photos/seed/${v._id}/320/180`}
                    alt={v.title}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {v.duration && (
                    <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border border-white/10">
                      {v.duration}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <div className="flex flex-1 flex-col min-w-0 py-1">
                  <Link to={`/video/${v._id}`} onClick={() => window.scrollTo(0, 0)}>
                    <h4 className="text-[14px] font-black text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                      {v.title}
                    </h4>
                  </Link>
                  <Link to={`/profile/${v.creator?._id || v.userId?._id}`} className="text-[12px] text-gray-500 mt-2 hover:text-white font-bold truncate flex items-center gap-1.5">
                    {v.creator?.username || v.userId?.username}
                    <div className="w-2.5 h-2.5 bg-gray-600 rounded-full flex items-center justify-center text-[6px] text-white">✓</div>
                  </Link>
                  <div className="text-[11px] text-gray-600 mt-1 font-bold uppercase tracking-tight">
                    {v.views?.toLocaleString()} views • {formatDistanceToNow(new Date(v.createdAt), { addSuffix: false })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <InsightIQ
        isOpen={isInsightOpen}
        onClose={() => setIsInsightOpen(false)}
        videoTitle={video.title}
        videoDescription={video.description}
        videoTags={video.tags}
        duration={video.duration}
        onSeek={handleSeek}
      />

      {isPlaylistModalOpen && (
        <SaveToPlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          videoId={video._id}
          token={token}
        />
      )}
    </div>
  );
};

export default VideoDetails;
