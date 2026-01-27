import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ShortCard from "../components/ShortCard";
import { Clapperboard } from "lucide-react";

const Shorts = () => {
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    const fetchShorts = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos/shorts/random`);
            setShorts(prev => [...prev, ...res.data.data]);
        } catch (err) {
            console.error("Failed to fetch shorts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShorts();
    }, []);

    // Infinite scroll logic for shorts
    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            fetchShorts();
        }
    };

    if (loading && shorts.length === 0) {
        return (
            <div className="h-[calc(100vh-3.5rem)] w-full flex flex-col items-center justify-center bg-[#0f0f0f] text-white">
                <Clapperboard size={60} className="text-gray-600 animate-pulse mb-4" />
                <p className="text-xl font-black italic tracking-tighter uppercase opacity-50">Syncing Streamly Shorts...</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="h-[calc(100vh-3.5rem)] w-full overflow-y-scroll snap-y snap-mandatory bg-[#0f0f0f] no-scrollbar"
        >
            <div className="max-w-md mx-auto h-full">
                {shorts.map((short, index) => (
                    <div key={`${short._id}-${index}`} className="h-full w-full snap-start snap-always">
                        <ShortCard video={short} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shorts;
