"use client";
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project, ProjectCategory } from "@/lib/data";

// Custom Github Icon
function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const CATEGORY_ACCENT = {
  ai: "indigo",
  data: "indigo",
  web: "jade",
  mobile: "gold"
};

const CATEGORY_GRADIENTS = {
  ai: "bg-gradient-to-br from-[#080D14] to-[#0D1428]",
  data: "bg-gradient-to-br from-[#080D14] to-[#0D1428]",
  web: "bg-gradient-to-br from-[#080E0D] to-[#0D2018]",
  mobile: "bg-gradient-to-br from-[#140E08] to-[#201808]"
};

const CATEGORY_KANJI = {
  ai: "知能",
  data: "解析",
  web: "網面",
  mobile: "端末"
};

function formatYear(dateStr?: string) {
  if (!dateStr) return "2026";
  return new Date(dateStr).getFullYear().toString();
}

interface ProjectPageParticle {
  id: number
  size: number
  left: number
  top: number
  opacity: number
  yAnim: number
  xAnim: number
  duration: number
}

function ParticleNodes({ color, count = 8 }: { color: string; count?: number }) {
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<ProjectPageParticle[]>([])

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setParticles(
        Array.from({ length: count }).map((_, i) => ({
          id: i,
          size: Math.random() * 4 + 2,
          left: Math.random() * 90 + 5,
          top: Math.random() * 90 + 5,
          opacity: Math.random() * 0.3 + 0.1,
          yAnim: Math.random() * -40 - 20,
          xAnim: Math.random() * 30 - 15,
          duration: 5 + Math.random() * 5,
        }))
      )
      setMounted(true)
    })
    return () => cancelAnimationFrame(handle)
  }, [count])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: `var(--${color})`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            boxShadow: `0 0 8px var(--${color})`
          }}
          animate={{
            y: [0, p.yAnim, 0],
            x: [0, p.xAnim, 0],
            opacity: [0.15, 0.45, 0.15]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

function ComingSoonCard() {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--b1)] bg-[var(--surface)]/50 flex flex-col items-center justify-center p-10 min-h-[340px] text-center">
      {/* Radar animation */}
      <div className="relative w-16 h-16 mb-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-[var(--jade)]/20"
            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
            transition={{ duration: 2.5, delay: i * 0.7, repeat: Infinity }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-[var(--jade)]/40 shadow-[0_0_8px_var(--jade)]" />
        </div>
      </div>
      
      <p className="text-sm font-semibold text-[var(--text-2)] mb-1">More projects coming</p>
      <p className="text-xs text-[var(--text-3)] max-w-[200px]">
        Currently in development. Check back soon.
      </p>
    </div>
  );
}

function ProjectCardRegular({ project }: { project: Project }) {
  const accentColor = CATEGORY_ACCENT[project.category] || "jade";
  const gradientClass = CATEGORY_GRADIENTS[project.category] || "from-neutral-900 to-neutral-950";
  const kanjiLabel = CATEGORY_KANJI[project.category] || "作";

  return (
    <motion.div
      whileHover={{
        borderColor: `var(--${accentColor})`,
        y: -4,
        boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px var(--${accentColor}-glow)`
      }}
      className="group relative rounded-2xl border border-[var(--b1)] bg-[var(--surface)] overflow-hidden transition-all duration-300 h-full flex flex-col cursor-pointer"
    >
      {/* Sibling Link overlay for full card click without nesting inside <a> */}
      <Link 
        href={`/projects/${project.slug}`} 
        className="absolute inset-0 z-10"
        aria-label={project.name}
      />

      {/* Thumbnail */}
      <div className="relative h-52 overflow-hidden flex-shrink-0 z-0">
        <div className={`absolute inset-0 ${gradientClass}`} />
        
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[6rem] font-serif font-black opacity-[0.06] text-white select-none pointer-events-none">
            {kanjiLabel}
          </span>
        </div>
        
        <ParticleNodes color={accentColor} count={5} />
        
        {/* Badge */}
        <div className="absolute top-4 right-4 z-20">
          <span
            className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full border backdrop-blur-sm"
            style={{
              color: `var(--${accentColor})`,
              borderColor: `var(--${accentColor}-glow)`,
              background: `var(--${accentColor}-dim)`,
            }}
          >
            {project.category.toUpperCase()}
          </span>
        </div>
        
        {/* Hover scale */}
        <div className="absolute inset-0 bg-transparent group-hover:scale-105 transition-transform duration-500 ease-out z-10" />
      </div>
      
      {/* Body */}
      <div className="p-6 flex flex-col flex-1 relative z-20">
        <h3 className="text-xl font-cormorant font-semibold text-[var(--text-1)] mb-3 group-hover:text-[var(--jade)] transition-colors leading-tight">
          {project.name}
        </h3>
        
        <p className="text-sm text-[var(--text-2)] leading-relaxed mb-4 flex-1 line-clamp-2 font-light">
          {project.description}
        </p>
        
        {/* Tech tags — max 3 */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.tech_stack.slice(0, 3).map(tech => (
            <span key={tech} className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[var(--bg-raised)] border border-[var(--b1)] text-[var(--text-2)] uppercase">
              {tech}
            </span>
          ))}
          {project.tech_stack.length > 3 && (
            <span className="text-[10px] font-mono px-2 py-1 rounded-lg border border-[var(--b1)] text-[var(--text-3)]">
              +{project.tech_stack.length - 3}
            </span>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--b1)]">
          <span
            className="flex items-center gap-1.5 text-xs font-semibold group-hover:gap-2.5 transition-all duration-300 uppercase tracking-wider"
            style={{ color: `var(--${accentColor})` }}
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="relative z-30 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors p-1"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProjectCardFeatured({ project }: { project: Project }) {
  const accentColor = CATEGORY_ACCENT[project.category] || "jade";
  const gradientClass = CATEGORY_GRADIENTS[project.category] || "from-neutral-900 to-neutral-950";
  const kanjiLabel = CATEGORY_KANJI[project.category] || "作";

  return (
    <motion.div
      whileHover={{ borderColor: `var(--${accentColor})` }}
      className="group relative rounded-2xl border border-[var(--b1)] bg-[var(--surface)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(61,214,140,0.1)] cursor-pointer"
    >
      {/* Sibling Link overlay for full card click without nesting inside <a> */}
      <Link 
        href={`/projects/${project.slug}`} 
        className="absolute inset-0 z-10"
        aria-label={project.name}
      />

      <div className="flex flex-col lg:flex-row relative z-0">
        
        {/* THUMBNAIL */}
        <div className="relative lg:w-[45%] h-64 lg:h-auto overflow-hidden flex-shrink-0 min-h-[260px] z-0">
          <div className={`absolute inset-0 ${gradientClass}`} />
          
          {/* Kanji watermark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8rem] lg:text-[10rem] font-serif font-black opacity-[0.06] text-white select-none pointer-events-none">
              {kanjiLabel}
            </span>
          </div>
          
          <ParticleNodes color={accentColor} count={8} />
          
          {/* Scale effect */}
          <div className="absolute inset-0 bg-transparent group-hover:scale-[1.02] transition-transform duration-700 ease-out z-10" />
          
          {/* Bottom fade for mobile */}
          <div className="absolute bottom-0 left-0 right-0 h-20 lg:hidden bg-gradient-to-t from-[var(--surface)] to-transparent pointer-events-none" />
        </div>
        
        {/* CONTENT */}
        <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between relative z-20">
          <div>
            {/* Badge row */}
            <div className="flex items-center justify-between mb-6">
              <span
                className="text-[10px] font-mono font-bold tracking-widest px-3 py-1.5 rounded-full border uppercase"
                style={{
                  color: `var(--${accentColor})`,
                  borderColor: `var(--${accentColor}-glow)`,
                  background: `var(--${accentColor}-dim)`
                }}
              >
                {project.category.toUpperCase()} · FEATURED
              </span>
              <span className="text-xs font-mono text-[var(--text-3)] font-medium">
                {formatYear(project.created_at)}
              </span>
            </div>
            
            {/* Title */}
            <h2 className="text-3xl lg:text-4xl font-cormorant font-semibold text-[var(--text-1)] mb-4 leading-tight group-hover:text-[var(--jade)] transition-colors duration-300">
              {project.name}
            </h2>
            
            {/* Description */}
            <p className="text-[var(--text-2)] leading-relaxed text-sm lg:text-base mb-6 max-w-lg font-light">
              {project.long_description || project.description}
            </p>
            
            {/* Tech stack */}
            <div className="flex flex-wrap gap-1.5 mb-8">
              {project.tech_stack.map(tech => (
                <span key={tech} className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-[var(--bg-raised)] border border-[var(--b1)] text-[var(--text-2)] uppercase">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          
          {/* CTA row */}
          <div className="flex items-center justify-between pt-5 border-t border-[var(--b1)]">
            <span
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all duration-300"
              style={{ color: `var(--${accentColor})` }}
            >
              View Project Details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="relative z-30 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors p-1"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export function ProjectsPageClient({ projects, totalCount, aiCount, webCount, mobileCount }: {
  projects: Project[];
  totalCount: number;
  aiCount: number;
  webCount: number;
  mobileCount: number;
}) {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");

  const tabs: Array<{ id: ProjectCategory | "all"; label: string; color: string | null }> = [
    { id: "all", label: "All", color: null },
    { id: "ai", label: "AI & Data", color: "indigo" },
    { id: "web", label: "Web Fullstack", color: "jade" },
    { id: "mobile", label: "Mobile Apps", color: "gold" }
  ];

  const filtered = useMemo(() => {
    if (filter === "all") return projects;
    if (filter === "ai") {
      return projects.filter(p => p.category === "ai" || p.category === "data");
    }
    return projects.filter(p => p.category === filter);
  }, [filter, projects]);

  const { featured, regular } = useMemo(() => {
    return {
      featured: filtered.filter(p => p.is_featured),
      regular: filtered.filter(p => !p.is_featured)
    };
  }, [filtered]);

  return (
    <div className="relative min-h-screen bg-[var(--bg-void)]">
      
      {/* 1.1 Page Header */}
      <section className="relative pt-36 pb-20 overflow-hidden">
        
        {/* Background grid */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-deep)] via-transparent to-[var(--bg-void)] pointer-events-none" />
        
        {/* Kanji watermark — "作" */}
        <div className="absolute right-16 top-20 font-serif text-[18rem] font-black opacity-[0.025] text-[var(--jade)] select-none pointer-events-none leading-none hidden lg:block">
          作
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
          
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-mono text-[var(--jade)] tracking-[0.2em] mb-4 uppercase font-bold"
          >
            ARCHIVE · {new Date().getFullYear()}
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
            className="text-5xl lg:text-7xl font-light text-[var(--text-1)] mb-6 leading-[1.1] tracking-tight"
          >
            Project<br className="hidden lg:block" />
            <span className="italic text-[var(--text-2)]"> portfolio</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="text-sm md:text-base text-[var(--text-2)] max-w-lg leading-relaxed mb-10 font-light"
          >
            Engineering experiments, commercial builds, and AI systems.
            Each project is a step toward mastering the intersection of data and software.
          </motion.p>
          
          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-3 mb-10"
          >
            {[
              { label: "Total projects", value: totalCount, color: "text-[var(--text-1)]" },
              { label: "AI & Data", value: aiCount, color: "text-[var(--indigo)]" },
              { label: "Web", value: webCount, color: "text-[var(--jade)]" },
              { label: "Mobile", value: mobileCount, color: "text-[var(--gold)]" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--b1)] bg-[var(--surface)]">
                <span className={`text-xs font-mono font-bold ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-3)] uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </motion.div>
          
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2.5">
            {tabs.map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`
                    relative px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider
                    transition-all duration-300 border cursor-pointer select-none
                    ${active
                      ? tab.color
                        ? `border-[var(--${tab.color})] bg-[var(--${tab.color}-dim)] text-[var(--${tab.color})]`
                        : "border-[var(--jade)] bg-[var(--jade)] text-[var(--bg-void)] font-bold"
                      : "border-[var(--b1)] text-[var(--text-2)] hover:border-[var(--b2)] hover:text-[var(--text-1)] bg-transparent"
                    }
                  `}
                >
                  {/* Animated background untuk active state */}
                  {active && (
                    <motion.span
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-full z-0 pointer-events-none"
                      style={{
                        background: tab.color
                          ? `var(--${tab.color}-dim)`
                          : "var(--jade)",
                        border: `1px solid ${tab.color ? `var(--${tab.color})` : "var(--jade)"}`
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
          
        </div>
      </section>

      {/* 1.3 Projects Grid */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pb-24 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Featured projects — full width di desktop */}
            {featured.map((project, i) => (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <ProjectCardFeatured project={project} />
              </motion.div>
            ))}
            
            {/* Regular projects — 2 kolom grid */}
            {regular.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {regular.map((project, i) => (
                  <motion.div
                    key={project.slug}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: featured.length * 0.1 + i * 0.1 }}
                  >
                    <ProjectCardRegular project={project} />
                  </motion.div>
                ))}
                
                {/* Coming soon slot jika jumlah regular ganjil */}
                {regular.length % 2 !== 0 && (
                  <ComingSoonCard />
                )}
              </div>
            )}
            
            {/* If empty */}
            {featured.length === 0 && regular.length === 0 && (
              <div className="py-24 text-center text-[var(--text-3)] font-mono text-sm">
                No matching projects in archive.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
