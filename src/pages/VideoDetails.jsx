import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, Share2, MoreHorizontal } from "lucide-react";

const VideoDetails = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const { user, token } = useAuth();

  const videoUrl = `${import.meta.env.VITE_API_URL}/api/videos/${id}/stream`;

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/videos/${id}`
      );
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
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/comments/video/${id}`
      );
      setComments(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load comments");
    }
  };

  useEffect(() => {
    fetchVideo();
    fetchComments();
  }, [id]);

  if (loading && !video) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <h2 className="empty-state-title text-red-600">Error</h2>
        <p className="empty-state-description">{error}</p>
        <Link 
          to="/" 
          className="btn btn-primary inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mt-4"
        >
          Go Home
        </Link>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="empty-state">
        <h2 className="empty-state-title">Video not found</h2>
        <Link 
          to="/" 
          className="btn btn-primary inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mt-4"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const handleLike = async () => {
    if (!token) {
      toast.error("Please log in to like videos");
      return;
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/videos/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === "success") {
        toast.success("Liked the video!");
        fetchVideo();
      } else if (res.data.message === "You already liked this video") {
        toast.info("Already liked");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error liking video");
    }
  };

  const handleDislike = async () => {
    if (!token) {
      toast.error("Please log in to dislike videos");
      return;
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/videos/${id}/dislike`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === "success") {
        toast.success("Disliked the video!");
        fetchVideo();
      } else if (res.data.message === "You already disliked this video") {
        toast.info("Already disliked");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error disliking video");
    }
  };

  const handleSave = async () => {
    if (!token) {
      toast.error("Please log in to save videos");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/videos/save`,
        { videoId: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success("Saved to Watch Later!");
      } else {
        toast.info("Already in Watch Later");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving video");
    }
  };

  const handleSubscribe = async () => {
    if (!token) {
      toast.error("Please log in to subscribe");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/subscriptions/subscribe`,
        { userId: video.userId._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        fetchVideo();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error subscribing");
    }
  };

  const handleUnsubscribe = async () => {
    if (!token) {
      toast.error("Please log in to unsubscribe");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/subscriptions/unsubscribe`,
        { userId: video.userId._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        fetchVideo();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error unsubscribing");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (!token) {
      toast.error("Please log in to comment");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/comments`,
        { videoId: id, content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewComment("");
      fetchComments();
      toast.success("Comment added successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding comment");
    }
  };

  const isLiked = user && video.likes?.includes(user._id);
  const isDisliked = user && video.dislikes?.includes(user._id);
  const isSaved = user && user.watchLaterVideos?.includes(video._id);
  const isSubscribed = user && video.userId?.subscribers?.includes(user._id);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-2">
          <div className="video-player mb-4">
            <video
              src={videoUrl}
              controls
              className="w-full h-full"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-3">{video.title}</h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Link to={`/channel/${video.userId?._id || video.userId}`} className="flex items-center space-x-3">
                  <img
                    src={video.userId?.avatar || "/default-avatar.jpg"}
                    alt={video.userId?.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </Link>
                <div>
                  <Link to={`/channel/${video.userId?._id || video.userId}`} className="font-medium text-gray-900 hover:underline">
                    {video.userId?.username}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {video.userId?.subscribers?.length || 0} subscribers
                  </p>
                </div>
              </div>

              {user && user._id !== video.userId?._id && (
                <button
                  onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    isSubscribed
                      ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {isSubscribed ? "Unsubscribe" : "Subscribe"}
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                disabled={!user}
                className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-colors duration-200 ${
                  isLiked
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <ThumbsUp size={18} />
                <span className="text-sm">{video.likes?.length || 0}</span>
              </button>
              <button
                onClick={handleDislike}
                disabled={!user}
                className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-colors duration-200 ${
                  isDisliked
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <ThumbsDown size={18} />
                <span className="text-sm">{video.dislikes?.length || 0}</span>
              </button>
              <button
                onClick={handleSave}
                disabled={!user}
                className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-colors duration-200 ${
                  isSaved
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
              <button className="flex items-center space-x-1 px-3 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200">
                <Share2 size={18} />
              </button>
              <button className="flex items-center space-x-1 px-3 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
              <span>{video.views || 0} views</span>
              <span>{new Date(video.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-gray-700">{video.description}</p>
            {video.tags?.length > 0 && (
              <div className="mt-3">
                {video.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2 text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </h3>

            {user && (
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex space-x-3">
                  <img
                    src={user.avatar || "/default-avatar.jpg"}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows="3"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        className="btn btn-primary px-4 py-2 text-sm"
                        disabled={!newComment.trim()}
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <img
                    src={comment.userId?.avatar || "/default-avatar.jpg"}
                    alt={comment.userId?.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Link to={`/channel/${comment.userId?._id || comment.userId}`} className="font-medium text-gray-900 hover:underline">
                          {comment.userId?.username}
                        </Link>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Videos */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended</h3>
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-40 h-24 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-2">
                    Sample Video Title {i + 1}
                  </h4>
                  <p className="text-sm text-gray-600">Channel Name</p>
                  <p className="text-xs text-gray-500">100K views • 2 days ago</p>
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
