
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Upload, X, FileVideo, Info, ChevronRight, CheckCircle2, Sparkles, Clapperboard } from "lucide-react";

const UploadVideo = () => {
  const [formData, setFormData] = useState({ title: "", description: "", tags: "", isShort: false });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1); // 1: Select, 2: Details, 3: Processing

  const { token, user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) return toast.error("Max 100MB allowed");
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setFormData(prev => ({ ...prev, title: selectedFile.name.split('.').slice(0, -1).join('.') }));
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Title is required");

    const data = new FormData();
    data.append("video", file);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("userId", user._id);
    data.append("tags", formData.tags);
    data.append("isShort", formData.isShort);

    setIsSubmitting(true);
    setStep(3);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/videos/upload`, data, {
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (p) => setProgress(Math.round((p.loaded * 100) / p.total))
      });

      if (res.data.success) {
        toast.success("Uploaded!");
        setTimeout(() => navigate(`/video/${res.data.data.id}`), 1000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden min-h-[650px] flex flex-col animate-in fade-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter uppercase">
            {step === 1 && (
              <>
                <div className="p-2 bg-blue-600/20 rounded-xl text-blue-400">
                  <Upload size={20} />
                </div>
                Broadcast your creation
              </>
            )}
            {step === 2 && (
              <>
                <div className="p-2 bg-indigo-600/20 rounded-xl text-indigo-400">
                  <Sparkles size={20} />
                </div>
                Perfecting details
              </>
            )}
            {step === 3 && (
              <>
                <div className="p-2 bg-purple-600/20 rounded-xl text-purple-400">
                  <FileVideo size={20} />
                </div>
                Processing master record
              </>
            )}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all border border-transparent hover:border-white/10"
          >
            <X size={24} />
          </button>
        </div>

        {/* content */}
        <div className="flex-1 flex flex-col">
          {step === 1 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-fade-in py-20">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-blue-600 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-40 h-40 bg-white/5 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mb-10 group-hover:border-blue-500 group-hover:bg-white/10 transition-all duration-500">
                  <Upload size={64} className="text-gray-400 group-hover:text-blue-400 transition-colors group-hover:scale-110 duration-500" />
                </div>
              </div>

              <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Select High Fidelity Assets</h3>
              <p className="text-gray-400 mb-10 max-w-sm font-medium leading-relaxed">
                Drag and drop your video files here. Your creation will be kept private until you're ready to go live.
              </p>

              <input type="file" id="video-input" hidden accept="video/*" onChange={handleFileChange} />
              <label
                htmlFor="video-input"
                className="px-10 py-4 bg-white text-black rounded-2xl font-black text-sm cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 uppercase tracking-widest"
              >
                Choose Video
              </label>

              <div className="mt-12 flex items-center gap-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> 4K HDR Ready</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Multi-Channel Audio</span>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="flex-1 flex flex-col lg:flex-row p-8 gap-10 animate-fade-in shadow-inner">
              <div className="flex-1 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Video Headline</label>
                    <input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500/50 outline-none text-white font-bold text-lg transition-all"
                      placeholder="Give your video a compelling title"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">The Narrative</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={8}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500/50 outline-none text-gray-300 font-medium text-15px resize-none leading-relaxed transition-all"
                      placeholder="Tell your viewers what this video is about..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Index Tags</label>
                    <input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500/50 outline-none text-gray-300 font-bold text-sm transition-all"
                      placeholder="Separated by commas (e.g. cinema, tech, 2026)"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl group/short cursor-pointer hover:bg-white/10 transition-all" onClick={() => setFormData({ ...formData, isShort: !formData.isShort })}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-all duration-300 ${formData.isShort ? 'bg-red-600/20 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-white/10 text-gray-400'}`}>
                        <Clapperboard size={24} className={formData.isShort ? "animate-pulse" : ""} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg leading-tight uppercase tracking-tighter">Mark as Short</h4>
                        <p className="text-gray-500 text-xs font-medium">Vertical format optimized for swipe feeds</p>
                      </div>
                    </div>
                    <div className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${formData.isShort ? 'bg-red-600' : 'bg-white/10'}`}>
                      <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${formData.isShort ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[350px] flex flex-col gap-6">
                <div className="bg-[#0f0f0f] rounded-[24px] overflow-hidden border border-white/10 shadow-2xl relative group">
                  <video src={previewUrl} className="w-full aspect-video object-contain" controls />
                  <div className="p-4 bg-white/[0.03] border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Preview Sync</div>
                      <div className="text-white text-xs font-bold truncate flex items-center gap-1">
                        <Clapperboard size={12} className="text-blue-400" /> {formData.title || "Untitled Creation"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 flex items-start gap-4">
                  <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-gray-400 font-medium leading-relaxed">
                    While the cinematic engine processes your video, you can finalize the metadata. We'll optimize the delivery for all platforms.
                  </p>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5">
                  <button
                    onClick={handleSubmit}
                    className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 uppercase tracking-widest"
                  >
                    Initiate Upload
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 animate-fade-in min-h-[500px]">
              <div className="relative w-full max-w-md mb-12">
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="absolute top-6 left-1/2 -translate-x-1/2 text-5xl font-black text-white italic tracking-tighter opacity-10 select-none">
                  TRANSMITTING
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <h3 className="text-4xl font-black text-white italic tracking-tighter shadow-glow">{progress}%</h3>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Data Stream Integrity Verified</p>
              </div>

              {progress === 100 && (
                <div className="mt-12 flex flex-col items-center gap-4 text-white animate-in zoom-in spin-in-1 duration-1000">
                  <div className="p-4 bg-green-500/20 rounded-full border border-green-500/30">
                    <CheckCircle2 size={48} className="text-green-400" />
                  </div>
                  <div className="text-center">
                    <span className="font-black uppercase tracking-[0.2em] text-sm text-green-400">Synchronization Complete</span>
                    <p className="text-xs text-gray-500 font-bold mt-1">Finalizing global distribution nodes...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Steps */}
        {step > 1 && (
          <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-white/10'}`} />
                  {s < 3 && <div className={`w-16 h-[2px] rounded-full transition-all duration-500 ${step > s ? 'bg-indigo-500/50' : 'bg-white/5'}`} />}
                </div>
              ))}
            </div>

            <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className={step === 2 ? "text-indigo-400" : "opacity-30"}>Metadata details</span>
              <ChevronRight size={14} className="opacity-20" />
              <span className={step === 3 ? "text-indigo-400" : "opacity-30"}>Cloud processing</span>
              <ChevronRight size={14} className="opacity-20" />
              <span className="opacity-30">Live broadcast</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadVideo;