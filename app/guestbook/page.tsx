"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertCircle, MessageSquare } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type GuestbookMessage = {
  id: string;
  sender_name: string;
  message: string;
  is_approved?: boolean;
  created_at: string;
};

type PendingMessage = {
  name: string;
  message: string;
};

// Date formatter
const formatDateIndo = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

// Check if two date strings represent different calendar days
const isDifferentDay = (d1Str?: string, d2Str?: string) => {
  if (!d1Str || !d2Str) return true;
  const d1 = new Date(d1Str);
  const d2 = new Date(d2Str);
  return d1.toDateString() !== d2.toDateString();
};

const hashStringToIndex = (str: string, max: number) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
};

const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  
  const day = date.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  return `${day} ${months[date.getMonth()]}`;
};

export default function GuestbookPage() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<PendingMessage | null>(null);
  const [error, setError] = useState("");
  const [isShake, setIsShake] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch approved messages on load
  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/guestbook");
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      
      // Reverse messages to chronological order and limit to latest 50
      const sorted = Array.isArray(data) 
        ? [...data].reverse().slice(-50) 
        : [];
      
      setMessages(sorted);
    } catch (err) {
      toast.error("Failed to load signals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => scrollToBottom("auto"), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, messages.length, pendingMessage]);

  const handleSend = async () => {
    setError("");
    setIsShake(false);

    if (!name.trim()) {
      setError("Sender name is required.");
      setIsShake(true);
      return;
    }
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      setIsShake(true);
      return;
    }
    if (!message.trim()) {
      setError("Message content is required.");
      setIsShake(true);
      return;
    }
    if (message.trim().length < 5) {
      setError("Message must be at least 5 characters.");
      setIsShake(true);
      return;
    }

    setIsSubmitting(true);
    const tempPending = { name: name.trim(), message: message.trim() };
    setPendingMessage(tempPending);
    
    const savedMsg = message;
    setMessage("");

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        body: JSON.stringify({ sender_name: tempPending.name, message: tempPending.message }),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        toast.success("✓ Signal sent! Awaiting approval.", {
          duration: 4000,
          style: {
            background: "var(--surface)",
            color: "var(--jade)",
            border: "1px solid var(--jade-glow)"
          }
        });
      } else {
        throw new Error("Transmission failed");
      }
    } catch (err) {
      setError("Transmission error. Please try again.");
      setIsShake(true);
      setMessage(savedMsg);
      setPendingMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)]">
      <Toaster position="top-center" />
      
      {/* 3.1 Background guestbook page */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 80%, rgba(61,214,140,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(129,140,248,0.04) 0%, transparent 60%),
            var(--bg-deep)
          `
        }}
      />

      {/* 3.2 Page Header — Full Width, Atmospheric */}
      <section className="relative pt-32 pb-14 px-8 md:px-16 overflow-hidden border-b border-[var(--b1)] z-10">
        
        {/* Background wave pattern SVG moving slowly */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.svg
            className="absolute bottom-0 left-0 right-0 opacity-[0.035]"
            viewBox="0 0 1440 200"
            animate={{ x: [0, -120, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <path 
              d="M0,100 C240,0 480,200 720,100 C960,0 1200,200 1440,100 L1440,200 L0,200 Z"
              fill="var(--jade)" 
            />
          </motion.svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto flex justify-between items-end">
          <div className="space-y-4">
            {/* Kanji watermark */}
            <div className="absolute top-0 right-8 text-[11rem] font-serif opacity-[0.035] text-[var(--jade)] select-none pointer-events-none leading-none">
              言
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2 text-[10px] font-mono border border-[var(--jade-glow)] px-3.5 py-1.5 rounded-full text-[var(--jade)] bg-[var(--jade-dim)]"
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-[var(--jade)]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              LIVE TRANSMISSIONS · {messages.length + (pendingMessage ? 1 : 0)} SIGNALS RECEIVED
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
              className="text-5xl md:text-6xl font-light text-[var(--text-1)] leading-tight"
            >
              Leave a mark.<br />
              <span className="italic text-[var(--text-2)] font-light">Say hello.</span>
            </motion.h1>
            
            <p className="text-xs md:text-sm text-[var(--text-2)] max-w-md font-light">
              Your message will appear here after approval. Say anything — feedback, a hello, or just let me know you were here.
            </p>
          </div>
        </div>
      </section>

      {/* 3.3 Main Chat Container — Full Height visual */}
      <section className="px-6 md:px-16 py-12 relative z-10 max-w-6xl mx-auto">
        
        {/* Outer glow container */}
        <div className="relative">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[var(--jade)]/5 via-transparent to-[var(--indigo)]/5 blur-2xl pointer-events-none" />
          
          <div 
            className="relative rounded-2xl overflow-hidden border border-[var(--b1)] bg-[var(--surface)]/90 backdrop-blur-sm flex flex-col"
            style={{ height: "calc(100vh - 220px)" }}
          >
            
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-[var(--bg-raised)] border-b border-[var(--b1)] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--jade-dim)] border border-[var(--jade-glow)] flex items-center justify-center text-[var(--jade)] text-xs font-serif shadow-[0_0_8px_rgba(61,214,140,0.15)]">
                  言
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-[var(--text-1)]">Console Guestbook</p>
                  <p className="text-[10px] font-mono text-[var(--text-3)]">
                    {messages.length} approved messages · showing last 50
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 border border-[var(--jade-glow)] bg-[var(--jade-dim)] px-3 py-1.5 rounded-full">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-[var(--jade)]"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-[9px] font-mono text-[var(--jade)] uppercase tracking-wider font-semibold">LIVE ACTIVITY</span>
                </div>
              </div>
            </div>
            
            {/* Messages scroll area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--jade)]/10 bg-[#070709]"
            >
              {loading ? (
                /* Shimmer loading layout */
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 shrink-0 skeleton-shimmer" />
                      <div className="space-y-2 flex-1 max-w-[60%]">
                        <div className="h-3 w-24 bg-white/5 rounded skeleton-shimmer" />
                        <div className="h-10 bg-white/5 rounded-xl skeleton-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 && !pendingMessage ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full gap-6 text-[var(--text-3)]"
                >
                  <motion.div
                    animate={{ opacity: [0.03, 0.08, 0.03] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-[6rem] font-serif text-[var(--jade)] select-none"
                  >
                    言
                  </motion.div>
                  <div className="text-center space-y-1">
                    <p className="text-[var(--text-2)] font-medium">No signals transmitted yet.</p>
                    <p className="text-xs">Be the first to establish connection.</p>
                  </div>
                  {/* Radar ripple effects */}
                  <div className="relative w-14 h-14 mt-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border border-[var(--jade)]/30 pointer-events-none"
                        animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                        transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
                      />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-[var(--jade)] shadow-[0_0_8px_var(--jade)]" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const prevMsg = index > 0 ? messages[index - 1] : undefined;
                    const showSeparator = isDifferentDay(msg.created_at, prevMsg?.created_at);
                    
                    const accentColors = ["jade", "indigo", "gold"];
                    const color = accentColors[hashStringToIndex(msg.sender_name, 3)];
                    
                    const initials = msg.sender_name
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2);

                    const isOwner = 
                      msg.sender_name.toLowerCase() === "najin kyou" || 
                      msg.sender_name.toLowerCase() === "irham najib" || 
                      msg.sender_name.toLowerCase() === "admin";

                    return (
                      <div key={msg.id} className="space-y-4">
                        {showSeparator && (
                          <div 
                            style={{ fontFamily: '"JetBrains Mono", monospace' }}
                            className="text-[9px] text-[var(--text-3)] flex items-center justify-center gap-4 py-2 select-none uppercase tracking-wider font-semibold"
                          >
                            <span className="h-[1px] bg-[var(--b1)] flex-grow animate-pulse" />
                            <span>{formatDateIndo(msg.created_at)}</span>
                            <span className="h-[1px] bg-[var(--b1)] flex-grow animate-pulse" />
                          </div>
                        )}

                        <motion.div
                          initial={{ opacity: 0, y: 16, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: Math.min(index * 0.02, 0.25), type: "spring", stiffness: 220 }}
                          className={`flex gap-3 py-1.5 ${isOwner ? "flex-row-reverse" : "justify-start"}`}
                        >
                          {/* Colored letter avatar */}
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-md mt-0.5 select-none"
                            style={{
                              background: `var(--${color}-dim)`,
                              border: `1px solid var(--${color}-glow)`,
                              color: `var(--${color})`
                            }}
                          >
                            {initials}
                          </div>

                          <div className={`max-w-[75%] space-y-1 ${isOwner ? "text-right" : "text-left"}`}>
                            {/* Header details */}
                            <div className="flex items-baseline gap-2 text-[10px] text-[var(--text-3)] px-1">
                              <span className={`font-semibold ${isOwner ? "text-[var(--jade)]" : "text-[var(--text-2)]"}`}>
                                {msg.sender_name}
                              </span>
                              <span className="text-[9px] font-mono">
                                {formatRelativeTime(msg.created_at)}
                              </span>
                            </div>

                            {/* Message bubble */}
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm leading-relaxed border ${
                                isOwner
                                  ? "bg-[var(--jade-dim)] border-[rgba(61,214,140,0.3)] text-[var(--text-1)] rounded-tr-sm"
                                  : "bg-[var(--surface)] border-[var(--b1)] text-[var(--text-2)] rounded-tl-sm hover:border-[var(--b2)] transition-colors"
                              }`}
                            >
                              <p className="font-light whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}

                  {/* Pending message (optimistic UI) */}
                  {pendingMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 0.5, y: 0 }}
                      className="flex gap-3 py-1.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--jade-dim)] border border-dashed border-[var(--jade-glow)] flex items-center justify-center text-[var(--jade)] text-xs font-bold shrink-0">
                        {pendingMessage.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow max-w-[75%] space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-[var(--text-3)] px-1">
                          <span className="font-semibold text-[var(--text-2)]">
                            {pendingMessage.name}
                          </span>
                          <span className="text-[9px] font-mono border border-dashed border-[var(--text-3)] px-1.5 rounded uppercase font-semibold scale-90">
                            awaiting approval
                          </span>
                        </div>
                        <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm border border-dashed border-[var(--b2)] bg-[var(--bg-raised)]/50 text-xs md:text-sm text-[var(--text-3)] leading-relaxed animate-pulse">
                          {pendingMessage.message}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            
            {/* Input bar — sticky bottom */}
            <div className="border-t border-[var(--b1)] px-6 py-4 bg-[var(--bg-raised)] flex-shrink-0">
              <motion.div 
                animate={{ x: isShake ? [-8, 8, -6, 6, -4, 4, 0] : 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row gap-3 items-center"
              >
                {/* Name input */}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={40}
                  className="w-full md:w-36 flex-shrink-0 bg-[var(--bg-overlay)] border border-[var(--b1)] rounded-xl px-4 py-3 text-xs text-[var(--text-1)] placeholder-[var(--text-3)] outline-none focus:border-[var(--jade)] transition-colors"
                />
                
                {/* Message input */}
                <div className="flex-grow w-full relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Say hello, share feedback..."
                    className="w-full bg-[var(--bg-overlay)] border border-[var(--b1)] rounded-xl px-4 py-3 pr-16 text-xs text-[var(--text-1)] placeholder-[var(--text-3)] outline-none focus:border-[var(--jade)] transition-colors"
                  />
                  {/* Character counter — muncul saat > 400 */}
                  {message.length > 400 && (
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono ${message.length > 480 ? "text-[var(--maple)] font-semibold" : "text-[var(--text-3)]"}`}>
                      {message.length} / 500
                    </span>
                  )}
                </div>
                
                {/* Send button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!name.trim() || !message.trim() || isSubmitting}
                  className="w-full md:w-12 h-12 rounded-xl bg-[var(--jade)] hover:bg-[#5ae6b5] text-[var(--void)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0 cursor-pointer shadow-[0_0_12px_rgba(61,214,140,0.2)]"
                >
                  {isSubmitting ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-[var(--void)] border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <Send className="w-4 h-4 text-[var(--void)]" />
                  )}
                </motion.button>
              </motion.div>
              
              {/* Validation error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] text-[var(--maple)] mt-2.5 font-mono flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </div>
      </section>
    </main>
  );
}
