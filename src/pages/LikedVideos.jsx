
import { useState, useEffect } from "react";
import axios from "axios";
import VideoCard from "../components/VideoCard";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { ThumbsUp, Heart, Sparkles, Play } from "lucide-react";

const SkeletonCard = () => (
    <div className="flex flex-col gap-4 animate-pulse">
        <div className="aspect-video w-full bg-white/5 rounded-[32px]" />
        <div className="flex gap-4 px-2">
            <div className="h-10 w-10 min-w-[40px] bg-white/5 rounded-full" />
            <div className="flex flex-col gap-3 w-full">
                <div className="h-5 w-3/4 bg-white/5 rounded-xl" />
                <div className="h-4 w-1/2 bg-white/10 rounded-lg" />
            </div>
        </div>
    </div>
);

const LikedVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const fetchLikedVideos = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos/liked/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVideos(res.data.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to fetch liked videos");
            toast.error("Failed to load favorites");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLikedVideos();
    }, [token]);

    return (
        <div className="max-w-[1700px] mx-auto py-8 lg:py-12 px-4 lg:px-8">
            {/* Cinematic Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
                <div className="flex items-center gap-8 relative z-10">
                    <div className="relative group">
                        <div className="absolute inset-x-0 bottom-0 bg-red-600 blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative w-20 h-20 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[28px] flex items-center justify-center text-white shadow-2xl">
                            <Heart size={32} fill="#ef4444" className="text-red-500 group-hover:scale-125 transition-transform duration-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Curated Favorites
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] font-mono">
                                {videos.length} Assets Endorsed
                            </span>
                            <div className="h-1 w-1 bg-gray-700 rounded-full" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] font-mono">
                                Verified Collection
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="px-8 py-3.5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95">
                        <Play size={18} fill="black" />
                        Play All
                    </button>
                    <button className="px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all shadow-xl flex items-center gap-2">
                        Shuffle Collection
                    </button>
                </div>

                {/* Decorative Background Title */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[120px] font-black text-white/[0.02] italic tracking-tighter uppercase select-none pointer-events-none whitespace-nowrap hidden lg:block">
                    Appreciation
                </div>
            </div>

            {error ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl mb-10 font-bold text-sm tracking-wide flex items-center gap-3">
                    {error}
                </div>
            ) : null}

            {/* Videos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-12">
                {loading && videos.length === 0
                    ? Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)
                    : videos.map((video) => (
                        <div key={video._id} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <VideoCard key={video._id} video={video} fetchVideos={fetchLikedVideos} />
                        </div>
                    ))
                }
            </div>

            {/* Empty State */}
            {!loading && videos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-40 text-center animate-in zoom-in duration-1000">
                    <div className="relative group mb-10">
                        <div className="absolute inset-0 bg-red-500 blur-[80px] opacity-10" />
                        <div className="relative w-32 h-32 bg-white/5 rounded-full flex items-center justify-center text-gray-700 border border-white/5 shadow-inner">
                            <Heart size={56} className="text-gray-800" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Null Affinity Detected</h3>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed uppercase text-[10px] tracking-[0.2em]">
                        Your curated collection of cinematic endorsements is currently empty. Find something that moves you.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-12 px-10 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl uppercase tracking-widest text-xs"
                    >
                        Discover Content
                    </button>
                </div>
            )}
        </div>
    );
};

export default LikedVideos;
