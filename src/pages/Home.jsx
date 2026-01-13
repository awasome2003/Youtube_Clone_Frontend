
import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import VideoCard from "../components/VideoCard";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const categories = [
  "All", "Music", "Gaming", "Javascript", "React Router", "Programming",
  "Movies", "Live", "Cricket", "News", "Gadgets", "Trailers", "Lo-fi", "Recently uploaded", "Watched"
];

const SkeletonCard = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="aspect-video w-full bg-gray-200 rounded-xl" />
    <div className="flex gap-3 px-1">
      <div className="h-10 w-10 min-w-[40px] bg-gray-200 rounded-full" />
      <div className="flex flex-col gap-2 w-full">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const { user } = useAuth();

  const searchQuery = searchParams.get("search") || "";
  const limit = searchParams.get("limit") || 20;

  const fetchVideos = async () => {
    try {
      setLoading(true);
      let res;

      if (activeCategory === "Watched") {
        if (!user) {
          setVideos([]);
          setLoading(false);
          toast.info("Please login to view watch history");
          return;
        }
        res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos/history/all`, {
          params: { limit },
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
      } else {
        const params = {
          search: searchQuery,
          limit: limit,
          category: activeCategory !== "All" && activeCategory !== "Recently uploaded" ? activeCategory : undefined,
        };

        res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos`, {
          params,
        });
      }

      setVideos(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to fetch videos");
      // Only show toast for actual errors, not auth info
      if (activeCategory !== "Watched" || user) {
        toast.error("Failed to load videos");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [searchQuery, limit, activeCategory]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    // Ideally, we would filter or fetch based on category
    // For now, let's just simulate the discovery feel
  };

  return (
    <div className="max-w-[1800px] mx-auto">
      {/* Category Chips - Sticky below navbar */}
      <div className="sticky top-14 bg-white z-30 py-3 -mx-4 px-4 overflow-x-auto no-scrollbar border-b border-transparent hover:border-gray-100 transition-colors">
        <div className="flex gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${activeCategory === cat
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="py-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        ) : null}

        {/* Videos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
          {loading && videos.length === 0
            ? Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : videos.map((video) => (
              <VideoCard key={video._id} video={video} fetchVideos={fetchVideos} />
            ))
          }
        </div>

        {/* Empty State */}
        {!loading && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">No videos found</h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              {searchQuery
                ? `No videos match your search for "${searchQuery}"`
                : "Try looking for something else or upload your own video to get started!"}
            </p>
          </div>
        )}

        {/* Load More Trigger */}
        {!loading && videos.length >= limit && (
          <div className="flex justify-center mt-12 mb-8">
            <button
              onClick={() => setSearchParams(p => ({ ...Object.fromEntries(p), limit: parseInt(limit) + 20 }))}
              className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Show more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
