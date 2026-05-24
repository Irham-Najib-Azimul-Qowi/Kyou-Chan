"use client";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { GuestbookMessage } from "@/lib/data";

interface GuestbookListProps {
  initialMessages: GuestbookMessage[];
}

const ACCENT_COLORS = [
  { border: "border-l-[var(--jade)]", text: "text-[var(--jade)]" },
  { border: "border-l-[var(--gold)]", text: "text-[var(--gold)]" },
  { border: "border-l-[var(--maple)]", text: "text-[var(--maple)]" }
];

export function GuestbookList({ initialMessages }: GuestbookListProps) {
  const [visibleCount, setVisibleCount] = useState(12);

  const displayedMessages = initialMessages.slice(0, visibleCount);

  // Assign accent colors consistently based on index/id so it stays static on render
  const getAccent = (index: number) => {
    return ACCENT_COLORS[index % ACCENT_COLORS.length];
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  return (
    <div className="space-y-12">
      <div className="border-b border-[var(--border-subtle)] pb-4 mb-6">
        <h2 
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
          className="text-3xl font-light text-[var(--text-primary)]"
        >
          What people say
        </h2>
      </div>

      {/* Masonry Layout via CSS Column Count */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance]">
        {displayedMessages.map((msg, index) => {
          const accent = getAccent(index);
          const formattedDate = msg.created_at 
            ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })
            : "recently";

          return (
            <div
              key={msg.id ?? index}
              className={`break-inside-avoid relative rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 flex flex-col justify-between space-y-4 hover:border-[rgba(240,239,230,0.18)] transition-all duration-300 border-l-[3px] ${accent.border} mb-6 shadow-md`}
            >
              {/* Large quote graphic absolute right corner */}
              <span className="absolute top-0 right-4 text-7xl text-[var(--text-primary)] opacity-[0.03] select-none pointer-events-none font-serif">
                “
              </span>

              {/* Message Content */}
              <p className="text-xs md:text-sm font-light leading-relaxed text-[var(--text-secondary)] italic select-text">
                “{msg.message}”
              </p>

              {/* Sender & Timestamp */}
              <div className="flex items-center justify-between border-t border-[rgba(240,239,230,0.04)] pt-3">
                <span 
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  className={`text-xs font-semibold ${accent.text}`}
                >
                  {msg.sender_name}
                </span>
                
                <span 
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  className="text-[9px] text-[var(--text-muted)] font-medium"
                >
                  {formattedDate}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {initialMessages.length > visibleCount && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleLoadMore}
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            className="text-xs font-semibold px-6 py-3 rounded-[6px] border border-[var(--border-normal)] text-[var(--text-primary)] hover:border-[var(--jade)] hover:text-[var(--jade)] bg-transparent transition-all duration-300 cursor-pointer"
          >
            Load More Messages
          </button>
        </div>
      )}

      {initialMessages.length === 0 && (
        <div className="text-center py-10 bg-[var(--bg-surface)] rounded-xl border border-dashed border-[var(--border-normal)]">
          <p className="text-sm text-[var(--text-muted)]">No messages yet. Be the first to leave a trace!</p>
        </div>
      )}
    </div>
  );
}
