"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/data";

interface ArchiveProjectCardProps {
  project: Project;
  isLarge?: boolean;
}

export function ArchiveProjectCard({ project, isLarge = false }: ArchiveProjectCardProps) {
  let gradientClass = "";
  let kanjiLabel = "";
  let badgeColorClass = "";
  let techPillClass = "";

  const category = project.category.toLowerCase();

  if (category === "ai" || category === "data") {
    gradientClass = "from-[#0D1F1A] to-[#1A3D30]";
    kanjiLabel = "知能";
    badgeColorClass = "bg-[var(--maple-dim)] text-[var(--maple)] border-[rgba(232,93,60,0.2)]";
    techPillClass = "bg-[var(--maple-dim)] text-[var(--maple)] border-[rgba(232,93,60,0.1)]";
  } else if (category === "web") {
    gradientClass = "from-[#0D0F1F] to-[#1A1D3D]";
    kanjiLabel = "網面";
    badgeColorClass = "bg-[var(--jade-glow)] text-[var(--jade)] border-[var(--jade-border)]";
    techPillClass = "bg-[var(--jade-glow)] text-[var(--jade)] border-[rgba(78,203,160,0.15)]";
  } else {
    gradientClass = "from-[#1F1A0D] to-[#3D3019]";
    kanjiLabel = "端末";
    badgeColorClass = "bg-[var(--gold-glow)] text-[var(--gold)] border-[rgba(232,184,75,0.2)]";
    techPillClass = "bg-[var(--gold-glow)] text-[var(--gold)] border-[rgba(232,184,75,0.1)]";
  }

  return (
    <motion.div
      layout
      className={`relative group rounded-xl bg-[var(--bg-surface)] border border-[var(--border-normal)] overflow-hidden transition-all duration-300 hover:border-[var(--jade)] hover:shadow-[0_0_20px_var(--jade-glow)] ${
        isLarge ? "md:col-span-2" : "col-span-1"
      }`}
    >
      {/* Thumbnail Area - 240px Height */}
      <div className="relative h-60 w-full overflow-hidden border-b border-[var(--border-normal)]">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} transition-transform duration-500 group-hover:scale-105`} />

        {/* Dynamic Category SVG Graphics */}
        {(category === "ai" || category === "data") && (
          <svg className="absolute inset-0 w-full h-full text-[var(--maple)] opacity-[0.18] pointer-events-none" viewBox="0 0 100 100">
            <circle cx="20" cy="30" r="1.5" fill="currentColor" />
            <circle cx="50" cy="20" r="1.5" fill="currentColor" />
            <circle cx="80" cy="40" r="1.5" fill="currentColor" />
            <circle cx="40" cy="70" r="1.5" fill="currentColor" />
            <circle cx="70" cy="75" r="1.5" fill="currentColor" />
            <line x1="20" y1="30" x2="50" y2="20" stroke="currentColor" strokeWidth="0.3" />
            <line x1="50" y1="20" x2="80" y2="40" stroke="currentColor" strokeWidth="0.3" />
            <line x1="20" y1="30" x2="40" y2="70" stroke="currentColor" strokeWidth="0.3" />
            <line x1="40" y1="70" x2="70" y2="75" stroke="currentColor" strokeWidth="0.3" />
            <line x1="80" y1="40" x2="70" y2="75" stroke="currentColor" strokeWidth="0.3" />
          </svg>
        )}
        {category === "web" && (
          <div className="grid-bg absolute inset-0 opacity-[0.2] pointer-events-none" />
        )}
        {category === "mobile" && (
          <svg className="absolute inset-0 w-full h-full text-[var(--gold)] opacity-[0.18] pointer-events-none" viewBox="0 0 100 100">
            <rect x="35" y="15" width="30" height="70" rx="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="48" y1="80" x2="52" y2="80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}

        {/* Faded Giant Kanji Label */}
        <span
          style={{ fontFamily: '"Noto Serif JP", serif', fontWeight: 900 }}
          className="absolute left-6 bottom-4 text-8xl text-white opacity-[0.06] select-none pointer-events-none"
        >
          {kanjiLabel}
        </span>

        {/* Category Pill Tag */}
        <span className={`absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${badgeColorClass}`}>
          {project.category}
        </span>
      </div>

      {/* Card Contents */}
      <div className="p-6 flex flex-col justify-between h-[220px]">
        <div>
          <h3
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
            className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--jade)]"
          >
            {project.name}
          </h3>

          <p className="mt-2 text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Technology Pills */}
        <div className="flex flex-wrap gap-2 overflow-hidden my-3">
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              className={`text-[10px] md:text-xs px-2.5 py-0.5 rounded border font-medium ${techPillClass}`}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Bottom Link Actions */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <Link
            href={`/projects/${project.slug}`}
            className="text-xs md:text-sm font-semibold text-[var(--jade)] hover:underline flex items-center gap-1 group-hover:text-[#5ae6b5]"
          >
            View Project Details <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
              aria-label="GitHub Repository"
            >
              <svg
                className="h-5 w-5"
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
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
