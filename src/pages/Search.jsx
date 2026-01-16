
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { SlidersHorizontal, MoreVertical, Play, Clock, Video, CheckCircle, Flame, Users, Calendar, ArrowUpDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q");
    const sortParam = searchParams.get("sort") || "-views";
    const categoryParam = searchParams.get("category") || "";

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const sortOptions = [
        { label: "High Relevance", value: "relevance", icon: Play },
        { label: "Engagement (Views)", value: "-views", icon: Flame },
        { label: "Latest Broadcasts", value: "-createdAt", icon: Calendar },
        { label: "Channel Authority", value: "userId", icon: Users },
    ];

    const categoryOptions = [
        "All", "Music", "Gaming", "Javascript", "React Router", "Programming",
        "Movies", "Live", "Cricket", "News", "Gadgets", "Trailers", "Lo-fi"
    ];

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                setLoading(true);
                const params = {
                    search: query,
                    sort: sortParam !== 'relevance' ? sortParam : undefined,
                    category: categoryParam !== 'All' ? categoryParam : undefined
                };
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos`, { params });
                setVideos(res.data.data || []);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setLoading(false);
            }
        };
        if (query) fetchSearchResults();
    }, [query, sortParam, categoryParam]);

    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value && value !== 'All' && value !== 'relevance') {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-8 max-w-[1200px] mx-auto py-8 px-4">
                {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-6 animate-pulse">
                        <div className="w-full sm:w-[420px] aspect-video bg-white/5 rounded-3xl shrink-0" />
                        <div className="flex-1 flex flex-col gap-4 py-2">
                            <div className="h-8 w-3/4 bg-white/5 rounded-2xl" />
                            <div className="h-4 w-1/4 bg-white/10 rounded-xl" />
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-white/5" />
                                <div className="h-4 w-32 bg-white/5 rounded-lg" />
                            </div>
                            <div className="h-12 w-full bg-white/5 rounded-2xl mt-2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto py-8 px-4">
            {/* Search Meta & Filter Toggle */}
            <div className="flex flex-col gap-6 mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Found {videos.length} Results
                        </h1>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] font-mono">
                            Query: "{query}" • High-Fidelity Indexing
                        </p>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl border ${showFilters ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                    >
                        <SlidersHorizontal size={18} className={showFilters ? 'text-black' : 'text-blue-400'} />
                        {showFilters ? 'Hide Logic Filters' : 'Advanced Logic Filters'}
                    </button>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-white/[0.03] border border-white/10 rounded-[32px] animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <ArrowUpDown size={12} /> Sorting Protocol
                            </h3>
                            <div className="flex flex-col gap-2">
                                {sortOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => updateFilter('sort', opt.value)}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${sortParam === opt.value ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                                    >
                                        <opt.icon size={14} />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Video size={12} /> Domain Category
                            </h3>
                            <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto no-scrollbar pr-2">
                                {categoryOptions.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => updateFilter('category', cat)}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tighter transition-all border ${categoryParam === cat || (cat === 'All' && !categoryParam) ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-gray-500 border-transparent hover:border-white/10 hover:text-white'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <CheckCircle size={12} /> Transmission Quality
                            </h3>
                            <div className="flex flex-col gap-2">
                                {['4K Ultra HD', 'HDR Synthesis', 'Spatial Audio'].map(f => (
                                    <label key={f} className="flex items-center gap-3 px-4 py-1.5 cursor-not-allowed opacity-40">
                                        <div className="w-4 h-4 rounded border border-gray-600" />
                                        <span className="text-xs font-medium text-gray-500">{f}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Clock size={12} /> Temporal Constraints
                            </h3>
                            <div className="flex flex-col gap-2">
                                {['< 4 Minutes', '4 - 20 Minutes', '> 20 Minutes'].map(f => (
                                    <label key={f} className="flex items-center gap-3 px-4 py-1.5 cursor-not-allowed opacity-40">
                                        <div className="w-4 h-4 rounded border border-gray-600" />
                                        <span className="text-xs font-medium text-gray-500">{f}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-10">
                {videos.length > 0 ? (
                    videos.map((v) => (
                        <div key={v._id} className="group relative flex flex-col sm:flex-row gap-8 cursor-pointer animate-in fade-in slide-in-from-bottom-6 duration-500">
                            {/* Thumbnail Container */}
                            <Link to={`/video/${v._id}`} className="relative w-full sm:w-[420px] aspect-video shrink-0 rounded-[32px] overflow-hidden bg-[#0f0f0f] border border-white/5 group-hover:border-white/20 shadow-2xl transition-all duration-500">
                                <img
                                    src={v.thumbnailUrl ? `${import.meta.env.VITE_API_URL}${v.thumbnailUrl}` : `https://picsum.photos/seed/${v._id}/640/360`}
                                    alt={v.title}
                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-500" />

                                {v.duration && (
                                    <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded-lg font-black uppercase tracking-widest border border-white/10">
                                        {v.duration}
                                    </div>
                                )}

                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100 border border-white/20 text-white">
                                    <Play size={24} fill="white" />
                                </div>
                            </Link>

                            {/* Info Container */}
                            <div className="flex-1 flex flex-col py-2 min-w-0">
                                <div className="flex justify-between items-start gap-4">
                                    <Link to={`/video/${v._id}`} className="flex-1 min-w-0">
                                        <h3 className="text-2xl font-black text-white italic tracking-tight line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                                            {v.title}
                                        </h3>
                                    </Link>
                                    <button className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all border border-transparent hover:border-white/10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 text-[11px] font-black text-gray-500 uppercase tracking-widest mt-2 mb-6">
                                    <span className="flex items-center gap-1.5"><Clock size={12} /> {v.createdAt ? formatDistanceToNow(new Date(v.createdAt), { addSuffix: true }) : 'recently'}</span>
                                    <span className="opacity-20">•</span>
                                    <span>{v.views?.toLocaleString()} Interactions</span>
                                </div>

                                <div className="flex items-center gap-3 mb-6 bg-white/[0.03] p-3 rounded-2xl border border-white/5 w-fit hover:bg-white/[0.08] transition-all group/author">
                                    <Link to={`/profile/${v.userId?._id}`} className="shrink-0 relative">
                                        <img
                                            src={v.userId?.avatar ? `${import.meta.env.VITE_API_URL}${v.userId.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.userId?.username}`}
                                            alt={v.userId?.username}
                                            className="h-8 w-8 rounded-full border border-white/10 shadow-lg object-cover"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center text-[6px] text-white">✓</div>
                                    </Link>
                                    <Link to={`/profile/${v.userId?._id}`} className="text-sm font-black text-gray-300 hover:text-white transition-colors uppercase tracking-tight">
                                        {v.userId?.username}
                                    </Link>
                                </div>

                                <p className="text-[14px] text-gray-400 font-medium line-clamp-2 leading-loose mb-6">
                                    {v.description || "The creator hasn't categorized this cinematic asset with a narrative yet."}
                                </p>

                                <div className="flex gap-3">
                                    {v.isNew && (
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black rounded-lg uppercase tracking-widest animate-pulse">
                                            Recent Broadcast
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-white/5 text-gray-400 border border-white/10 text-[9px] font-black rounded-lg uppercase tracking-widest">
                                        UHD 4K
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.02] border border-white/5 rounded-[40px]">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 text-gray-700 shadow-inner">
                            <Video size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">Null Index Exception</h3>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                            No cinematic records matching <span className="text-blue-400 font-black">"{query}"</span> were located in the global vault.
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="mt-10 px-8 py-3 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            Return to Matrix
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
