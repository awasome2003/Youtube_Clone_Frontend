import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

const EditVideo = () => {
  const { id: videoId } = useParams();
  console.log(videoId);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    visibility: "public"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadVideoData();
  }, [videoId]);

  const loadVideoData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/videos/${videoId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data && response.data.data) {
        const videoData = response.data.data;
        setVideo(videoData);

        // Set form data
        setFormData({
          title: videoData.title || "",
          description: videoData.description || "",
          tags: videoData.tags ? videoData.tags.join(", ") : "",
          visibility: videoData.visibility || "public"
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error loading video:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load video data");
      navigate(`/video/${videoId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return false;
    }

    if (formData.title.length > 100) {
      toast.error("Title must be less than 100 characters");
      return false;
    }

    if (formData.description.length > 5000) {
      toast.error("Description must be less than 5000 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare video data, excluding empty values
      const videoData = {
        title: formData.title,
        description: formData.description,
        visibility: formData.visibility
      };

      // Only add tags if they exist and are not empty
      if (formData.tags.trim()) {
        videoData.tags = formData.tags;
      }

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/videos/${videoId}`,
        videoData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success("Video updated successfully!");
      navigate(`/video/${videoId}`);
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error(error.response?.data?.message || "Failed to update video");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/videos/${videoId}/delete`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("Video deleted successfully!");
      navigate(`/profile/${user._id}`);
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error(error.response?.data?.message || "Failed to delete video");
    }
  };

  if (loading && !video) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!video && !loading) {
    return (
      <div className="empty-state">
        <h2 className="empty-state-title">Video not found</h2>
        <p className="empty-state-description">The video you're looking for doesn't exist or you don't have permission to edit it.</p>
        <div className="mt-4">
          <Link
            to="/"
            className="btn btn-primary inline-flex items-center px-4 py-2 text-sm font-medium rounded-md"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Edit Video</h1>
              <p className="text-gray-600">Update your video details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Video Preview */}
              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Video Preview</h3>
                <video
                  src={`${import.meta.env.VITE_API_URL}/api/videos/${videoId}/stream`}
                  controls
                  className="w-full max-w-md mx-auto rounded-lg"
                />
              </div>

              {/* Title Field */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="input"
                  placeholder="Add a title that describes your video"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Description Field */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  rows={4}
                  className="textarea"
                  placeholder="Tell viewers about your video"
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/5000 characters
                </p>
              </div>

              {/* Tags Field */}
              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="input"
                  placeholder="Add tags separated by commas (e.g., tutorial, coding, react)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate tags with commas. Example: tutorial, coding, react
                </p>
              </div>

              {/* Visibility Field */}
              <div>
                <label
                  htmlFor="visibility"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Visibility
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="input"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <span className="spinner mr-2"></span>
                      Updating...
                    </span>
                  ) : (
                    "Update Video"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="py-3 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Video
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/video/${videoId}`)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVideo;