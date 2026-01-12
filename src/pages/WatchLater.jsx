
import { useState, useEffect } from "react";
import axios from "axios";
import VideoCard from "../components/VideoCard";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Clock } from "lucide-react";

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

const WatchLater = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const fetchWatchLaterVideos = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me/watch-later`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVideos(res.data.data.videos || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to fetch Watch Later videos");
            toast.error("Failed to load Watch Later videos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchLaterVideos();
    }, [token]);

    return (
        <div className="max-w-[1800px] mx-auto py-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-black">
                    <Clock size={24} fill="currentColor" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Watch Later</h1>
                    <p className="text-gray-500 text-sm">{videos.length} videos</p>
                </div>
            </div>

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
                        <VideoCard key={video._id} video={video} fetchVideos={fetchWatchLaterVideos} />
                    ))
                }
            </div>

            {/* Empty State */}
            {!loading && videos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Clock size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No videos in Watch Later</h3>
                    <p className="text-gray-500 mt-1 max-w-sm">
                        Videos you save to Watch Later will appear here.
                    </p>
                </div>
            )}
        </div>
    );
};

export default WatchLater;
