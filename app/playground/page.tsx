"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KanjiWatermark } from "@/components/decorative/kanji-watermark";
import { Send, Terminal, Cpu, AlertCircle, RefreshCw, Layers } from "lucide-react";

type Msg = { id: string; role: "user" | "assistant"; content: string; isStreaming?: boolean };

const suggestedQuestions = [
  "What projects have you built?",
  "Tell me about StuntSense",
  "What's your main tech stack?"
];

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    
    window.addEventListener("resize", handleResize);
    
    const dotSpacing = 32;
    const dots: { x: number; y: number; opacity: number; targetOpacity: number; speed: number }[] = [];
    
    for (let x = 0; x < width; x += dotSpacing) {
      for (let y = 0; y < height; y += dotSpacing) {
        dots.push({
          x,
          y,
          opacity: Math.random() * 0.4,
          targetOpacity: Math.random() * 0.4,
          speed: 0.003 + Math.random() * 0.008
        });
      }
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(61, 214, 140, 0.4)"; // Soft Jade color
      
      dots.forEach(dot => {
        if (Math.abs(dot.opacity - dot.targetOpacity) < 0.01) {
          dot.targetOpacity = Math.random() * 0.5;
        }
        dot.opacity += (dot.targetOpacity - dot.opacity) * dot.speed;
        
        ctx.globalAlpha = dot.opacity;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

export default function PlaygroundPage() {
  // RAG Chat State
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ML Demo 1 (Interactive classifier state)
  const [confidence, setConfidence] = useState<number>(0);
  const [mlInput, setMlInput] = useState("");
  const [mlResult, setMlResult] = useState<string>("");
  const [mlLoading, setMlLoading] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle RAG message submission
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Msg = { id: `msg-${Date.now()}-user`, role: "user", content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!res.ok) throw new Error("Failed to get answer");

      const text = await res.text();
      
      // Simulate typing/streaming effect
      const assistantMsgId = `msg-${Date.now()}-assistant`;
      const assistantMsg: Msg = { id: assistantMsgId, role: "assistant", content: "", isStreaming: true };
      setMessages(prev => [...prev, assistantMsg]);
      
      let index = 0;
      const interval = setInterval(() => {
        setMessages(prev => {
          const next = [...prev];
          const lastMsg = next[next.length - 1];
          if (lastMsg && lastMsg.id === assistantMsgId) {
            lastMsg.content = text.substring(0, index + 1);
            if (index >= text.length - 1) {
              lastMsg.isStreaming = false;
              clearInterval(interval);
            }
          }
          return next;
        });
        index++;
      }, 12);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: `msg-${Date.now()}-err`, role: "assistant", content: "Failed to connect to RAG pipeline. Please verify Pinecone & Gemini configuration." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle ML Inference simulation
  const handleMlInference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mlInput.trim() || mlLoading) return;
    setMlLoading(true);
    setConfidence(0);
    setMlResult("");

    setTimeout(() => {
      // Deterministic but cool scoring simulation
      let prediction = "";
      let score = 0;
      const term = mlInput.toLowerCase();
      if (term.includes("child") || term.includes("pose") || term.includes("stand")) {
        prediction = "Pose Estimated: Correct Standing posture for Stunting screening.";
        score = 94.6;
      } else if (term.includes("face") || term.includes("eye") || term.includes("image")) {
        prediction = "Model prediction: Face bounding box successfully localized.";
        score = 88.2;
      } else {
        prediction = "Classification: Toddler growth marker detected.";
        score = 75.4;
      }
      setMlResult(prediction);
      
      // Animate progress bar fill
      let currentVal = 0;
      const fillInterval = setInterval(() => {
        currentVal += 2;
        if (currentVal >= score) {
          setConfidence(score);
          clearInterval(fillInterval);
        } else {
          setConfidence(currentVal);
        }
      }, 10);

      setMlLoading(false);
    }, 1200);
  };

  return (
    <section className="relative min-h-screen bg-[var(--bg-void)] pt-24 pb-24 overflow-hidden">
      {/* Neural Network background canvas */}
      <NeuralCanvas />

      {/* Scan line effect — garis horizontal yang bergerak dari atas ke bawah */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] bg-[var(--jade)]/20 pointer-events-none z-10"
        animate={{ y: ["-100%", "100vh"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />

      {/* Kanji Watermark "知" (Knowledge/Wisdom) */}
      <KanjiWatermark kanji="知" className="opacity-[0.025]" />

      <div className="relative z-10 mx-auto max-w-5xl px-5 space-y-16">
        
        {/* Header Hero Area */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--jade)] 
                       tracking-widest mb-4 border border-[rgba(61,214,140,0.2)] px-3.5 py-1.5 rounded-full bg-[var(--jade-dim)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--jade)] animate-pulse" />
            SHOWCASE · LIVE SYSTEMS
          </motion.div>
          
          <h1 
            style={{ fontFamily: '"Cormorant Garamond", serif', letterSpacing: "-0.02em" }}
            className="mt-2 text-5xl md:text-6xl font-light text-[var(--text-1)] leading-tight"
          >
            AI Neural <span className="text-[var(--jade)]">Laboratory</span>
          </h1>
          
          {/* Animated stats bar */}
          <div className="flex flex-wrap gap-8 mt-8 border-t border-[var(--b1)] pt-6">
            {[
              { label: "Models Active", value: "2", color: "text-[var(--jade)]" },
              { label: "Avg Response", value: "1.2s", color: "text-[var(--indigo)]" },
              { label: "RAG Index Size", value: "~200 chunks", color: "text-[var(--gold)]" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className={`text-2xl font-mono font-bold ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-xs font-mono text-[var(--text-3)] mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* EXHIBIT 1: RAG Chat Interface */}
        <div className="space-y-6">
          {/* Section Divider Bar */}
          <div className="flex items-center gap-4">
            <span 
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
              className="text-[10px] font-bold text-[var(--jade)] uppercase tracking-widest bg-[var(--jade-dim)] border border-[var(--jade-glow)] px-2.5 py-0.5 rounded"
            >
              Exhibit 01
            </span>
            <div className="h-[1px] flex-1 bg-[var(--b1)]" />
            <h2 
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              className="text-xs font-semibold tracking-wider text-[var(--text-primary)] uppercase flex items-center gap-2"
            >
              <Layers className="h-4 w-4 text-[var(--jade)]" /> Knowledge Base RAG Assistant
            </h2>
            <div className="h-[1px] flex-1 bg-[var(--b1)]" />
          </div>

          {/* RAG Container */}
          <div className="relative">
            {/* Ambient glow di belakang container */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[var(--jade)]/10 via-transparent to-[var(--indigo)]/10 blur-xl pointer-events-none" />

            <div className="relative rounded-2xl border border-[rgba(61,214,140,0.25)] bg-[var(--surface)] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col h-[500px]">
              
              {/* Terminal title bar */}
              <div className="bg-[var(--bg-raised)] px-5 py-3.5 flex items-center justify-between border-b border-[var(--b1)]">
                <div className="flex items-center gap-3">
                  {/* Traffic lights */}
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[var(--maple)]/60" />
                    <div className="w-3 h-3 rounded-full bg-[var(--gold)]/60" />
                    <div className="w-3 h-3 rounded-full bg-[var(--jade)]/60" />
                  </div>
                  <span className="text-xs font-mono text-[var(--text-3)] ml-2">
                    najinkyou_rag_index_v1
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Live status */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--jade)] animate-pulse" />
                    <span className="text-[10px] font-mono text-[var(--jade)]">GEMINI 1.5 PRO</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-3)]">PINECONE RETRIEVER</span>
                </div>
              </div>

              {/* Chat Messages area */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--jade)]/20 bg-[#070709]"
              >
                {/* Welcome message dari system */}
                <div className="flex gap-3">
                  {/* Avatar kanji 知 */}
                  <div className="w-8 h-8 rounded-lg bg-[var(--jade-dim)] border border-[var(--jade-glow)] flex items-center justify-center flex-shrink-0 font-serif text-[var(--jade)] text-sm shadow-[0_0_8px_rgba(61,214,140,0.15)] select-none">
                    知
                  </div>
                  <div className="bg-[var(--surface)] rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl border border-[var(--border-normal)] px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-[var(--text-2)] leading-relaxed font-light">
                      Konnichiwa! I am Najin's portfolio RAG assistant. Ask me anything about 
                      his credentials, AI models, or developer journey.
                    </p>
                    {/* Suggested questions INSIDE welcome bubble */}
                    <div className="flex flex-wrap gap-2 mt-3.5 border-t border-[var(--b1)] pt-3">
                      {suggestedQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSend(q)}
                          className="text-[10px] px-3.5 py-1.5 rounded-full border border-[var(--jade-glow)] text-[var(--jade)] bg-[var(--jade-dim)] hover:border-[var(--jade)] hover:text-white transition-all duration-200 font-mono cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Messages Feed */}
                <AnimatePresence initial={false}>
                  {messages.map((m) => {
                    const isUser = m.role === "user";
                    return (
                      <motion.div 
                        key={m.id} 
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className={`flex gap-3 ${isUser ? "flex-row-reverse" : "justify-start"}`}
                      >
                        {/* Bot Avatar */}
                        {!isUser && (
                          <div className="w-8 h-8 rounded-lg bg-[var(--jade-dim)] border border-[var(--jade-glow)] flex items-center justify-center flex-shrink-0 font-serif text-[var(--jade)] text-sm shadow-[0_0_8px_rgba(61,214,140,0.15)] select-none">
                            知
                          </div>
                        )}

                        {/* Chat Bubble */}
                        <div
                          className={`px-4 py-3 text-sm leading-relaxed border ${
                            isUser
                              ? "bg-[var(--jade)] text-[var(--bg-void)] border-[var(--jade)] font-medium rounded-tl-2xl rounded-tr-sm rounded-bl-2xl rounded-br-2xl"
                              : "bg-[var(--surface)] border-[var(--border-normal)] text-[var(--text-primary)] rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl font-light"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">
                            {m.role === "assistant" && m.isStreaming ? (
                              <span>
                                {m.content}
                                <span className="animate-pulse text-[var(--jade)] font-bold">▊</span>
                              </span>
                            ) : (
                              m.content
                            )}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* RAG Loading Animation */}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-lg bg-[var(--jade-dim)] border border-[var(--jade-glow)] flex items-center justify-center flex-shrink-0 font-serif text-[var(--jade)] text-sm shadow-[0_0_8px_rgba(61,214,140,0.15)]">
                      知
                    </div>
                    <div className="bg-[var(--surface)] border border-[var(--border-normal)] rounded-2xl rounded-tl-none px-4 py-3 flex flex-col gap-2">
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-[var(--jade)]"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                          />
                        ))}
                        <span className="text-[11px] font-mono text-[var(--text-3)] ml-2">
                          Searching knowledge base...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input area */}
              <div className="bg-[var(--bg-raised)] border-t border-[var(--b1)] p-4 shrink-0">
                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(input)}
                      disabled={isLoading}
                      placeholder="Ask me anything about Najin Kyou..."
                      className="w-full bg-[var(--bg-overlay)] border border-[var(--border-normal)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--jade)] transition-colors disabled:opacity-60 pr-12"
                    />
                    {input.length > 0 && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--text-3)]">
                        {input.length}
                      </span>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(input)}
                    disabled={!input.trim() || isLoading}
                    className="w-11 h-11 rounded-xl bg-[var(--jade)] hover:bg-[#5ae6b5] disabled:bg-[var(--border-normal)] text-[var(--bg-void)] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed shadow-[0_0_12px_rgba(61,214,140,0.2)] flex-shrink-0"
                  >
                    <Send className="h-4 w-4 text-[var(--void)]" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EXHIBIT 2: ML Demos */}
        <div className="space-y-6">
          {/* Section Divider Bar */}
          <div className="flex items-center gap-4">
            <span 
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
              className="text-[10px] font-bold text-[var(--jade)] uppercase tracking-widest bg-[var(--jade-dim)] border border-[var(--jade-glow)] px-2.5 py-0.5 rounded"
            >
              Exhibit 02
            </span>
            <div className="h-[1px] flex-1 bg-[var(--b1)]" />
            <h2 
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              className="text-xs font-semibold tracking-wider text-[var(--text-primary)] uppercase flex items-center gap-2"
            >
              <Cpu className="h-4 w-4 text-[var(--jade)]" /> Deployed Machine Learning Models
            </h2>
            <div className="h-[1px] flex-1 bg-[var(--b1)]" />
          </div>

          {/* Demos Cards Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            
            {/* Card 1: ACTIVE Model */}
            <motion.div
              whileHover={{ borderColor: "var(--jade)", boxShadow: "0 0 30px var(--jade-glow)" }}
              className="relative rounded-2xl border border-[var(--border-normal)] bg-[var(--surface)] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between min-h-[360px] group transition-all duration-300"
            >
              {/* Highlight bar top */}
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[var(--jade)] to-transparent" />

              {/* Animated background: data visualization subtle */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg className="w-full h-full">
                  {[...Array(12)].map((_, i) => (
                    <motion.rect
                      key={i}
                      x={`${i * 8.5 + 2}%`}
                      width="5%"
                      y="10%"
                      animate={{ height: [`${20 + Math.random() * 60}%`, `${20 + Math.random() * 60}%`] }}
                      transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                      fill="var(--jade)"
                      rx={2}
                    />
                  ))}
                </svg>
              </div>
              
              <div className="relative p-6 z-10">
                <div className="flex items-start justify-between mb-4 border-b border-[var(--b1)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--jade-dim)] border border-[var(--jade-glow)] flex items-center justify-center text-sm">
                      🧬
                    </div>
                    <h3 className="font-bold text-[var(--text-1)] text-lg">Pose Growth Predictor</h3>
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--jade)] bg-[var(--jade-dim)] border border-[var(--jade-glow)] px-2.5 py-1 rounded-full">
                    Live Demo
                  </span>
                </div>
                
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light mb-4">
                  Interactive simulation of the StuntSense early stunting classifier. Input an aspect-ratio description or growth keyphrase to run inference.
                </p>

                {/* Inference form */}
                <form onSubmit={handleMlInference} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                      Toddler Posture Description / Dimensions
                    </label>
                    <input
                      type="text"
                      value={mlInput}
                      onChange={(e) => setMlInput(e.target.value)}
                      required
                      placeholder="E.g. standing pose, height 85cm, age 24 months"
                      className="w-full bg-[var(--bg-overlay)] border border-[var(--border-normal)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--jade)] transition-colors"
                    />
                  </div>
                  
                  {/* Result area (muncul setelah input) */}
                  <AnimatePresence>
                    {mlResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3.5 rounded-xl bg-[var(--jade-dim)] border border-[var(--jade-glow)] space-y-2 overflow-hidden"
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-[var(--jade)] font-mono uppercase tracking-wider">Classification</span>
                          <span className="text-xs font-mono text-[var(--text-2)]">{confidence.toFixed(1)}% confidence</span>
                        </div>
                        {/* Confidence bar */}
                        <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[var(--jade)] rounded-full shadow-[0_0_8px_var(--jade)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${confidence}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        <p className="text-sm font-medium text-[var(--text-primary)] font-mono leading-relaxed mt-1">
                          {mlResult}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={mlLoading}
                    className="w-full py-2.5 rounded-xl bg-[var(--jade)] hover:bg-[#5ae6b5] text-[var(--bg-void)] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-60 shadow-[0_0_10px_var(--jade-glow)] flex items-center justify-center gap-2"
                  >
                    {mlLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Simulating inference...
                      </>
                    ) : (
                      "Compute Growth Classification"
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Card 2: COMING SOON Model */}
            <motion.div
              whileHover={{ borderColor: "var(--indigo)" }}
              className="relative rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)]/40 p-6 flex flex-col justify-between min-h-[360px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
            >
              {/* Scan effect */}
              <motion.div
                className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--indigo)]/40 to-transparent pointer-events-none"
                animate={{ y: [0, 350, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4 border-b border-[var(--b1)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--indigo)]/10 border border-[var(--indigo)]/20 flex items-center justify-center text-sm">
                      👁️
                    </div>
                    <h3 className="font-bold text-[var(--text-secondary)] text-lg">Mobile Vision Classifier</h3>
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--gold)] border border-[rgba(245,158,11,0.3)] bg-[var(--gold-dim)] px-2.5 py-1 rounded-full">
                    ETA: Q3 2026
                  </span>
                </div>
                
                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-light mb-6">
                  FastAPI-backed computer vision classifier for real-time mobile keypoint extraction. Model binaries are currently undergoing structural optimization.
                </p>

                {/* Progress bar */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                    <span>Model optimization progress</span>
                    <span className="font-mono text-[var(--indigo)]">48%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-void)] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, var(--indigo), var(--jade))" }}
                      initial={{ width: 0 }}
                      whileInView={{ width: "48%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              <div className="relative z-10 text-center py-4 bg-[var(--bg-raised)]/60 rounded-xl border border-[var(--b1)] text-[var(--text-muted)] font-mono text-xs uppercase tracking-widest pointer-events-none">
                Coming soon
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
