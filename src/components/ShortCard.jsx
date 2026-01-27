import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Music2, UserPlus, Play, Pause } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const ShortCard = ({ video }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const { token, user } = useAuth();
    const [stats, setStats] = useState({
        likes: video.likes?.length || 0,
        dislikes: video.dislikes?.length || 0
    });

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play().catch(e => console.log("Autoplay blocked"));
                        setIsPlaying(true);
                    } else {
                        videoRef.current?.pause();
                        setIsPlaying(false);
                    }
                });
            },
            { threshold: 0.8 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleLike = async (e) => {
        e.preventDefault();
        if (!token) return toast.error("Please login to like");
        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/videos/${video._id}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data.data);
            setIsLiked(true);
        } catch (err) {
            toast.error("Failed to like");
        }
    };

    return (
        <div className="relative h-full w-full bg-black group flex items-center justify-center overflow-hidden">
            {/* Video Element */}
            {video.videoUrl?.includes("youtube.com") || video.videoUrl?.includes("youtu.be") ? (
                <iframe
                    className="h-full w-full aspect-[9/16]"
                    src={`https://www.youtube.com/embed/${video.videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1]}?autoplay=1&loop=1&playlist=${video.videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1]}&controls=0&modestbranding=1`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            ) : (
                <video
                    ref={videoRef}
                    src={video.videoUrl?.startsWith('http') ? video.videoUrl : `${import.meta.env.VITE_API_URL}${video.videoUrl}`}
                    className="h-full w-full object-cover cursor-pointer"
                    loop
                    muted={false}
                    onClick={togglePlay}
                />
            )}

            {/* Play/Pause Icon Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="p-5 bg-black/40 rounded-full backdrop-blur-md animate-in zoom-in duration-200">
                        <Play size={40} className="text-white fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                <div className="flex flex-col gap-3 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <Link to={`/profile/${video.userId?._id}`} className="flex-shrink-0">
                            <img
                                src={video.userId?.avatar?.startsWith('http') ? video.userId.avatar : `${import.meta.env.VITE_API_URL}${video.userId?.avatar}`}
                                alt={video.userId?.username}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-xl"
                            />
                        </Link>
                        <Link to={`/profile/${video.userId?._id}`} className="text-white font-black tracking-tight text-sm drop-shadow-lg">
                            @{video.userId?.username}
                        </Link>
                        <button className="bg-white text-black text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                            Subscribe
                        </button>
                    </div>

                    <h3 className="text-white text-sm font-bold line-clamp-2 drop-shadow-lg max-w-[85%]">
                        {video.title}
                    </h3>

                    <div className="flex items-center gap-2 text-white/80 text-xs">
                        <Music2 size={14} className="animate-spin-slow" />
                        <span className="font-medium truncate max-w-[200px]">Original Audio - {video.userId?.username}</span>
                    </div>
                </div>
            </div>

            {/* Side Actions Overlay */}
            <div className="absolute right-3 bottom-20 flex flex-col gap-6 items-center pointer-events-auto">
                <div className="flex flex-col items-center group/btn cursor-pointer" onClick={handleLike}>
                    <div className={`p-3 rounded-full backdrop-blur-md transition-all ${isLiked ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                        <ThumbsUp size={24} className={isLiked ? "fill-white" : ""} />
                    </div>
                    <span className="text-white text-[11px] font-black mt-1 drop-shadow-md">{stats.likes}</span>
                </div>

                <div className="flex flex-col items-center group/btn cursor-pointer">
                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-md text-white hover:bg-white/20 transition-all">
                        <MessageSquare size={24} />
                    </div>
                    <span className="text-white text-[11px] font-black mt-1 drop-shadow-md">7.2K</span>
                </div>

                <div className="flex flex-col items-center group/btn cursor-pointer">
                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-md text-white hover:bg-white/20 transition-all">
                        <Share2 size={24} />
                    </div>
                    <span className="text-white text-[11px] font-black mt-1 drop-shadow-md">Share</span>
                </div>

                <div className="flex flex-col items-center group/btn cursor-pointer">
                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-md text-white hover:bg-white/20 transition-all">
                        <MoreVertical size={24} />
                    </div>
                </div>

                {/* Vinyl Record Animation */}
                <div className="mt-4 relative animate-spin-slow">
                    <div className="w-10 h-10 rounded-full border-4 border-white/20 bg-gradient-to-tr from-[#333] to-[#111] p-1 shadow-2xl">
                        <img
                            src={video.userId?.avatar?.startsWith('http') ? video.userId.avatar : `${import.meta.env.VITE_API_URL}${video.userId?.avatar}`}
                            className="w-full h-full rounded-full object-cover"
                            alt="avatar"
                        />
                    </div>
                    <div className="absolute inset-0 border-2 border-white/10 rounded-full rotate-45" />
                </div>
            </div>
        </div>
    );
};

export default ShortCard;
