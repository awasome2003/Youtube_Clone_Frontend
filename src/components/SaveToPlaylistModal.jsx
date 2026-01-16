
import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Plus, Check, Lock, Globe, ListMusic } from "lucide-react";
import { toast } from "react-toastify";

const SaveToPlaylistModal = ({ isOpen, onClose, videoId, token }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (isOpen && token) {
            fetchPlaylists();
        }
    }, [isOpen, token]);

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/playlists`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlaylists(res.data);
        } catch (err) {
            console.error("Failed to fetch playlists", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) return;

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/playlists`,
                { name: newPlaylistName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // New playlist is empty, so videoIds is []
            setPlaylists([{ ...res.data, videoIds: [] }, ...playlists]);
            setNewPlaylistName("");
            setIsCreating(false);
            toast.success("Playlist created");
        } catch (err) {
            toast.error("Failed to create playlist");
        }
    };

    const togglePlaylist = async (playlist) => {
        const isIncluded = playlist.videoIds.includes(videoId);
        const endpoint = isIncluded ? "remove" : "add";

        // Optimistic update
        setPlaylists(prev => prev.map(p => {
            if (p._id === playlist._id) {
                const newIds = isIncluded
                    ? p.videoIds.filter(id => id !== videoId)
                    : [...p.videoIds, videoId];
                return { ...p, videoIds: newIds };
            }
            return p;
        }));

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/playlists/${playlist._id}/${endpoint}`,
                { videoId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const msg = isIncluded ? "Removed from playlist" : "Added to playlist";
            toast.success(msg);
        } catch (err) {
            // Revert
            toast.error("Failed to update playlist");
            fetchPlaylists();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="w-full max-w-sm bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="font-black text-white uppercase tracking-wider text-sm">Save to...</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="max-h-[300px] overflow-y-auto p-2 no-scrollbar">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {playlists.map(playlist => {
                                const isIncluded = playlist.videoIds?.includes(videoId);
                                return (
                                    <label key={playlist._id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isIncluded ? 'bg-blue-600 border-blue-600' : 'border-gray-500 group-hover:border-white'}`}>
                                            {isIncluded && <Check size={14} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={!!isIncluded}
                                            onChange={() => togglePlaylist(playlist)}
                                        />
                                        <span className="flex-1 text-sm font-bold text-gray-200 group-hover:text-white truncate">{playlist.name}</span>
                                        {playlist.videoIds?.length > 0 ? (
                                            <Lock size={14} className="text-gray-600" />
                                        ) : (
                                            <Globe size={14} className="text-gray-600" />
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                    {!isCreating ? (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-gray-300 hover:text-white"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <Plus size={18} />
                            </div>
                            <span className="font-bold text-sm">Create new playlist</span>
                        </button>
                    ) : (
                        <form onSubmit={handleCreate} className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Enter playlist title..."
                                    value={newPlaylistName}
                                    onChange={e => setNewPlaylistName(e.target.value)}
                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-600"
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newPlaylistName.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white text-xs font-black rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SaveToPlaylistModal;
