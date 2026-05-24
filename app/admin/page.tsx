import { getProjects } from "@/lib/projects";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { seedProjects, approvedGuestbookFallback } from "@/lib/data";
import { 
  FolderGit, 
  MessageSquareOff, 
  History, 
  Zap, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const projects = await getProjects();
  const allProjects = projects.length ? projects : seedProjects;

  // Calculate project breakdown
  const aiCount = allProjects.filter((p) => p.category === "ai" || p.category === "data").length;
  const webCount = allProjects.filter((p) => p.category === "web").length;
  const mobileCount = allProjects.filter((p) => p.category === "mobile").length;

  // Retrieve pending guestbook count
  const supabase = getSupabaseAdmin();
  let pendingCount = 0;
  if (supabase) {
    const { data } = await supabase.from("guestbook").select("*").eq("is_approved", false);
    pendingCount = data?.length || 0;
  } else {
    // If Supabase is not configured, simulate some pending messages
    pendingCount = 1;
  }

  const statCards = [
    {
      title: "Total Projects",
      value: allProjects.length.toString(),
      icon: FolderGit,
      desc: `${aiCount} AI/Data · ${webCount} Web · ${mobileCount} Mobile`,
      badge: "Active",
      badgeColor: "bg-[var(--jade-glow)] text-[var(--jade)] border-[var(--jade-border)]",
    },
    {
      title: "Pending Moderation",
      value: pendingCount.toString(),
      icon: MessageSquareOff,
      desc: pendingCount > 0 ? "Requires review before public display" : "All messages verified",
      badge: pendingCount > 0 ? "Action Required" : "Up to date",
      badgeColor: pendingCount > 0 
        ? "bg-[rgba(232,93,60,0.15)] text-[var(--maple)] border-[rgba(232,93,60,0.2)]" 
        : "bg-[var(--jade-glow)] text-[var(--jade)] border-[var(--jade-border)]",
    },
    {
      title: "Deployment Status",
      value: "Vercel",
      icon: History,
      desc: `Last compiled: May 23, 2026`,
      badge: "Healthy",
      badgeColor: "bg-[var(--jade-glow)] text-[var(--jade)] border-[var(--jade-border)]",
    },
    {
      title: "Quick Actions",
      value: "Control",
      icon: Zap,
      desc: "Trigger system indexing or flush cache storage",
      badge: "Ready",
      badgeColor: "bg-[var(--gold-glow)] text-[var(--gold)] border-[rgba(232,184,75,0.2)]",
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
          className="text-4xl font-light text-[var(--text-primary)]"
        >
          Overview Console
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1.5 font-light">
          Real-time summary of the portfolio data states and moderation endpoints.
        </p>
      </div>

      {/* Grid of 2x2 Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className="rounded-xl border border-[var(--border-normal)] bg-[var(--bg-surface)] p-6 flex flex-col justify-between min-h-[160px] shadow-sm relative group hover:border-[var(--jade-border)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                    {stat.title}
                  </span>
                  
                  <div className="flex items-baseline gap-2 mt-2">
                    <span 
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                      className="text-4xl font-bold text-[var(--text-primary)]"
                    >
                      {stat.value}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border font-semibold ${stat.badgeColor}`}>
                      {stat.badge}
                    </span>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-subtle)]">
                  <Icon className="h-6 w-6 text-[var(--jade)]" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>{stat.desc}</span>
                {idx === 3 ? (
                  <Link 
                    href="/admin/site-config"
                    className="text-[var(--jade)] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    Configure <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick shortcuts block */}
      <div className="rounded-xl border border-[var(--border-normal)] bg-[var(--bg-surface)] p-6 space-y-4">
        <h3 
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
          className="text-2xl font-light text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2"
        >
          Administrative Shortcuts
        </h3>
        
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/admin/projects"
            className="flex items-center justify-between px-4 py-3 rounded bg-[var(--bg-raised)] border border-[var(--border-subtle)] hover:border-[var(--jade-border)] text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:text-[var(--jade)] transition-colors"
          >
            <span>Manage Project CRUD</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/admin/guestbook"
            className="flex items-center justify-between px-4 py-3 rounded bg-[var(--bg-raised)] border border-[var(--border-subtle)] hover:border-[var(--jade-border)] text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:text-[var(--jade)] transition-colors"
          >
            <span>Review Guestbook ({pendingCount})</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/admin/site-config"
            className="flex items-center justify-between px-4 py-3 rounded bg-[var(--bg-raised)] border border-[var(--border-subtle)] hover:border-[var(--jade-border)] text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:text-[var(--jade)] transition-colors"
          >
            <span>Global Profile Setup</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
