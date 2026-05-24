"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  LogOut,
  ShieldCheck
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: Briefcase },
  { label: "Guestbook", href: "/admin/guestbook", icon: MessageSquare },
  { label: "Site Config", href: "/admin/site-config", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex text-sm text-[var(--text-secondary)]">
      {/* Fixed Sidebar (240px) */}
      <aside className="fixed left-0 top-16 bottom-0 w-60 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col justify-between z-40">
        
        {/* Top: Branding logo */}
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span
              style={{ fontFamily: '"Noto Serif JP", serif', fontWeight: 900 }}
              className="text-base text-[var(--jade)]"
            >
              名人強
            </span>
            <span
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              className="text-xs uppercase font-bold tracking-wider text-[var(--text-primary)] flex items-center gap-1"
            >
              Admin <ShieldCheck className="h-3.5 w-3.5 text-[var(--jade)]" />
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5 font-light">
            System Control Panel
          </p>
        </div>

        {/* Middle Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-250 cursor-pointer ${
                  isActive
                    ? "bg-[var(--jade-glow)] text-[var(--jade)] border-l-2 border-[var(--jade)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-[var(--jade)]" : "text-[var(--text-muted)]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-[var(--border-subtle)] space-y-4 bg-[var(--bg-void)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--jade-glow)] border border-[var(--jade-border)] flex items-center justify-center font-display font-black text-sm text-[var(--jade)] select-none">
              名
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                Irham Najib
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate font-light">
                Developer/Admin
              </p>
            </div>
          </div>

          <button
            onClick={() => alert("Supabase auth logout simulated.")}
            className="w-full flex items-center justify-center gap-2 py-2 rounded border border-[var(--border-normal)] text-[var(--text-muted)] hover:text-[var(--maple)] hover:border-[var(--maple)] transition-all text-xs font-medium cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>

      </aside>

      {/* Main Content Area with 240px offset */}
      <main className="flex-1 ml-60 p-8 min-h-screen relative z-10 overflow-y-auto">
        {/* Shimmer background layout effect */}
        <div className="grid-bg absolute inset-0 opacity-[0.04] pointer-events-none z-0" />
        
        <div className="relative z-10 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
