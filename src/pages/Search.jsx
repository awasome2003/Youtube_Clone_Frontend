
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { SlidersHorizontal, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q");
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos?search=${query}`);
                setVideos(res.data.data || []);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setLoading(false);
            }
        };
        if (query) fetchSearchResults();
    }, [query]);

    if (loading) {
        return (
            <div className="flex flex-col gap-6 max-w-[1100px] mx-auto py-4">
                {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-4 animate-pulse">
                        <div className="w-full sm:w-[360px] aspect-video bg-gray-100 rounded-xl" />
                        <div className="flex-1 flex flex-col gap-3">
                            <div className="h-6 w-3/4 bg-gray-100 rounded" />
                            <div className="h-4 w-1/4 bg-gray-100 rounded" />
                            <div className="h-4 w-1/2 bg-gray-100 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-[1100px] mx-auto py-4">
            <div className="flex items-center justify-between mb-6">
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full font-bold text-sm transition-colors">
                    <SlidersHorizontal size={18} />
                    Filters
                </button>
            </div>

            <div className="flex flex-col gap-6">
                {videos.length > 0 ? (
                    videos.map((v) => (
                        <div key={v._id} className="flex flex-col sm:flex-row gap-4 group cursor-pointer">
                            <Link to={`/video/${v._id}`} className="relative w-full sm:w-[360px] aspect-video shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                <img
                                    src={v.thumbnailUrl ? `${import.meta.env.VITE_API_URL}${v.thumbnailUrl}` : `https://picsum.photos/seed/${v._id}/640/360`}
                                    alt={v.title}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                />
                                {v.duration && (
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-[12px] text-white px-1.5 py-0.5 rounded font-medium">
                                        {v.duration}
                                    </div>
                                )}
                            </Link>

                            <div className="flex flex-col min-w-0 flex-1">
                                <Link to={`/video/${v._id}`}>
                                    <h3 className="text-[18px] font-bold line-clamp-2 leading-tight group-hover:text-gray-700">
                                        {v.title}
                                    </h3>
                                </Link>
                                <div className="text-[12px] text-gray-500 mt-1 flex items-center gap-1">
                                    <span>{v.views?.toLocaleString()} views</span>
                                    <span>•</span>
                                    <span>{v.createdAt ? formatDistanceToNow(new Date(v.createdAt), { addSuffix: true }) : 'recently'}</span>
                                </div>

                                <div className="flex items-center gap-2 my-3">
                                    <Link to={`/profile/${v.userId?._id}`}>
                                        <img
                                            src={v.userId?.avatar ? `${import.meta.env.VITE_API_URL}${v.userId.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.userId?.username}`}
                                            alt={v.userId?.username}
                                            className="h-6 w-6 rounded-full"
                                        />
                                    </Link>
                                    <Link to={`/profile/${v.userId?._id}`} className="text-[13px] text-gray-600 hover:text-black">
                                        {v.userId?.username}
                                    </Link>
                                </div>

                                <p className="text-[13px] text-gray-500 line-clamp-1">
                                    {v.description}
                                </p>

                                <div className="mt-2 flex gap-2">
                                    {v.isNew && <span className="px-2 py-0.5 bg-gray-100 text-[11px] font-bold rounded uppercase">New</span>}
                                    {v.duration > 600 && <span className="px-2 py-0.5 bg-gray-100 text-[11px] font-bold rounded uppercase">4K</span>}
                                </div>
                            </div>

                            <button className="opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 shrink-0">
                                <MoreVertical size={18} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <h3 className="text-xl font-bold">No results found</h3>
                        <p className="text-gray-500 mt-2">Try different keywords or check your spelling</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
