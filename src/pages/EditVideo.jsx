
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Trash2, X, ChevronLeft, Info, Eye, Lock, Globe, Save, ExternalLink, Video, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

const EditVideo = () => {
  const { id: videoId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: "", description: "", tags: "", visibility: "public" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadVideoData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos/${videoId}`);
        setVideo(res.data.data);
        setFormData({
          title: res.data.data.title || "",
          description: res.data.data.description || "",
          tags: res.data.data.tags ? res.data.data.tags.join(", ") : "",
          visibility: res.data.data.visibility || "public"
        });
      } catch (err) {
        toast.error("Failed to load video");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    loadVideoData();
  }, [videoId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Title is required");

    setIsSubmitting(true);
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/videos/${videoId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Changes deployed!");
      navigate(`/video/${videoId}`);
    } catch (err) {
      toast.error("Failed to synchronize changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Archive this video from the global database indefinitely?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/videos/${videoId}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Asset archived");
      navigate(`/profile/${user._id}`);
    } catch (err) {
      toast.error("Archive failed");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
        <Video size={40} className="text-gray-600" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-white uppercase tracking-widest">Querying Cloud Nodes</h2>
        <p className="text-gray-500 font-bold text-xs uppercase tracking-tighter">Locating video asset {videoId}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-white/5">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all shadow-xl group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Modify Creation</h1>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] font-mono">Asset ID: {videoId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-[0_10px_30px_rgba(239,68,68,0.1)] flex items-center gap-2"
            title="Purge Video"
          >
            <Trash2 size={18} /> Archive Asset
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-10">
          {/* Main Info */}
          <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none group-hover:text-blue-500/10 transition-colors">
              <Sparkles size={120} />
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400 shadow-inner">
                <Info size={20} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest leading-none">General Metadata</h3>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Creation Headline</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/50 outline-none text-white font-black text-xl transition-all placeholder:text-gray-700"
                  placeholder="The focus of your video"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Detailed Narrative</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-300 font-medium text-base resize-none leading-relaxed transition-all placeholder:text-gray-700"
                  placeholder="Deep dive into the context..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Index Keyphrases</label>
                <div className="relative">
                  <input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 py-4 focus:ring-2 focus:ring-blue-500/50 outline-none text-blue-400 font-black text-sm tracking-wide transition-all placeholder:text-gray-700 font-mono"
                    placeholder="cinema, tech, 2026, vision"
                  />
                  <Sparkles size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600" />
                </div>
              </div>
            </div>
          </section>

          {/* Visibility Section */}
          <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-purple-600/20 rounded-2xl text-purple-400">
                <Eye size={20} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest leading-none">Global Visibility</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'public', label: 'Public Access', icon: Globe, desc: 'Visible to the entire global network.', color: 'text-green-400', bg: 'bg-green-400/10' },
                { id: 'private', label: 'Restricted', icon: Lock, desc: 'Only accessible via your account.', color: 'text-amber-400', bg: 'bg-amber-400/10' }
              ].map(v => (
                <label
                  key={v.id}
                  className={`relative p-6 rounded-[24px] border-2 cursor-pointer transition-all flex flex-col gap-4 overflow-hidden group ${formData.visibility === v.id ? 'border-white/20 bg-white/10 shadow-2xl scale-[1.02]' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] grayscale opacity-60'}`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={v.id}
                    checked={formData.visibility === v.id}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${formData.visibility === v.id ? v.bg : 'bg-white/5'}`}>
                      <v.icon size={24} className={formData.visibility === v.id ? v.color : 'text-gray-500'} />
                    </div>
                    {formData.visibility === v.id && (
                      <CheckCircle2 size={24} className="text-white" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-black text-white uppercase tracking-tighter">{v.label}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">{v.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Action Sidebar */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="sticky top-28 space-y-8">
            {/* Asset Preview */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)] group">
              <div className="aspect-video relative overflow-hidden">
                <video
                  src={`${import.meta.env.VITE_API_URL}/api/videos/${videoId}/stream`}
                  className="w-full h-full object-contain"
                  controls
                  poster={`${import.meta.env.VITE_API_URL}${video.thumbnailUrl}`}
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <div className="p-8 space-y-6 bg-white/[0.02]">
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Asset Link</div>
                  <div className="text-blue-400 text-sm font-bold truncate flex items-center gap-2 hover:text-blue-300 transition-colors cursor-pointer">
                    /video/{videoId} <ExternalLink size={14} />
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        DEPLOYING CHANGES...
                      </>
                    ) : (
                      <>
                        <Save size={18} /> SYNC CHANGES
                      </>
                    )}
                  </button>

                  <Link
                    to={`/video/${videoId}`}
                    className="w-full py-4 text-center bg-white/5 border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3"
                  >
                    <Eye size={18} /> LIVE PREVIEW
                  </Link>
                </div>
              </div>
            </div>

            {/* Integrity Notice */}
            <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-[28px] flex gap-4">
              <AlertCircle size={24} className="text-indigo-400 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Sync Integrity</h4>
                <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
                  Deploying changes will refresh the metadata cache across all global edge nodes. Viewers may see updates immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditVideo;