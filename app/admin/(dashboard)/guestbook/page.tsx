'use client'

import { useState, useEffect } from 'react'
import { Check, X, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

type Message = {
  id: string
  sender_name: string
  message: string
  is_approved: boolean
  created_at: string
  ip_address: string | null
}

type FilterType = 'all' | 'pending' | 'approved'

export default function AdminGuestbook() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  async function fetchMessages() {
    const res = await fetch('/api/admin/guestbook')
    const data = await res.json()
    setMessages(data.messages ?? [])
    setLoading(false)
  }
  
  useEffect(() => { fetchMessages() }, [])
  
  async function handleAction(id: string, action: 'approve' | 'reject' | 'delete') {
    setActionLoading(id)
    
    const res = await fetch(`/api/admin/guestbook/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    
    if (res.ok) {
      if (action === 'delete') {
        setMessages(prev => prev.filter(m => m.id !== id))
      } else {
        setMessages(prev => prev.map(m =>
          m.id === id ? { ...m, is_approved: action === 'approve' } : m
        ))
      }
      toast.success(`Message ${action}d`)
    }
    
    setActionLoading(null)
  }
  
  const filtered = messages.filter(m => {
    if (filter === 'pending') return !m.is_approved
    if (filter === 'approved') return m.is_approved
    return true
  })
  
  const pendingCount = messages.filter(m => !m.is_approved).length
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Guestbook</h1>
          <p className="text-sm mt-1 text-[var(--text-secondary)]">
            Manage visitor messages · {pendingCount} pending approval
          </p>
        </div>
      </div>
      
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved'] as FilterType[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-full text-xs font-mono font-bold
                             transition-all border capitalize cursor-pointer"
                  style={{
                    background: filter === f ? 'var(--jade-dim)' : 'transparent',
                    borderColor: filter === f ? 'var(--jade)' : 'var(--b1)',
                    color: filter === f ? 'var(--jade)' : 'var(--text-3)',
                  }}>
            {f} {f === 'pending' && pendingCount > 0 && `(${pendingCount})`}
          </button>
        ))}
      </div>
      
      {/* Messages table */}
      <div className="rounded-xl border overflow-hidden"
           style={{ background: 'var(--surface)', borderColor: 'var(--b1)' }}>
        
        {/* Table header */}
        <div className="grid grid-cols-[1fr_2fr_120px_100px] gap-4 px-5 py-3 border-b text-xs font-mono"
             style={{ borderColor: 'var(--b1)', color: 'var(--text-3)' }}>
          <span>NAME</span>
          <span>MESSAGE</span>
          <span>DATE</span>
          <span>ACTIONS</span>
        </div>
        
        {loading && (
          <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
            Loading...
          </div>
        )}
        
        <AnimatePresence>
          {filtered.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-[1fr_2fr_120px_100px] gap-4 px-5 py-4 border-b
                         items-center hover:bg-raised transition-colors"
              style={{ borderColor: 'var(--b1)' }}
            >
              {/* Name */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center
                                text-xs font-bold flex-shrink-0"
                     style={{ background: 'var(--raised)', color: 'var(--jade)' }}>
                  {msg.sender_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {msg.sender_name}
                  </p>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full`}
                        style={{
                          background: msg.is_approved ? 'var(--jade-dim)' : 'var(--gold-dim)',
                          color: msg.is_approved ? 'var(--jade)' : 'var(--gold)',
                        }}>
                    {msg.is_approved ? 'APPROVED' : 'PENDING'}
                  </span>
                </div>
              </div>
              
              {/* Message */}
              <p className="text-sm line-clamp-2 text-[var(--text-secondary)]">
                {msg.message}
              </p>
              
              {/* Date */}
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                {new Date(msg.created_at).toLocaleDateString('id-ID')}
              </span>
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                {!msg.is_approved && (
                  <button
                    onClick={() => handleAction(msg.id, 'approve')}
                    disabled={actionLoading === msg.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ background: 'var(--jade-dim)', color: 'var(--jade)' }}
                    title="Approve"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                {msg.is_approved && (
                  <button
                    onClick={() => handleAction(msg.id, 'reject')}
                    disabled={actionLoading === msg.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}
                    title="Unapprove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleAction(msg.id, 'delete')}
                  disabled={actionLoading === msg.id}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                             hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--maple)' }}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-[var(--text-secondary)]">
            No messages found
          </div>
        )}
      </div>
    </div>
  )
}
