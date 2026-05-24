'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FolderKanban, MessageSquare,
  Settings, LogOut, ExternalLink
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin',           icon: LayoutDashboard, label: 'Overview'   },
  { href: '/admin/projects',  icon: FolderKanban,    label: 'Projects'   },
  { href: '/admin/guestbook', icon: MessageSquare,   label: 'Guestbook'  },
  { href: '/admin/settings',  icon: Settings,        label: 'Site Config'},
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  
  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }
  
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 flex flex-col z-40"
           style={{ background: 'var(--surface)', borderRight: '1px solid var(--b1)' }}>
      
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--b1)' }}>
        <div className="flex items-center gap-3">
          <span className="text-xl font-serif text-[var(--jade)]">名人強</span>
          <div>
            <p className="text-xs font-semibold text-[var(--text-1)]">Najin Kyou</p>
            <p className="text-[10px] font-mono text-[var(--text-3)]">Admin Panel</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                           text-sm transition-all duration-150 relative cursor-pointer"
                style={{
                  background: isActive ? 'var(--jade-dim)' : 'transparent',
                  color: isActive ? 'var(--jade)' : 'var(--text-2)',
                  borderLeft: isActive ? '2px solid var(--jade)' : '2px solid transparent',
                }}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </motion.div>
            </Link>
          )
        })}
      </nav>
      
      {/* Bottom */}
      <div className="p-3 space-y-1 border-t" style={{ borderColor: 'var(--b1)' }}>
        <Link href="/" target="_blank">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                          hover:bg-raised transition-colors cursor-pointer text-[var(--text-2)]">
            <ExternalLink className="w-4 h-4" />
            View Site
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full
                     hover:bg-raised transition-colors cursor-pointer text-[var(--maple)]"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
