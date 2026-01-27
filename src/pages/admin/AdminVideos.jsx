import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Trash2, Shield, User, Play, Clock, Search, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";

const AdminVideos = () => {
    const { token } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchVideos();
    }, [token]);

    const fetchVideos = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/videos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(res.data.data.videos);
        } catch (err) {
            toast.error("Failed to fetch videos");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm("Are you sure you want to delete this video?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/videos/${videoId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(videos.filter(v => v._id !== videoId));
            toast.success("Video deleted successfully");
        } catch (err) {
            toast.error("Failed to delete video");
        }
    };

    const filteredVideos = videos.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.userId?.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center h-[80vh] text-white">Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold text-white">Video Management</h1>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search videos by title or author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredVideos.map((video) => (
                    <div key={video._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-6 hover:bg-white/10 transition-all group">
                        <div className="relative w-full sm:w-64 h-36 rounded-xl overflow-hidden bg-black flex-shrink-0">
                            <img
                                src={video.thumbnailUrl?.startsWith('http') ? video.thumbnailUrl : `${import.meta.env.VITE_API_URL}${video.thumbnailUrl}`}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Play className="text-white bg-red-600 rounded-full p-3" size={48} />
                            </div>
                            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {video.duration || '0:00'}
                            </span>
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h3 className="text-lg font-bold text-white line-clamp-2 mb-2">{video.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <User size={14} className="text-blue-400" />
                                        <span>{video.userId?.username || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye size={14} className="text-purple-400" />
                                        <span>{video.views} views</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-yellow-400" />
                                        <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${video.category ? 'bg-white/10 text-gray-300' : 'hidden'
                                        }`}>
                                        {video.category}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDeleteVideo(video._id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl text-sm font-semibold transition-all border border-red-600/20"
                                    >
                                        <Trash2 size={16} />
                                        Delete Video
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredVideos.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-white/5 border border-white/10 rounded-2xl">
                        No videos found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminVideos;
