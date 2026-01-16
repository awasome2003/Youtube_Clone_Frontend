
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { Bell, MoreVertical, Check, Trash2, Settings, ExternalLink } from "lucide-react";

const NotificationDropdown = ({ isOpen, onClose, token }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notification`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && token) {
            fetchNotifications();
        }
    }, [isOpen, token]);

    const markAllRead = async () => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/notification/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Failed to mark all read", err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/notification/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    };

    const getNotificationMessage = (n) => {
        const sender = n.sender?.username || "Someone";
        switch (n.type) {
            case "like": return <span><b>{sender}</b> liked your video</span>;
            case "comment": return <span><b>{sender}</b> commented on your video</span>;
            case "reply": return <span><b>{sender}</b> replied to your comment</span>;
            case "subscribe": return <span><b>{sender}</b> subscribed to your channel</span>;
            case "new-video": return <span><b>{sender}</b> uploaded a new broadcast</span>;
            default: return <span>Activity from <b>{sender}</b></span>;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-3 w-[360px] sm:w-[480px] bg-[#1a1a1a]/95 backdrop-blur-2xl rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2">
                    <Bell size={16} className="text-blue-500" /> Notifications
                </h3>
                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllRead}
                        className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
                    >
                        Mark all read
                    </button>
                    <Settings size={16} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
                </div>
            </div>

            {/* List */}
            <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                {loading ? (
                    <div className="p-10 flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Syncing Neural Index...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="flex flex-col">
                        {notifications.map((n) => (
                            <div
                                key={n._id}
                                className={`relative group px-6 py-4 flex gap-4 hover:bg-white/[0.03] transition-all border-b border-white/5 last:border-0 ${!n.read ? 'bg-blue-500/[0.02]' : ''}`}
                            >
                                {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}

                                <Link to={`/profile/${n.sender?._id}`} className="shrink-0">
                                    <img
                                        src={n.sender?.avatar ? `${import.meta.env.VITE_API_URL}${n.sender.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.sender?.username}`}
                                        className="w-12 h-12 rounded-full border border-white/10 object-cover"
                                        alt={n.sender?.username}
                                    />
                                </Link>

                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-gray-300 mb-1 leading-snug">
                                        {getNotificationMessage(n)}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                    </div>
                                </div>

                                {n.video?.thumbnailUrl && (
                                    <Link to={`/video/${n.video._id}`} className="shrink-0 w-20 aspect-video rounded-lg overflow-hidden border border-white/10 group-hover:border-white/20 transition-all">
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}${n.video.thumbnailUrl}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            alt="video"
                                        />
                                    </Link>
                                )}

                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                                    <button onClick={() => deleteNotification(n._id)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-500 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-700">
                            <Bell size={32} />
                        </div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-2">Zero Alerts Found</h4>
                        <p className="text-gray-500 text-[10px] font-bold tracking-wider leading-relaxed max-w-[200px]">Your neural feed is optimized and up to date.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
                <button className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-[0.3em] transition-colors">
                    Secure Encryption Active
                </button>
            </div>
        </div>
    );
};

export default NotificationDropdown;
