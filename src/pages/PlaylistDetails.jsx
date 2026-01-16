
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import VideoCard from "../components/VideoCard";
import { ListMusic, Play, Trash2, MoreVertical, Clock, Share2, Edit2, X } from "lucide-react";
import { toast } from "react-toastify";

const PlaylistDetails = () => {
    const { id } = useParams();
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlaylist();
    }, [id]);

    const fetchPlaylist = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/playlists/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlaylist(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load playlist");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Permanently delete this curated collection?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/playlists/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Collection purged");
            navigate("/");
        } catch (err) {
            toast.error("Process failed");
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-20 px-4 md:px-10 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Accessing Curated Vault...</p>
        </div>
    );

    if (!playlist) return <div className="text-white pt-20 text-center">Collection not found.</div>;

    const isOwner = user?._id === playlist.user?._id;

    return (
        <div className="min-h-screen pt-20 px-4 md:px-6 lg:px-10 pb-20">
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Playlist Sidebar Info */}
                <div className="lg:w-[380px] shrink-0">
                    <div className="rounded-[32px] overflow-hidden bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-white/10 backdrop-blur-3xl p-6 lg:sticky lg:top-24">
                        <div className="aspect-video rounded-2xl overflow-hidden mb-6 relative group border border-white/10 shadow-2xl">
                            {playlist.videos.length > 0 ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}${playlist.videos[0].thumbnailUrl}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    alt="Cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-700 italic">
                                    Empty Vault
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play size={40} className="text-white" fill="white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic">
                            {playlist.name}
                        </h1>

                        <div className="flex flex-col gap-1 text-sm font-bold mb-6">
                            <span className="text-white">{playlist.user?.username}</span>
                            <div className="flex items-center gap-2 text-gray-400">
                                <span>{playlist.videos.length} items</span>
                                <span className="text-[10px] opacity-30">•</span>
                                <span>Updated recently</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-8">
                            <button className="flex-1 bg-white text-black h-12 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2">
                                <Play size={16} fill="black" /> Play All
                            </button>
                            <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10">
                                <Share2 size={18} />
                            </button>
                            {isOwner && (
                                <button
                                    onClick={handleDelete}
                                    className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-all border border-red-500/20"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        {playlist.description && (
                            <p className="text-sm text-gray-400 font-medium leading-relaxed border-t border-white/5 pt-6">
                                {playlist.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Video List */}
                <div className="flex-1">
                    {playlist.videos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-10 gap-x-6">
                            {playlist.videos.map((video, index) => (
                                <div key={video._id} className="relative group/item flex flex-col">
                                    <div className="absolute -left-8 top-10 font-mono text-[10px] text-gray-700 font-black opacity-0 lg:group-hover/item:opacity-100 transition-opacity">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </div>
                                    <VideoCard video={video} />
                                    {isOwner && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await axios.post(`${import.meta.env.VITE_API_URL}/api/playlists/${id}/remove`,
                                                        { videoId: video._id },
                                                        { headers: { Authorization: `Bearer ${token}` } }
                                                    );
                                                    setPlaylist(prev => ({
                                                        ...prev,
                                                        videos: prev.videos.filter(v => v._id !== video._id)
                                                    }));
                                                    toast.success("Item removed from collection");
                                                } catch (err) {
                                                    toast.error("Removal failed");
                                                }
                                            }}
                                            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-lg text-red-500 opacity-0 group-hover/item:opacity-100 hover:bg-red-600 hover:text-white transition-all shadow-xl z-10"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-600 border border-white/5">
                                <ListMusic size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Your vault is empty</h3>
                            <p className="text-gray-500 mt-2 font-medium max-w-[300px]">Begin adding cinematic assets to build your curated experience.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlaylistDetails;
