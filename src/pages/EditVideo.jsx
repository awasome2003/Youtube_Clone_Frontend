
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Trash2, X, ChevronLeft, Info, Eye, Lock, Globe } from "lucide-react";

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
  }, [videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Title is required");

    setIsSubmitting(true);
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/videos/${videoId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Updated!");
      navigate(`/video/${videoId}`);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this video permanently?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/videos/${videoId}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Deleted");
      navigate(`/profile/${user._id}`);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse">Loading project details...</div>;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Video details</h1>
        <div className="flex-1" />
        <button onClick={handleDelete} className="p-2.5 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete Video">
          <Trash2 size={22} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="relative group">
            <label className="text-xs font-bold text-gray-500 absolute top-2 left-3">Title (required)</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full pt-7 pb-2 px-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-[15px]"
            />
          </div>

          <div className="relative group">
            <label className="text-xs font-bold text-gray-500 absolute top-2 left-3">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={10}
              className="w-full pt-7 pb-2 px-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-[15px] resize-none"
            />
          </div>

          <div className="relative group">
            <label className="text-xs font-bold text-gray-500 absolute top-2 left-3">Tags</label>
            <input
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full pt-7 pb-2 px-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-[15px]"
              placeholder="Separate with commas"
            />
          </div>
        </div>

        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden sticky top-24">
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={`${import.meta.env.VITE_API_URL}/api/videos/${videoId}/stream`}
                className="w-full h-full"
                controls
                poster={`${import.meta.env.VITE_API_URL}${video.thumbnailUrl}`}
              />
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Visibility</label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'public', label: 'Public', icon: Globe, desc: 'Anyone can see your video' },
                    { id: 'private', label: 'Private', icon: Lock, desc: 'Only you can see your video' }
                  ].map(v => (
                    <label key={v.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.visibility === v.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="visibility"
                        value={v.id}
                        checked={formData.visibility === v.id}
                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                        className="hidden"
                      />
                      <v.icon size={20} className={formData.visibility === v.id ? 'text-blue-600' : 'text-gray-500'} />
                      <div className="flex-1">
                        <div className="text-sm font-bold">{v.label}</div>
                        <div className="text-xs text-gray-500">{v.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-blue-600 text-white rounded font-bold text-sm tracking-wide hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                >
                  {isSubmitting ? 'SAVING...' : 'SAVE'}
                </button>
                <Link
                  to={`/video/${videoId}`}
                  className="w-full py-2.5 text-center bg-gray-100 text-gray-700 rounded font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  VIEW VIDEO
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditVideo;