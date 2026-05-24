"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useTransform } from "framer-motion";
import { useScrollContext } from "@/components/providers/ScrollProvider";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, CheckSquare, Calendar } from "lucide-react";
import type { Project } from "@/lib/data";

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

interface ProjectDetailClientProps {
  project: Project;
  nextProject: Project;
}

const CATEGORY_COLORS = {
  ai: "maple",
  data: "indigo",
  web: "jade",
  mobile: "gold"
};

const CATEGORY_GRADIENTS = {
  ai: "bg-gradient-to-br from-[#140808] to-[#281414]",
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

function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md cursor-zoom-out"
      onClick={onClose}
    >
      {/* Top Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white text-3xl font-light cursor-pointer select-none transition-colors"
      >
        &times;
      </button>

      {/* Prev Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-6 text-white/50 hover:text-white text-4xl font-light cursor-pointer select-none transition-colors p-4"
      >
        &#8249;
      </button>

      <motion.img
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        src={images[currentIndex]}
        alt="Enlarged screenshot"
        className="max-w-[85vw] max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-6 text-white/50 hover:text-white text-4xl font-light cursor-pointer select-none transition-colors p-4"
      >
        &#8250;
      </button>
    </motion.div>
  );
}

export function ProjectDetailClient({ project, nextProject }: ProjectDetailClientProps) {
  const { scrollY } = useScrollContext();
  const y = useTransform(scrollY, [0, 500], [0, 150]); // parallax shift
  const opacity = useTransform(scrollY, [0, 400], [1, 0]); // fade hero on scroll

  // Lightbox index state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Dynamic aesthetic fallback data
  const screenshots = (project as any).screenshots || [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=600&auto=format&fit=crop"
  ];

  const features = (project as any).features || [
    "Integrated state-of-the-art interactive graphics with responsive real-time states.",
    "Formulated following modern robust code standards and performance benchmarks.",
    "Engineered with clean architectural separation and reliable localized fallbacks."
  ];

  const categoryColor = CATEGORY_COLORS[project.category] || "jade";
  const bgGradient = CATEGORY_GRADIENTS[project.category] || "from-neutral-900 to-neutral-950";
  const kanjiWatermark = CATEGORY_KANJI[project.category] || "作";

  const handlePrev = () => {
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + screenshots.length) % screenshots.length : null));
  };

  const handleNext = () => {
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % screenshots.length : null));
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)]">
      
      {/* 4.1 Project Hero — Immersive with Parallax & Fade */}
      <section className="relative h-[70vh] overflow-hidden flex items-end pb-16">
        <motion.div 
          style={{ y }} 
          className={`absolute inset-0 w-full h-full bg-gradient-to-br ${bgGradient} z-0`}
        >
          {/* Subtle Gridlines overlay */}
          <div 
            className="absolute inset-0 opacity-[0.06] pointer-events-none" 
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "32px 32px"
            }}
          />

          {/* Large Kanji watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              style={{ fontFamily: '"Noto Serif JP", serif', fontWeight: 900 }}
              className="text-[clamp(12rem,30vw,24rem)] font-black opacity-[0.04] text-white select-none leading-none pointer-events-none"
            >
              {kanjiWatermark}
            </span>
          </div>

          {/* Floating animated ambient light points */}
          <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-[0.12] animate-pulse" style={{ backgroundColor: `var(--${categoryColor})` }} />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-[0.08] animate-pulse" style={{ backgroundColor: `var(--${categoryColor})` }} />
        </motion.div>

        {/* Gradient overlay bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--bg-deep)] to-transparent pointer-events-none z-0" />

        {/* Content */}
        <motion.div 
          style={{ opacity }} 
          className="relative z-10 mx-auto max-w-6xl w-full px-6 md:px-12 pb-6"
        >
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-2.5 text-xs font-mono uppercase tracking-wider text-[var(--text-2)] hover:text-[var(--jade)] transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
              All Projects
            </Link>
          </motion.div>

          {/* Category badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <span
              className="text-[10px] font-mono font-bold tracking-widest px-3 py-1.5 rounded-full border uppercase"
              style={{
                color: `var(--${categoryColor})`,
                borderColor: `var(--${categoryColor}-glow)`,
                background: `var(--${categoryColor}-dim)`
              }}
            >
              {project.category}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ fontFamily: '"Cormorant Garamond", serif', letterSpacing: "-0.02em" }}
            className="text-5xl md:text-6xl font-light text-[var(--text-1)] filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] leading-tight max-w-4xl"
          >
            {project.name}
          </motion.h1>

          {/* Core Stack Badges row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mt-6"
          >
            {project.tech_stack.map((tech) => (
              <span 
                key={tech} 
                className="text-[11px] font-mono px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[var(--text-2)]"
              >
                {tech}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* 4.2 Project Content — Two Column Grid */}
      <section className="relative px-6 md:px-12 py-16 max-w-6xl mx-auto z-10 border-t border-[var(--b1)]">
        <div className="grid gap-16 lg:grid-cols-[1.8fr_1fr]">
          
          {/* Main content col */}
          <div className="space-y-12">
            {/* Description Section */}
            <div className="space-y-4">
              <h2 className="text-[10px] font-mono text-[var(--jade)] tracking-widest uppercase font-bold">
                Overview
              </h2>
              <p className="text-base md:text-lg text-[var(--text-2)] leading-relaxed font-light">
                {project.long_description || project.description}
              </p>
            </div>

            {/* Screenshots Gallery Section */}
            <div className="space-y-6">
              <h2 className="text-[10px] font-mono text-[var(--jade)] tracking-widest uppercase font-bold">
                Screenshots Captures
              </h2>

              {/* Large Featured Capture */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative rounded-2xl overflow-hidden border border-[var(--b1)] cursor-zoom-in group shadow-lg"
                onClick={() => setLightboxIndex(0)}
              >
                <img
                  src={screenshots[0]}
                  alt={`${project.name} featured capture`}
                  className="w-full h-auto aspect-video object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/60 bg-black/40 px-2.5 py-1 rounded backdrop-blur">
                  Click to enlarge view
                </div>
              </motion.div>

              {/* Thumbnails grid */}
              {screenshots.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {screenshots.slice(1).map((src: string, idx: number) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.03, borderColor: "var(--jade)" }}
                      className="rounded-xl overflow-hidden border border-[var(--b1)] cursor-zoom-in shadow-md aspect-video relative group transition-colors duration-300"
                      onClick={() => setLightboxIndex(idx + 1)}
                    >
                      <img 
                        src={src} 
                        alt={`${project.name} thumbnail ${idx + 2}`} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Key Features Section */}
            <div className="space-y-6">
              <h2 className="text-[10px] font-mono text-[var(--jade)] tracking-widest uppercase font-bold">
                Key Features
              </h2>
              <div className="space-y-3.5">
                {features.map((feature: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex gap-3 items-start"
                  >
                    <span className="text-[var(--jade)] mt-0.5 flex-shrink-0 select-none">◆</span>
                    <p className="text-sm md:text-base text-[var(--text-2)] font-light leading-relaxed">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Metadata Sidebar Column */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-[var(--b1)] bg-[var(--surface)] p-6 space-y-6 shadow-md">
              <div className="border-b border-[var(--b1)] pb-3">
                <h3 
                  style={{ fontFamily: '"Cormorant Garamond", serif' }}
                  className="text-2xl font-semibold text-[var(--text-1)]"
                >
                  Project Details
                </h3>
              </div>

              {/* Category Info */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-[var(--text-3)] tracking-widest uppercase font-bold">Category</span>
                <div>
                  <span
                    className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full border uppercase inline-block"
                    style={{
                      color: `var(--${categoryColor})`,
                      borderColor: `var(--${categoryColor}-glow)`,
                      background: `var(--${categoryColor}-dim)`
                    }}
                  >
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Core stack grouped */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-[var(--text-3)] tracking-widest uppercase font-bold flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5" /> Grouped Tech Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech_stack.map((tech) => (
                    <span 
                      key={tech}
                      style={{
                        backgroundColor: `var(--${categoryColor}-dim)`,
                        borderColor: `var(--${categoryColor}-glow)`,
                        color: `var(--${categoryColor})`
                      }}
                      className="text-[11px] px-2.5 py-0.5 rounded border font-medium uppercase font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Created At Date */}
              {project.created_at && (
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-[var(--text-3)] tracking-widest uppercase font-bold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Deployed Date
                  </span>
                  <p className="text-xs font-mono text-[var(--text-2)] uppercase">
                    {new Date(project.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                  </p>
                </div>
              )}

              {/* CTA buttons block */}
              <div className="pt-4 border-t border-[var(--b1)] space-y-2.5">
                {project.demo_url && (
                  <motion.a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--jade)] hover:bg-[#5ae6b5] text-[var(--void)] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" /> Live Deployment
                  </motion.a>
                )}

                {project.github_url && (
                  <motion.a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 w-full py-3 border border-[var(--border-normal)] hover:border-[var(--b3)] bg-transparent text-[var(--text-primary)] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    <GithubIcon className="w-4 h-4" /> Source Repository
                  </motion.a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.3 Next Project Teaser — Vertical Bottom Segment */}
      <section className="border-t border-[var(--b1)] relative z-10 bg-[var(--bg-void)]">
        <Link href={`/projects/${nextProject.slug}`}>
          <motion.div
            whileHover={{ backgroundColor: "rgba(255,255,255,0.015)" }}
            className="px-6 md:px-12 py-16 flex items-center justify-between transition-colors cursor-pointer group max-w-6xl mx-auto"
          >
            <div>
              <p className="text-[10px] font-mono text-[var(--text-3)] tracking-widest uppercase mb-2">
                Next Project Exhibit
              </p>
              <h3 
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
                className="text-3xl md:text-4xl font-light text-[var(--text-1)] group-hover:text-[var(--jade)] transition-colors leading-tight"
              >
                {nextProject.name}
              </h3>
            </div>
            <motion.div
              className="w-12 h-12 rounded-full border border-[var(--b2)] flex items-center justify-center group-hover:border-[var(--jade)] group-hover:bg-[var(--jade-dim)] transition-all flex-shrink-0"
              whileHover={{ x: 6 }}
            >
              <ArrowRight className="w-5 h-5 text-[var(--text-2)] group-hover:text-[var(--jade)] transition-colors" />
            </motion.div>
          </motion.div>
        </Link>
      </section>

      {/* Fullscreen interactive image Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={screenshots}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
