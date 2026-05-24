"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";

export function GuestbookForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [senderName, setSenderName] = useState("");
  const [messageText, setMessageText] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        body: JSON.stringify({ sender_name: senderName, message: messageText }),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <div className="w-full max-w-[560px] mx-auto relative z-10">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="rounded-2xl border border-[var(--jade-border)] bg-[var(--bg-surface)] p-8 text-center flex flex-col items-center justify-center min-h-[300px]"
          >
            {/* Massive Kanji character "謝" (Gratitude/Thanks) */}
            <span
              style={{ fontFamily: '"Noto Serif JP", serif', fontWeight: 900 }}
              className="text-[8rem] text-[var(--jade)] opacity-20 select-none leading-none mb-4"
            >
              謝
            </span>
            <h3 
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
              className="text-3xl font-light text-[var(--text-primary)]"
            >
              Arigatou Gozaimasu!
            </h3>
            <p className="mt-4 text-xs md:text-sm text-[var(--text-secondary)] font-light max-w-sm leading-relaxed">
              Thank you, <strong className="text-[var(--jade)]">{senderName}</strong>! Your message was submitted successfully and is currently awaiting admin approval.
            </p>
            <button
              onClick={() => {
                setStatus("idle");
                setSenderName("");
                setMessageText("");
              }}
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              className="mt-6 text-xs font-semibold px-4 py-2 rounded border border-[var(--jade-border)] text-[var(--jade)] hover:bg-[var(--jade-glow)] transition-colors cursor-pointer"
            >
              Write another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="input-form"
            onSubmit={submit}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-[var(--jade-border)] bg-[var(--bg-surface)] p-8 shadow-xl space-y-6"
          >
            <h3 
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
              className="text-2xl font-light text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-3"
            >
              Leave your mark
            </h3>

            {/* Name Input */}
            <div className="space-y-2">
              <label 
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]"
              >
                Your Name *
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                disabled={status === "loading"}
                placeholder="E.g. Kenji Tanaka"
                className="w-full bg-[var(--bg-raised)] border border-[var(--border-normal)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)] focus:shadow-[0_0_8px_rgba(78,203,160,0.15)] transition-all placeholder-[var(--text-muted)] disabled:opacity-60"
              />
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <label 
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]"
              >
                Your Message *
              </label>
              <textarea
                required
                rows={5}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={status === "loading"}
                placeholder="Say hello, share feedback, or just let me know you were here."
                className="w-full bg-[var(--bg-raised)] border border-[var(--border-normal)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)] focus:shadow-[0_0_8px_rgba(78,203,160,0.15)] transition-all placeholder-[var(--text-muted)] resize-y min-h-[120px] disabled:opacity-60"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={status === "loading" || !senderName.trim() || !messageText.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded bg-[var(--jade)] hover:bg-[#5ae6b5] text-[var(--bg-void)] font-semibold text-sm tracking-wider uppercase transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit Message <Send className="h-4 w-4" />
                </>
              )}
            </button>

            {status === "error" && (
              <p className="text-xs text-[var(--maple)] mt-2 font-medium text-center">
                Failed to submit. Please check database configuration and retry.
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
