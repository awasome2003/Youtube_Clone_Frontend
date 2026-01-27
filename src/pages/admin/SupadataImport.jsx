import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Youtube, Download, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

const SupadataImport = () => {
    const { token } = useAuth();
    const [id, setId] = useState("");
    const [importType, setImportType] = useState("channel"); // 'channel' or 'playlist'
    const [limit, setLimit] = useState(10);
    const [isShort, setIsShort] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleImport = async (e) => {
        e.preventDefault();
        if (!id.trim()) return toast.error("Please enter a YouTube ID or URL");

        setLoading(true);
        setResult(null);

        try {
            const payload = {
                limit: parseInt(limit),
                isShort
            };

            if (importType === "channel") {
                payload.channelId = id;
            } else {
                payload.playlistId = id;
            }

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/import-youtube`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setResult(res.data);
            toast.success(res.data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || "Import failed. Check your API key.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-600/20 rounded-2xl text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                    <Youtube size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Supadata Engine</h1>
                    <p className="text-gray-400 font-medium">Sync high-fidelity YouTube assets into Streamly</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-red-600/10 transition-all duration-700" />

                <form onSubmit={handleImport} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Type Selection */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Source Protocol</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setImportType("channel")}
                                    className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all border ${importType === 'channel' ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                                >
                                    Channel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImportType("playlist")}
                                    className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all border ${importType === 'playlist' ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                                >
                                    Playlist
                                </button>
                            </div>
                        </div>

                        {/* Limit Setting */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Asset Limit</label>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white font-bold outline-none focus:border-red-500/50 appearance-none cursor-pointer transition-all"
                            >
                                <option value="5" className="bg-[#1a1a1a]">Top 5 Videos</option>
                                <option value="10" className="bg-[#1a1a1a]">Top 10 Videos</option>
                                <option value="20" className="bg-[#1a1a1a]">Top 20 Videos</option>
                                <option value="50" className="bg-[#1a1a1a]">Top 50 Videos</option>
                            </select>
                        </div>
                    </div>

                    {/* ID Input */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">
                            {importType === 'channel' ? 'YouTube Handle or Channel ID' : 'YouTube Playlist URL or ID'}
                        </label>
                        <div className="relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500">
                                <Search size={20} />
                            </div>
                            <input
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-14 py-4 text-white font-bold outline-none focus:border-red-500/50 transition-all placeholder:text-gray-600"
                                placeholder={importType === 'channel' ? "@RickAstleyVEVO" : "https://www.youtube.com/playlist?list=..."}
                            />
                        </div>
                    </div>

                    {/* Feature Toggles */}
                    <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl group/short cursor-pointer hover:bg-white/10 transition-all" onClick={() => setIsShort(!isShort)}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl transition-all duration-300 ${isShort ? 'bg-red-600/20 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-white/10 text-gray-400'}`}>
                                <Sparkles size={24} className={isShort ? "animate-pulse" : ""} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg leading-tight uppercase tracking-tighter">Enable Shorts Mode</h4>
                                <p className="text-gray-500 text-xs font-medium">Synchronize 9:16 vertical content optimized for feeds</p>
                            </div>
                        </div>
                        <div className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${isShort ? 'bg-red-600' : 'bg-white/10'}`}>
                            <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${isShort ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-white text-black rounded-3xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Synthesizing Assets...
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                Initiate Synchronization
                            </>
                        )}
                    </button>
                </form>

                {/* Result Message */}
                {result && (
                    <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                        <CheckCircle2 className="text-green-500 shrink-0" size={32} />
                        <div>
                            <h4 className="text-white font-bold uppercase tracking-tighter italic">Sync Successful</h4>
                            <p className="text-green-500/80 text-sm font-medium leading-relaxed">{result.message}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-10 p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-3xl flex items-start gap-4">
                <AlertCircle className="text-yellow-500 shrink-0 mt-1" size={20} />
                <p className="text-yellow-500/80 text-xs font-medium leading-relaxed uppercase tracking-widest">
                    Note: Dummy videos use YouTube's external hosting platform. Syncing large playlists may consume significant API quota on your Supadata key.
                </p>
            </div>
        </div>
    );
};

// Internal search icon for the input
const Search = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

export default SupadataImport;
