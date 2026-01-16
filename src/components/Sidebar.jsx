import { useState, useEffect } from "react";
import axios from "axios";
import { ListMusic, Home, Compass, PlaySquare, Clock, ThumbsUp, ChevronRight, History, Library, User, Clapperboard, Flame, Music2, Gamepad2, Trophy, Settings, Flag, HelpCircle, MessageSquarePlus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen }) => {
    const location = useLocation();
    const { user, token } = useAuth();
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        if (token) {
            axios.get(`${import.meta.env.VITE_API_URL}/api/playlists`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => setPlaylists(res.data))
                .catch(err => console.error("Sidebar playlists error", err));
        }
    }, [token]);

    const mainLinks = [
        { icon: Home, label: "Home", path: "/" },
        { icon: Clapperboard, label: "Shorts", path: "/shorts" },
        { icon: Compass, label: "Subscriptions", path: "/subscriptions" },
    ];

    const libraryLinks = [
        { icon: Library, label: "Library", path: "/library" },
        { icon: History, label: "History", path: "/history" },
        { icon: PlaySquare, label: "Your videos", path: user ? `/profile/${user._id}` : "/login" },
        { icon: Clock, label: "Watch later", path: "/watch-later" },
        { icon: ThumbsUp, label: "Liked videos", path: "/liked-videos" },
    ];

    const exploreLinks = [
        { icon: Flame, label: "Trending", path: "/trending" },
        { icon: Music2, label: "Music", path: "/music" },
        { icon: Gamepad2, label: "Gaming", path: "/gaming" },
        { icon: Trophy, label: "Sports", path: "/sports" },
    ];

    const SidebarItem = ({ icon: Icon, label, path, active }) => (
        <Link
            to={path}
            className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${active
                ? "bg-white/10 font-semibold text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
        >
            <Icon
                size={22}
                className={`${active ? "text-red-500" : "text-gray-400 group-hover:scale-110 group-hover:text-white transition-all"} mr-5`}
            />
            <span className="text-[14px] leading-tight flex-1">{label}</span>
            {active && <div className="w-1 h-5 bg-red-500 rounded-full" />}
        </Link>
    );

    const SectionTitle = ({ children }) => (
        <div className="px-3 py-2 mt-2">
            <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                {children}
                <ChevronRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
        </div>
    );

    if (!isOpen) {
        return (
            <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-[#0f0f0f]/50 backdrop-blur-md z-40 border-r border-white/5 hidden lg:flex flex-col items-center py-2 w-[72px] transition-all duration-300">
                <div className="flex flex-col items-center w-full space-y-1">
                    {mainLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex flex-col items-center justify-center w-[64px] h-[74px] rounded-lg transition-colors group ${location.pathname === link.path ? "bg-white/10" : "hover:bg-white/5"
                                }`}
                        >
                            <link.icon
                                size={24}
                                className={`${location.pathname === link.path ? "text-red-500" : "text-gray-400 group-hover:text-white transition-colors"}`}
                            />
                            <span className={`text-[10px] mt-1.5 leading-none ${location.pathname === link.path ? "font-semibold text-white" : "text-gray-500 font-normal group-hover:text-white"}`}>
                                {link.label}
                            </span>
                        </Link>
                    ))}
                    <Link
                        to={user ? `/profile/${user._id}` : "/login"}
                        className="flex flex-col items-center justify-center w-[64px] h-[74px] rounded-lg hover:bg-white/5 transition-colors group"
                    >
                        <Library size={24} className="text-gray-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] mt-1.5 leading-none text-gray-500 font-normal group-hover:text-white">You</span>
                    </Link>
                </div>
            </aside>
        );
    }

    return (
        <aside
            className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-[#0f0f0f]/50 backdrop-blur-md transition-all duration-300 z-40 border-r border-white/5 overflow-y-auto custom-scrollbar w-60 px-3"
        >
            <div className="py-2 space-y-0.5">
                {mainLinks.map((link) => (
                    <SidebarItem
                        key={link.path}
                        {...link}
                        active={location.pathname === link.path}
                    />
                ))}
            </div>

            <div className="my-3 border-t border-white/5" />

            <SectionTitle>You</SectionTitle>
            <div className="space-y-0.5">
                {libraryLinks.map((link) => (
                    <SidebarItem
                        key={link.path}
                        {...link}
                        active={location.pathname === link.path}
                    />
                ))}
            </div>

            <div className="my-3 border-t border-white/5" />

            {playlists.length > 0 && (
                <>
                    <SectionTitle>Playlists</SectionTitle>
                    <div className="space-y-0.5">
                        {playlists.map((pl) => (
                            <SidebarItem
                                key={pl._id}
                                icon={ListMusic}
                                label={pl.name}
                                path={`/playlist/${pl._id}`}
                                active={location.pathname === `/playlist/${pl._id}`}
                            />
                        ))}
                    </div>
                    <div className="my-3 border-t border-white/5" />
                </>
            )}

            <SectionTitle>Explore</SectionTitle>
            <div className="space-y-0.5">
                {exploreLinks.map((link) => (
                    <SidebarItem
                        key={link.path}
                        {...link}
                        active={location.pathname === link.path}
                    />
                ))}
            </div>

            <div className="my-3 border-t border-white/5" />

            <div className="space-y-0.5">
                <SidebarItem icon={Settings} label="Settings" path="/settings" active={location.pathname === "/settings"} />
                <SidebarItem icon={Flag} label="Report history" path="/report" active={location.pathname === "/report"} />
                <SidebarItem icon={HelpCircle} label="Help" path="/help" active={location.pathname === "/help"} />
                <SidebarItem icon={MessageSquarePlus} label="Send feedback" path="/feedback" active={location.pathname === "/feedback"} />
            </div>

            <div className="px-5 py-6 text-[11px] text-gray-500 font-medium leading-relaxed">
                <div className="flex flex-wrap gap-x-2">
                    <a href="#" className="hover:text-white transition-colors">About</a>
                    <a href="#" className="hover:text-white transition-colors">Press</a>
                    <a href="#" className="hover:text-white transition-colors">Copyright</a>
                </div>
                <div className="flex flex-wrap gap-x-2">
                    <a href="#" className="hover:text-white transition-colors">Contact us</a>
                    <a href="#" className="hover:text-white transition-colors">Creators</a>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-2 uppercase tracking-tighter">
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                </div>
                <p className="mt-4 text-gray-600 font-normal">© 2026 MyTube Premium</p>
            </div>
        </aside>
    );
};

export default Sidebar;
