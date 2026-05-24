"use client";
import { useState } from "react";
import type { GuestbookMessage } from "@/lib/data";
import { 
  Check, 
  X, 
  Trash2, 
  User, 
  Clock, 
  CheckSquare, 
  Square,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

interface GuestbookModeratorProps {
  initialMessages: GuestbookMessage[];
}

export function GuestbookModerator({ initialMessages }: GuestbookModeratorProps) {
  const [messages, setMessages] = useState<GuestbookMessage[]>(initialMessages);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Actions for a single message
  const handleApprove = (id: string) => {
    setMessages(
      messages.map((m) => (m.id === id ? { ...m, is_approved: true } : m))
    );
    toast.success("Message approved successfully!");
  };

  const handleReject = (id: string) => {
    setMessages(
      messages.map((m) => (m.id === id ? { ...m, is_approved: false } : m))
    );
    toast.success("Message rejected/marked pending.");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this message permanently?")) {
      setMessages(messages.filter((m) => m.id !== id));
      toast.success("Message permanently deleted!");
    }
  };

  // Batch actions
  const handleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map((m) => m.id || "").filter(Boolean));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    setMessages(
      messages.map((m) =>
        m.id && selectedIds.includes(m.id) ? { ...m, is_approved: true } : m
      )
    );
    setSelectedIds([]);
    toast.success("All selected messages approved!");
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm("Delete all selected messages permanently?")) {
      setMessages(messages.filter((m) => !m.id || !selectedIds.includes(m.id)));
      setSelectedIds([]);
      toast.success("All selected messages permanently deleted!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <h2 
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
            className="text-3xl font-light text-[var(--text-primary)]"
          >
            Guestbook Moderation
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-light mt-1">
            Review public messages, approve valid guestbook entries, or discard spam.
          </p>
        </div>

        {/* Batch actions bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-[var(--bg-raised)] border border-[var(--border-normal)] px-3 py-1.5 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">
              {selectedIds.length} Selected:
            </span>
            <button
              onClick={handleBatchApprove}
              className="flex items-center gap-0.5 px-2.5 py-1 rounded bg-[var(--jade-glow)] hover:bg-[var(--jade)] text-[var(--jade)] hover:text-[var(--bg-void)] text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Approve All
            </button>
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-0.5 px-2.5 py-1 rounded bg-[rgba(232,93,60,0.15)] hover:bg-[var(--maple)] text-[var(--maple)] hover:text-white text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Messages Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-normal)] bg-[var(--bg-surface)]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--bg-raised)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              <th className="p-4 w-10 text-center">
                <button onClick={handleSelectAll} className="p-1 text-[var(--text-muted)] hover:text-white cursor-pointer">
                  {selectedIds.length === messages.length && messages.length > 0 ? (
                    <CheckSquare className="h-4.5 w-4.5 text-[var(--jade)]" />
                  ) : (
                    <Square className="h-4.5 w-4.5" />
                  )}
                </button>
              </th>
              <th className="p-4 w-36">Sender</th>
              <th className="p-4">Message</th>
              <th className="p-4 w-32">Timestamp</th>
              <th className="p-4 w-24 text-center">Status</th>
              <th className="p-4 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m, idx) => {
              const id = m.id || idx.toString();
              const isSelected = selectedIds.includes(id);
              
              let statusBadge = "";
              if (m.is_approved) {
                statusBadge = "bg-[var(--jade-glow)] text-[var(--jade)] border-[var(--jade-border)]";
              } else {
                statusBadge = "bg-[rgba(232,184,75,0.15)] text-[var(--gold)] border-[rgba(232,184,75,0.2)]";
              }

              return (
                <tr key={id} className={`border-b border-[var(--border-subtle)] hover:bg-[var(--bg-raised)]/35 transition-colors ${isSelected ? "bg-[var(--jade-glow)]/5" : ""}`}>
                  {/* Select check box */}
                  <td className="p-4 text-center">
                    <button onClick={() => handleSelectOne(id)} className="p-1 cursor-pointer">
                      {isSelected ? (
                        <CheckSquare className="h-4.5 w-4.5 text-[var(--jade)]" />
                      ) : (
                        <Square className="h-4.5 w-4.5 text-[var(--text-muted)]" />
                      )}
                    </button>
                  </td>

                  {/* Sender Name */}
                  <td className="p-4 font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-[var(--jade)] flex-none" />
                    <span className="truncate">{m.sender_name}</span>
                  </td>

                  {/* Message (Truncated) */}
                  <td className="p-4 text-[var(--text-secondary)] font-light max-w-sm">
                    <p className="truncate italic" title={m.message}>
                      “{m.message}”
                    </p>
                  </td>

                  {/* Timestamp */}
                  <td className="p-4 font-mono text-[var(--text-muted)]">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : "Recently"}
                  </td>

                  {/* Status */}
                  <td className="p-4 text-center">
                    <span className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded border ${statusBadge}`}>
                      {m.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>

                  {/* Actions triggers */}
                  <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                    {m.is_approved ? (
                      <button
                        onClick={() => handleReject(id)}
                        className="p-1.5 rounded hover:bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors cursor-pointer"
                        title="Mark Pending"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(id)}
                        className="p-1.5 rounded hover:bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:text-[var(--jade)] transition-colors cursor-pointer"
                        title="Approve public view"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(id)}
                      className="p-1.5 rounded hover:bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:text-[var(--maple)] transition-colors cursor-pointer"
                      title="Delete permanently"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {messages.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[var(--text-muted)] font-light">
                  <AlertTriangle className="h-6 w-6 text-[var(--text-muted)] mx-auto mb-2" />
                  No guestbook messages configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
