import React, { useState, useRef, useEffect } from "react";
import { X, Sparkles, Send, MessageSquare, ListVideo, ChevronRight, Zap, Bot, BrainCircuit, Activity, Terminal, ShieldCheck, Microscope } from "lucide-react";

const InsightIQ = ({ isOpen, onClose, videoTitle, videoDescription, videoTags, onSeek, duration }) => {
    const [activeTab, setActiveTab] = useState("insights");
    const [query, setQuery] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [chatHistory, setChatHistory] = useState([
        {
            role: "ai", content: "Hi! I'm InsightIQ. I've finished a deep-scan of this broadcast's metadata. How can I assist your consumption today?"
        }
    ]);

    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            // Initial analysis simulation
            setIsAnalyzing(true);
            setAnalysisProgress(0);
            const interval = setInterval(() => {
                setAnalysisProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setIsAnalyzing(false), 500);
                        return 100;
                    }
                    return prev + 5;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isTyping, activeTab]);

    if (!isOpen) return null;

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const generateInsights = () => {
        if (!duration) return [
            { time: "01:23", text: "Conceptual Foundation & Thesis" },
            { time: "04:15", text: "Architectural Deep-Dive" },
            { time: "08:45", text: "2026 Industry Edge-Cases" },
            { time: "12:30", text: "Synthesized Conclusion" },
        ];

        return [
            { time: formatTime(duration * 0.1), text: "Conceptual Foundation & Thesis" },
            { time: formatTime(duration * 0.35), text: "Architectural Deep-Dive" },
            { time: formatTime(duration * 0.65), text: "2026 Industry Edge-Cases" },
            { time: formatTime(duration * 0.9), text: "Synthesized Conclusion" },
        ];
    };

    const getMockResponse = (input) => {
        const lowerInput = input.toLowerCase();
        const contentContext = `${videoTitle} ${videoDescription} ${videoTags?.join(' ')}`.toLowerCase();

        const greetings = ["hi", "hello", "hey", "greetings", "who are you", "what can you do"];
        if (greetings.some(g => lowerInput.includes(g))) {
            return `System initialized. I am InsightIQ, a v4.0 neural companion. I process cinematic data in real-time to provide high-fidelity summaries, temporal navigation nodes, and semantic analysis for "${videoTitle}". How shall we proceed?`;
        }

        const summaryKeywords = ["summary", "about", "what is it", "explain", "overview", "tl;dw"];
        if (summaryKeywords.some(k => lowerInput.includes(k))) {
            const descSnippet = videoDescription ? videoDescription.substring(0, 150) + "..." : "the core vision presented by the creator";
            return `### Synthetic Summary\n\nBased on my neural scan, this broadcast investigates **${videoTitle}**. \n\nThe primary narrative vector involves ${descSnippet}. \n\n**Key Vectors Detected:**\n- ${videoTags?.slice(0, 3).join('\n- ') || "General Domain Knowledge"}`;
        }

        const timeKeywords = ["timestamp", "time", "when", "sections", "chapters"];
        if (timeKeywords.some(k => lowerInput.includes(k))) {
            return `I have identified 4 high-value temporal nodes in this ${formatTime(duration || 0)} broadcast. You can find them under the **Inference** tab, or I can provide a specific breakdown if you define a topic.`;
        }

        const creatorKeywords = ["who made", "creator", "channel", "author"];
        if (creatorKeywords.some(k => lowerInput.includes(k))) {
            return `This asset was published to our global index. The primary architect behind this content is focused on ${videoTags?.[0] || "specialized technical domains"}. My logs confirm this is a high-authority cinematic transmission.`;
        }

        const videoKeywords = ['video', 'this', 'show', 'tell', 'show', 'content', 'why', 'how', 'when', 'what', 'who', 'explain'];
        const metadataKeywords = contentContext.split(/\s+/).filter(word => word.length > 3);
        const isRelated = [...videoKeywords, ...metadataKeywords].some(keyword => lowerInput.includes(keyword)) || lowerInput.length < 8;

        if (!isRelated) {
            return "I apologize, but my processing cycles are currently dedicated strictly to the context of this specific broadcast. I cannot access external general knowledge databases at this moment to ensure zero-latency specialized analysis. Please query within the metadata of the current video.";
        }

        return `In response to your query for "${videoTitle}": \n\nMy indexing indicates that the core focus is ${videoDescription?.substring(0, 80) || "the primary subject matter"}. There is a high concentration of ${videoTags?.[0] || 'innovative concepts'} throughout the delivery. \n\nWould you like me to perform a deep-scan on a specific sub-topic?`;
    };

    const handleSend = (text) => {
        const message = typeof text === 'string' ? text : query;
        if (!message.trim()) return;

        const userMsg = { role: "user", content: message };
        setChatHistory(prev => [...prev, userMsg]);
        setQuery("");
        setIsTyping(true);

        setTimeout(() => {
            const responseText = getMockResponse(message);
            setIsTyping(false);
            setChatHistory(prev => [...prev, {
                role: "ai",
                content: responseText
            }]);
        }, 1200);
    };

    const parseTime = (timeStr) => {
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        return 0;
    };

    const handleSeek = (timeStr) => {
        const seconds = parseTime(timeStr);
        if (onSeek) onSeek(seconds);
    };

    const insights = generateInsights();

    const suggestions = [
        "Synthesize broadcast summary",
        "Identify key temporal nodes",
        "Who is the content architect?",
        "Explain the core taxonomy"
    ];

    if (isOpen && isAnalyzing) {
        return (
            <div className={`fixed right-0 top-0 h-full w-full md:w-[420px] bg-[#0f0f0f] z-[200] flex flex-col items-center justify-center p-10 text-center`}>
                <div className="relative mb-10">
                    <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
                    <BrainCircuit size={80} className="text-blue-500 relative animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-[0.4em] mb-4 italic">Analyzing Cinematic Data</h2>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        style={{ width: `${analysisProgress}%` }}
                    />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <Terminal size={12} />
                    <span>Processing: {videoTitle.substring(0, 30)}...</span>
                </div>
                <div className="mt-20 grid grid-cols-2 gap-4 w-full opacity-40">
                    <div className="p-4 border border-white/5 rounded-2xl flex flex-col items-center gap-2">
                        <Microscope size={20} />
                        <span className="text-[8px] uppercase tracking-widest font-bold">Metadata Sync</span>
                    </div>
                    <div className="p-4 border border-white/5 rounded-2xl flex flex-col items-center gap-2">
                        <ShieldCheck size={20} />
                        <span className="text-[8px] uppercase tracking-widest font-bold">Latency Check</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`fixed right-0 top-0 h-full w-full md:w-[420px] bg-[#0f0f0f]/90 backdrop-blur-3xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[200] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col font-sans`}>

            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 animate-pulse" />
                        <div className="relative bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-2.5 rounded-2xl shadow-xl">
                            <BrainCircuit size={20} />
                        </div>
                    </div>
                    <div>
                        <h2 className="font-black text-xl text-white uppercase tracking-tighter italic leading-none">Insight<span className="text-blue-500">IQ</span></h2>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">Neural Engine Online</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2.5 hover:bg-white/10 text-gray-500 hover:text-white rounded-full transition-all border border-transparent hover:border-white/10"
                >
                    <X size={22} />
                </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex p-1.5 mx-6 mt-6 bg-white/5 border border-white/5 rounded-2xl shrink-0">
                <button
                    onClick={() => setActiveTab("insights")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "insights"
                        ? "bg-white text-black shadow-xl"
                        : "text-gray-500 hover:text-white"
                        }`}
                >
                    <Activity size={16} />
                    Inference
                </button>
                <button
                    onClick={() => setActiveTab("chat")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "chat"
                        ? "bg-white text-black shadow-xl"
                        : "text-gray-500 hover:text-white"
                        }`}
                >
                    <MessageSquare size={16} />
                    Interface
                </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeTab === "insights" ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        {/* TL;DW Box */}
                        <div className="relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-white/[0.03] backdrop-blur-xl p-6 rounded-[28px] border border-white/10 shadow-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                                        <Zap size={18} className="animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-sm uppercase tracking-widest mb-2">Synthetic Summary</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                            This cinematic transmission explores the convergence of {videoTags?.[0] || "modern science"} and {videoTags?.[1] || "future vision"}, emphasizing procedural workflows and next-generation delivery protocols.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Highlights */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Temporal Nodes</h3>
                            <div className="space-y-3">
                                {insights.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSeek(item.time)}
                                        className="group relative flex items-center gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.06] rounded-[24px] border border-white/5 hover:border-white/10 transition-all cursor-pointer overflow-hidden"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                        <span className="bg-[#1a1a1a] text-blue-400 text-[10px] font-black px-3 py-1.5 rounded-xl border border-white/10 shadow-lg font-mono">
                                            {item.time}
                                        </span>
                                        <p className="text-[13px] font-bold text-gray-400 group-hover:text-white transition-colors flex-1">
                                            {item.text}
                                        </p>
                                        <ChevronRight size={16} className="text-gray-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tags / Topic Cloud */}
                        <div className="pt-8 border-t border-white/5">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2 mb-4">Core Taxonomy</h3>
                            <div className="flex flex-wrap gap-2.5">
                                {['Autonomous Logic', 'High-Fidelity', 'Visual Cognition', 'Industry 5.0'].map(tag => (
                                    <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-help">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="flex-1 space-y-6 mb-6">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                    {msg.role === 'ai' && (
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white mr-3 shrink-0 shadow-lg border border-white/10">
                                            <Bot size={20} />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] p-4 rounded-[24px] text-[14px] leading-relaxed font-medium shadow-2xl whitespace-pre-line ${msg.role === 'user'
                                        ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30 rounded-br-none'
                                        : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start animate-in fade-in">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white mr-3 shrink-0 shadow-lg border border-white/10">
                                        <Bot size={20} />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] rounded-bl-none flex gap-2 items-center">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Interaction Zone */}
            {activeTab === "chat" && (
                <div className="p-6 border-t border-white/5 bg-[#0f0f0f]/50 backdrop-blur-2xl">
                    {/* Suggestions */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 animate-in slide-in-from-bottom-2 duration-500">
                        {suggestions.map((text, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(text)}
                                className="shrink-0 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-white hover:border-white/20 transition-all whitespace-nowrap"
                            >
                                {text}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative group">
                        <div className="absolute inset-0 bg-blue-600/5 blur-xl group-focus-within:bg-blue-600/10 transition-all opacity-0 group-focus-within:opacity-100" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Query the cinematic index..."
                            className="relative w-full bg-white/5 border border-white/10 pl-5 pr-14 py-4 rounded-2xl text-[14px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!query.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-xl hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all shadow-xl"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <p className="text-[9px] text-center text-gray-600 font-black uppercase tracking-[0.2em] mt-4">
                        Powered by Antigravity v4.0 • Zero Latency Processing
                    </p>
                </div>
            )}
        </div>
    );
};

export default InsightIQ;
