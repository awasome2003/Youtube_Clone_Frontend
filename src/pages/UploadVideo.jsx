import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Link } from "react-router-dom";

const UploadVideo = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/mkv"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Please upload a valid video file (MP4, MOV, AVI, MKV)");
        return;
      }

      // Validate file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error("Video file size must be less than 100MB");
        return;
      }

      setFile(selectedFile);
      
      // Create preview URL for video
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    if (!file) {
      toast.error("Please select a video file to upload");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("video", file);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("userId", JSON.parse(localStorage.getItem("user"))._id);
    formDataToSend.append("tags", formData.tags);

    setIsSubmitting(true);
    setProgress(0);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/videos/upload`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(progress);
          },
        }
      );

      if (response.data.success) {
        toast.success("Video uploaded successfully!");
        
        // Navigate to the uploaded video's details page
        setTimeout(() => {
          navigate(`/video/${response.data.data.id}`);
        }, 1000);
      } else {
        toast.error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to upload video. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setProgress(0);
    }
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Video</h1>
            <p className="text-gray-600 mb-6">Share your video with the world</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Video Preview Section */}
              {previewUrl && (
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Video Preview</h3>
                  <video
                    src={previewUrl}
                    controls
                    className="w-full max-w-md mx-auto rounded-lg"
                  />
                </div>
              )}

              {/* File Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors duration-200">
                <input
                  type="file"
                  id="video-upload"
                  accept="video/mp4,video/mov,video/avi,video/mkv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-lg font-medium text-gray-900">
                      {file ? file.name : "Click to upload video"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      MP4, MOV, AVI, or MKV (MAX. 100MB)
                    </p>
                  </div>
                </label>
                {file && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
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

              {/* Progress Bar */}
              {isSubmitting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !file}
                  className={`flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isSubmitting || !file
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <span className="spinner mr-2"></span>
                      Uploading...
                    </span>
                  ) : (
                    "Upload Video"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
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

export default UploadVideo;