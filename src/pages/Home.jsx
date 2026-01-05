// src/pages/Home.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import VideoCard from "../components/VideoCard";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const searchQuery = searchParams.get("search") || "";
  const limit = searchParams.get("limit") || 20;

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery,
        limit: limit,
      };

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      // console.log(res.data.data[0].thumbnailUrl);
      setVideos(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch videos");
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [searchQuery, limit]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get("search");
    setSearchParams({ search });
  };

  const handleLoadMore = () => {
    setSearchParams((prev) => {
      const newLimit = parseInt(prev.get("limit") || 20);
      return { ...Object.fromEntries(prev), limit: newLimit + 10 };
    });
  };

  if (loading && videos.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Bar */}
      <div className="mb-8">
        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto"
        >
          <div className="flex">
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search videos..."
              className="w-full px-4 py-3 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-red-600 text-white px-8 py-3 rounded-r-full hover:bg-red-700 transition-colors duration-200"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : "Recommended Videos"}
        </h1>
        {videos.length > 0 && (
          <span className="text-sm text-gray-500">
            {videos.length} {videos.length === 1 ? "video" : "videos"}
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Videos Grid */}
      <div className="video-grid">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} fetchVideos={fetchVideos} />
        ))}
      </div>

      {/* Empty State */}
      {!loading && videos.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="empty-state-title">No videos found</h3>
          <p className="empty-state-description">
            {searchQuery
              ? `No videos match your search for "${searchQuery}"`
              : "No videos available yet. Be the first to upload a video!"}
          </p>
          {user && (
            <div className="mt-4">
              <Link 
                to="/upload" 
                className="btn btn-primary inline-flex items-center px-4 py-2 text-sm font-medium rounded-md"
              >
                Upload Video
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Load More Button */}
      {videos.length >= limit && (
        <div className="flex justify-center mt-12">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="btn btn-secondary px-6 py-3 text-base"
          >
            {loading ? (
              <span className="flex items-center">
                <span className="spinner mr-2"></span>
                Loading...
              </span>
            ) : (
              "Load More Videos"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
