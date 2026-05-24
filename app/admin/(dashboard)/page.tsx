import { createServerClient } from '@/lib/supabase/server'
import { FolderKanban, MessageSquare, Eye, Clock } from 'lucide-react'

async function getStats() {
  const supabase = createServerClient()
  
  const [projectsRes, guestbookRes, pendingRes] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('guestbook').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase.from('guestbook').select('*', { count: 'exact', head: true }).eq('is_approved', false),
  ])
  
  return {
    projects: projectsRes.count ?? 0,
    messages: guestbookRes.count ?? 0,
    pending: pendingRes.count ?? 0,
  }
}

export default async function AdminOverview() {
  const stats = await getStats()
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Overview</h1>
        <p className="text-sm mt-1 text-[var(--text-secondary)]">
          Welcome back. Here's what's happening on your portfolio.
        </p>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Projects', value: stats.projects, icon: FolderKanban, color: 'jade' },
          { label: 'Approved Messages', value: stats.messages, icon: MessageSquare, color: 'indigo' },
          { label: 'Pending Approval', value: stats.pending, icon: Clock, color: stats.pending > 0 ? 'gold' : 'text-secondary', urgent: stats.pending > 0 },
          { label: 'Site Status', value: 'Live', icon: Eye, color: 'jade' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border p-5"
               style={{
                 background: 'var(--surface)',
                 borderColor: stat.urgent ? 'var(--gold-glow)' : 'var(--b1)',
                 boxShadow: stat.urgent ? '0 0 20px rgba(245,158,11,0.05)' : 'none',
               }}>
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-4 h-4" style={{ color: stat.color === 'text-secondary' ? 'var(--text-secondary)' : `var(--${stat.color})` }} />
              {stat.urgent && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--gold)' }}>
                  NEEDS ACTION
                </span>
              )}
            </div>
            <p className="text-2xl font-mono font-bold mb-1"
               style={{ color: stat.color === 'text-secondary' ? 'var(--text-primary)' : `var(--${stat.color})` }}>
              {stat.value}
            </p>
            <p className="text-xs font-mono text-[var(--text-secondary)]">{stat.label}</p>
          </div>
        ))}
      </div>
      
      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Add New Project', href: '/admin/projects/new', color: 'jade' },
          { label: 'Review Pending Messages', href: '/admin/guestbook', color: 'gold' },
          { label: 'Edit Site Config', href: '/admin/settings', color: 'indigo' },
        ].map((action, i) => (
          <a key={i} href={action.href}
             className="px-5 py-4 rounded-xl border text-sm font-medium
                        hover:opacity-80 transition-all flex items-center justify-between cursor-pointer"
             style={{
               background: `var(--${action.color}-dim)`,
               borderColor: `var(--${action.color}-glow)`,
               color: `var(--${action.color})`,
             }}>
            {action.label}
            <span>→</span>
          </a>
        ))}
      </div>
    </div>
  )
}
