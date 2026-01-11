
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Upload, X, FileVideo, Info, ChevronRight, CheckCircle2 } from "lucide-react";

const UploadVideo = () => {
  const [formData, setFormData] = useState({ title: "", description: "", tags: "" });
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
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            {step === 1 && "Upload videos"}
            {step === 2 && formData.title}
            {step === 3 && "Processing..."}
          </h1>
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* content */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {step === 1 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-fade-in">
              <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                <Upload size={64} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Drag and drop video files to upload</h3>
              <p className="text-gray-500 mb-8 max-w-sm">Your videos will be private until you publish them.</p>
              <input type="file" id="video-input" hidden accept="video/*" onChange={handleFileChange} />
              <label htmlFor="video-input" className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold text-sm cursor-pointer hover:bg-blue-700 transition-colors uppercase tracking-wide">
                Select Files
              </label>
            </div>
          ) : step === 2 ? (
            <div className="flex-1 flex flex-col lg:flex-row p-6 gap-8 animate-fade-in">
              <div className="flex-1 space-y-6">
                <h2 className="text-2xl font-bold">Details</h2>
                <div className="space-y-4">
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
                      rows={6}
                      className="w-full pt-7 pb-2 px-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-[15px] resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-80 flex flex-col gap-4">
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <video src={previewUrl} className="w-full aspect-video bg-black" />
                  <div className="p-3 bg-gray-100">
                    <div className="text-[11px] text-gray-500 uppercase font-bold mb-1">Video Link</div>
                    <div className="text-blue-600 text-sm truncate cursor-pointer hover:underline">Processing link...</div>
                  </div>
                </div>
                <div className="text-gray-500 text-sm flex items-start gap-2">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p>While the video is processing, you can edit the details. We'll notify you when it's done.</p>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <button onClick={handleSubmit} className="w-full py-2.5 bg-blue-600 text-white rounded-md font-bold text-sm hover:bg-blue-700">
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 animate-fade-in">
              <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden mb-6 relative">
                <div
                  className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Uploading: {progress}%</h3>
              <p className="text-gray-500">Please keep this window open until upload is complete.</p>
              {progress === 100 && (
                <div className="mt-8 flex flex-col items-center gap-2 text-green-600 animate-in zoom-in">
                  <CheckCircle2 size={48} />
                  <span className="font-bold">Finalizing...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Steps */}
        {step > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-blue-600' : 'bg-green-600'}`} />
              <div className={`w-12 h-0.5 ${step === 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`w-3 h-3 rounded-full ${step === 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            </div>
            <div className="text-sm font-bold text-gray-500 flex items-center gap-2">
              <span>{step === 2 ? "Details" : "Processing"}</span>
              <ChevronRight size={16} />
              <span className="opacity-50">Publish</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadVideo;