import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Users, Video, Eye, TrendingUp, ShieldAlert, Trash2, UserX, Youtube, Download } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVideos: 0,
        totalViews: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data.data);
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    const statCards = [
        { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Total Videos", value: stats.totalVideos, icon: Video, color: "text-red-500", bg: "bg-red-500/10" },
        { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    if (loading) return <div className="flex items-center justify-center h-[80vh] text-white">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${stat.bg}`}>
                            <stat.icon size={28} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Enhanced Management Console */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700" />

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Management Hub</h2>
                            <p className="text-gray-400 text-sm">Direct access to core platform entities</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                            <ShieldAlert className="text-blue-400" size={24} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/admin/users" className="flex flex-col gap-4 p-5 bg-gradient-to-br from-white/5 to-transparent hover:from-blue-500/10 border border-white/5 hover:border-blue-500/30 rounded-2xl transition-all duration-300 group/item">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                <Users className="text-blue-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-1">User Base</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">Manage accounts and permissions.</p>
                            </div>
                            <div className="mt-2 flex items-center text-blue-400 text-xs font-bold group-hover/item:translate-x-1 transition-transform uppercase tracking-wider">
                                View Users <TrendingUp size={14} className="ml-1" />
                            </div>
                        </Link>

                        <Link to="/admin/videos" className="flex flex-col gap-4 p-5 bg-gradient-to-br from-white/5 to-transparent hover:from-red-500/10 border border-white/5 hover:border-red-500/30 rounded-2xl transition-all duration-300 group/item">
                            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                <Video className="text-red-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-1">Content Library</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">Review and moderate uploads.</p>
                            </div>
                            <div className="mt-2 flex items-center text-red-400 text-xs font-bold group-hover/item:translate-x-1 transition-transform uppercase tracking-wider">
                                View Videos <TrendingUp size={14} className="ml-1" />
                            </div>
                        </Link>

                        <Link to="/admin/import" className="sm:col-span-2 flex items-center justify-between p-6 bg-gradient-to-r from-red-600/10 to-transparent hover:from-red-600/20 border border-white/5 hover:border-red-600/30 rounded-2xl transition-all duration-300 group/sync">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-red-600/20 flex items-center justify-center group-hover/sync:scale-110 transition-transform shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                                    <Youtube className="text-red-500" size={28} />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-lg uppercase tracking-tighter italic">Supadata Sync Engine</h3>
                                    <p className="text-gray-400 text-xs font-medium">Synchronize high-fidelity dummy assets from YouTube</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest group-hover/sync:gap-3 transition-all shrink-0">
                                Open Engine <Download size={14} />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-center gap-3">
                        <ShieldAlert className="text-yellow-500 flex-shrink-0" size={20} />
                        <p className="text-yellow-500/80 text-[10px] font-medium leading-tight">Standard security protocols active. Dummy videos use external hosting logic.</p>
                    </div>
                </div>

                {/* Enhanced System Health */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full group-hover:bg-purple-500/20 transition-all duration-700" />

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">System Health</h2>
                            <p className="text-gray-400 text-sm">Real-time performance metrics</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-green-500 text-[10px] font-bold uppercase tracking-wider">Operational</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Database */}
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-green-500 rounded-full" />
                                    <span className="text-gray-300 font-semibold text-sm">Database Sync</span>
                                </div>
                                <span className="text-green-500 text-sm font-bold">95%</span>
                            </div>
                            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full" style={{ width: '95%' }} />
                            </div>
                        </div>

                        {/* Server */}
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                                    <span className="text-gray-300 font-semibold text-sm">Compute Load</span>
                                </div>
                                <span className="text-blue-500 text-sm font-bold">12%</span>
                            </div>
                            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" style={{ width: '12%' }} />
                            </div>
                        </div>

                        {/* Storage */}
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-purple-500 rounded-full" />
                                    <span className="text-gray-300 font-semibold text-sm">Media Storage</span>
                                </div>
                                <span className="text-purple-500 text-sm font-bold">64%</span>
                            </div>
                            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" style={{ width: '64%' }} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <p className="text-gray-500 text-xs mb-1">API Latency</p>
                            <p className="text-white font-bold">24ms</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <p className="text-gray-300 text-xs mb-1">Uptime</p>
                            <p className="text-white font-bold text-sm">99.98%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
