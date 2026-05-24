'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import { GuestbookMessage } from '@/lib/supabase/types'
import toast from 'react-hot-toast'

export default function GuestbookPage() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pendingMsg, setPendingMsg] = useState<{name: string; message: string} | null>(null)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Fetch messages
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch('/api/guestbook')
        const data = await res.json()
        setMessages(data.messages ?? [])
        setTotalCount(data.total ?? 0)
      } catch (err) {
        toast.error('Failed to load messages')
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [])
  
  // Auto scroll ke bawah saat messages load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  }, [loading, messages.length])
  
  // Submit
  async function handleSend() {
    setError('')
    
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return
    }
    if (message.trim().length < 5) {
      setError('Message must be at least 5 characters')
      return
    }
    
    setSubmitting(true)
    
    // Optimistic: tampilkan pesan pending
    setPendingMsg({ name: name.trim(), message: message.trim() })
    
    // Scroll ke bawah
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: name.trim(),
          message: message.trim(),
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to send')
      }
      
      // Clear form
      setName('')
      setMessage('')
      
      toast.success('Message sent! Awaiting approval.', {
        style: {
          background: '#161618',
          color: '#EEEEF0',
          border: '1px solid rgba(61,214,140,0.3)',
          borderLeft: '3px solid #3DD68C',
          borderRadius: '12px',
          fontFamily: 'monospace',
          fontSize: '13px',
        },
        icon: '✓',
        duration: 4000,
      })
      
    } catch (err: any) {
      setPendingMsg(null)
      setError(err.message ?? 'Failed to send message')
      toast.error(err.message ?? 'Failed to send message')
    } finally {
      setSubmitting(false)
    }
  }
  
  // Hash nama ke warna accent
  function getAccentColor(name: string): 'jade' | 'indigo' | 'gold' {
    const colors = ['jade', 'indigo', 'gold'] as const
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % 3]
  }
  
  const CSS_COLORS = {
    jade:   { text: '#3DD68C', border: 'rgba(61,214,140,0.2)',  bg: 'rgba(61,214,140,0.08)'  },
    indigo: { text: '#818CF8', border: 'rgba(129,140,248,0.2)', bg: 'rgba(129,140,248,0.08)' },
    gold:   { text: '#F59E0B', border: 'rgba(245,158,11,0.2)',  bg: 'rgba(245,158,11,0.08)'  },
  }
  
  // Group messages by date
  function groupByDate(msgs: GuestbookMessage[]) {
    const groups: { date: string; messages: GuestbookMessage[] }[] = []
    let currentDate = ''
    
    msgs.forEach(msg => {
      const date = new Date(msg.created_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
      if (date !== currentDate) {
        currentDate = date
        groups.push({ date, messages: [msg] })
      } else {
        groups[groups.length - 1].messages.push(msg)
      }
    })
    
    return groups
  }
  
  const grouped = groupByDate(messages)
  
  return (
    <main className="min-h-screen" style={{ background: 'var(--deep)' }}>
      
      {/* Page Header */}
      <section className="relative pt-36 pb-12 px-5 sm:px-8 lg:px-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-0 w-96 h-96 rounded-full blur-3xl opacity-[0.04]"
             style={{ background: 'var(--jade)' }} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-[0.03]"
             style={{ background: 'var(--indigo)' }} />
        
        {/* Kanji watermark */}
        <div className="absolute right-8 top-16 text-[10rem] font-serif font-black
                        opacity-[0.025] text-jade select-none pointer-events-none
                        leading-none hidden lg:block">
          言
        </div>
        
        <div className="relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--jade)]
                       border border-[var(--jade-glow)] px-3 py-1.5 rounded-full mb-6"
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[var(--jade)]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            LIVE TRANSMISSIONS · {totalCount} SIGNALS RECEIVED
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-5xl sm:text-6xl font-light text-[var(--text-primary)] mb-4"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Leave a mark.<br />
            <span className="italic text-[var(--text-secondary)]">Say hello.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
            className="text-sm text-[var(--text-secondary)] max-w-md font-light"
          >
            Your message will appear after approval. 
            Say anything — feedback, a hello, or just let me know you were here.
          </motion.p>
        </div>
      </section>
      
      {/* Chat Container */}
      <section className="px-5 sm:px-8 lg:px-16 pb-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Outer glow */}
          <div className="relative">
            <div className="absolute -inset-px rounded-2xl blur-xl opacity-50 pointer-events-none"
                 style={{ background: 'linear-gradient(to bottom right, rgba(61,214,140,0.1), transparent, rgba(129,140,248,0.1))' }} />
            
            <div className="relative rounded-2xl overflow-hidden border"
                 style={{
                   borderColor: 'var(--b1)',
                   background: 'var(--surface)',
                   height: 'calc(100vh - 180px)',
                   minHeight: '500px',
                   display: 'flex',
                   flexDirection: 'column'
                 }}>
              
              {/* Header */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 flex-shrink-0"
                   style={{ background: 'var(--raised)', borderBottom: '1px solid var(--b1)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center
                                  text-[var(--jade)] text-sm font-serif border"
                       style={{ background: 'var(--jade-dim)', borderColor: 'var(--jade-glow)' }}>
                    言
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Guestbook</p>
                    <p className="text-[11px] font-mono text-[var(--text-muted)]">
                      {messages.length} messages · showing last 50
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                     style={{ background: 'var(--jade-dim)', borderColor: 'var(--jade-glow)' }}>
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--jade)' }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-[10px] font-mono text-[var(--jade)]">LIVE</span>
                </div>
              </div>
              
              {/* Messages area */}
              <div ref={scrollRef}
                   className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-1"
                   style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(61,214,140,0.2) transparent' }}>
                
                {/* Loading skeleton */}
                {loading && (
                  <div className="space-y-4 pt-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-lg flex-shrink-0"
                             style={{ background: 'var(--raised)' }} />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-24 rounded" style={{ background: 'var(--raised)' }} />
                          <div className="h-10 rounded-xl" style={{ background: 'var(--raised)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Empty state */}
                {!loading && messages.length === 0 && !pendingMsg && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-6 py-20"
                  >
                    <motion.div
                      animate={{ opacity: [0.03, 0.08, 0.03] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-[5rem] font-serif select-none"
                      style={{ color: 'var(--jade)' }}
                    >
                      言
                    </motion.div>
                    <div className="text-center">
                      <p className="font-medium mb-1 text-[var(--text-secondary)]">
                        No transmissions yet.
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        Be the first to leave a signal.
                      </p>
                    </div>
                    {/* Radar */}
                    <div className="relative w-14 h-14">
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i}
                          className="absolute inset-0 rounded-full border"
                          style={{ borderColor: 'rgba(61,214,140,0.3)' }}
                          animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                          transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
                        />
                      ))}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full" style={{ background: 'var(--jade)' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Messages grouped by date */}
                {!loading && grouped.map((group) => (
                  <div key={group.date}>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 py-4">
                      <div className="flex-1 h-px" style={{ background: 'var(--b1)' }} />
                      <span className="text-[11px] font-mono px-3 py-1 rounded-full border text-[var(--text-muted)]"
                            style={{ borderColor: 'var(--b1)' }}>
                        {group.date}
                      </span>
                      <div className="flex-1 h-px" style={{ background: 'var(--b1)' }} />
                    </div>
                    
                    {/* Messages */}
                    <AnimatePresence>
                      {group.messages.map((msg, i) => {
                        const color = getAccentColor(msg.sender_name)
                        const css = CSS_COLORS[color]
                        
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: Math.min(i * 0.03, 0.2), type: 'spring', stiffness: 200 }}
                            className="flex gap-3 py-1.5 group"
                          >
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center
                                            flex-shrink-0 text-sm font-bold mt-0.5"
                                 style={{ background: css.bg, border: `1px solid ${css.border}`, color: css.text }}>
                              {msg.sender_name.charAt(0).toUpperCase()}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 max-w-[75%]">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-sm font-semibold text-[var(--text-primary)]">
                                  {msg.sender_name}
                                </span>
                                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                                  {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div className="px-4 py-2.5 rounded-tl-sm rounded-tr-2xl
                                              rounded-bl-2xl rounded-br-2xl text-sm leading-relaxed
                                              transition-all duration-200 group-hover:border-opacity-50"
                                   style={{
                                     background: 'var(--raised)',
                                     border: `1px solid var(--b1)`,
                                     color: 'var(--text-2)'
                                   }}>
                                {msg.message}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                ))}
                
                {/* Pending message (optimistic) */}
                {pendingMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 0.5, y: 0 }}
                    className="flex gap-3 py-1.5"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center
                                    flex-shrink-0 text-sm font-bold mt-0.5 text-[var(--jade)]"
                         style={{ background: 'var(--jade-dim)', border: '1px solid var(--jade-glow)' }}>
                      {pendingMsg.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 max-w-[75%]">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-semibold text-[var(--text-secondary)]">
                          {pendingMsg.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 rounded border text-[var(--text-muted)]"
                              style={{ borderColor: 'var(--b1)', borderStyle: 'dashed' }}>
                          awaiting approval
                        </span>
                      </div>
                      <div className="px-4 py-2.5 rounded-tl-sm rounded-tr-2xl
                                      rounded-bl-2xl rounded-br-2xl text-sm text-[var(--text-muted)]"
                           style={{ background: 'var(--raised)', border: '1px dashed var(--b2)' }}>
                        {pendingMsg.message}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={bottomRef} />
              </div>
              
              {/* Input area — sticky bottom */}
              <div className="flex-shrink-0 px-5 sm:px-6 py-4"
                   style={{ background: 'var(--raised)', borderTop: '1px solid var(--b1)' }}>
                
                {/* Mobile: stack vertikal, Desktop: baris horizontal */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  
                  {/* Name input */}
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    maxLength={50}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="sm:w-36 flex-shrink-0 px-4 py-3 rounded-xl text-sm
                               outline-none transition-all duration-200"
                    style={{
                      background: 'var(--overlay)',
                      border: '1px solid var(--b1)',
                      color: 'var(--text-1)',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--jade)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--b1)'}
                  />
                  
                  {/* Message input */}
                  <div className="flex-1 relative">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                      placeholder="Say hello, share feedback..."
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                      style={{
                        paddingRight: message.length > 400 ? '52px' : '16px',
                        background: 'var(--overlay)',
                        border: '1px solid var(--b1)',
                        color: 'var(--text-1)',
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--jade)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--b1)'}
                    />
                    {message.length > 400 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono"
                            style={{ color: message.length > 480 ? 'var(--maple)' : 'var(--text-3)' }}>
                        {message.length}/500
                      </span>
                    )}
                  </div>
                  
                  {/* Send button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={submitting || !name.trim() || !message.trim()}
                    className="w-full sm:w-12 h-12 rounded-xl flex items-center justify-center
                               gap-2 sm:gap-0 font-mono text-xs font-bold transition-colors cursor-pointer"
                    style={{ background: 'var(--jade)', color: 'var(--void)' }}
                  >
                    {submitting
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <>
                          <Send className="w-4 h-4" />
                          <span className="sm:hidden ml-2">SEND</span>
                        </>
                    }
                  </motion.button>
                </div>
                
                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-mono mt-2 text-[var(--maple)]"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
