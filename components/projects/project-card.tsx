"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/data";

interface ProjectCardProps {
  project: Project;
}

// Custom simple inline SVG icons for technologies (white, opacity 0.5)
function getTechIcon(tech: string) {
  const name = tech.toLowerCase();
  if (name.includes("python")) {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
        <path d="M11.93 2.01c-2.45 0-4.46.22-4.46 2.3v1.85h4.52v.63H5.08c-2.09 0-3.07 1.09-3.07 3.32v2.79c0 1.95.89 3.01 2.5 3.19v-1.74c0-1.89 1.4-3.19 3.25-3.19h4.37c1.78 0 3.2-1.39 3.2-3.2V4.54c0-1.95-1.42-2.53-3.4-2.53zm-2.43 1.34c.41 0 .74.33.74.74 0 .41-.33.74-.74.74s-.74-.33-.74-.74c0-.41.33-.74.74-.74zm7.42 6.6c-1.83 0-3.25 1.3-3.25 3.19v1.74c0 1.9-1.4 3.19-3.25 3.19H6.07c-1.78 0-3.2 1.39-3.2 3.2v3.37c0 1.95 1.42 2.53 3.4 2.53 2.45 0 4.46-.22 4.46-2.3v-1.85h-4.52v-.63h6.91c2.09 0 3.07-1.09 3.07-3.32v-2.79c0-1.95-.89-3.01-2.5-3.19v1.74c0 1.89-1.4 3.19-3.25 3.19h-4.37c-1.78 0-3.2 1.39-3.2 3.2v3.08c0 1.95 1.42 2.53 3.4 2.53s3.4-.58 3.4-2.53v-3.37c0-1.78 1.42-3.2 3.2-3.2h3.9c1.94 0 2.52-1.42 2.52-3.4v-4.52c0-1.94-1.12-3.07-3.37-3.07zm-1.47 9.87c.41 0 .74.33.74.74 0 .41-.33.74-.74.74s-.74-.33-.74-.74c.01-.41.34-.74.74-.74z"/>
      </svg>
    );
  }
  if (name.includes("kotlin")) {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
        <path d="M1.5 22.5v-21h21l-10.5 10.5 10.5 10.5z" />
      </svg>
    );
  }
  if (name.includes("next")) {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6-6v6" />
      </svg>
    );
  }
  if (name.includes("react")) {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6">
        <ellipse rx="10" ry="4.5" transform="rotate(0)" cx="12" cy="12" />
        <ellipse rx="10" ry="4.5" transform="rotate(60 12 12)" cx="12" cy="12" />
        <ellipse rx="10" ry="4.5" transform="rotate(120 12 12)" cx="12" cy="12" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    );
  }
  if (name.includes("laravel")) {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
        <path d="M5.4 20.4l8.3-4.8V6.1l-8.3 4.8v9.5zm9.5-12l3.7-2.1V2.1l-3.7 2.1v4.2zm-1.2-4.1l3.7-2.1V.1l-3.7 2.1v4.2zM2.9 8.2l8.3-4.8V.1L2.9 4.9v3.3zm0 4.1l8.3-4.8V4.2L2.9 9v3.3zm0 4.1l8.3-4.8V8.3L2.9 13.1v3.3zM21.1 22v-3.7l-2.9-1.7v3.7l2.9 1.7zm-4.1-2.4v-3.7l-2.9-1.7v3.7l2.9 1.7zm1.2 5.5l2.9-1.7V17l-2.9 1.7v6.9zm-4.1-2.4l2.9-1.7V12.8l-2.9 1.7v6.9z"/>
      </svg>
    );
  }
  // Default code gear icon
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" opacity="0.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

// Category Specific Interactive Vector Backgrounds
function CategoryGraphics({ category }: { category: string }) {
  const cat = category.toLowerCase();
  
  if (cat === "ai" || cat === "data") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* Background gradient from the design spec */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#080D14] via-[#0D1428] to-[#0A1420] transition-transform duration-700 group-hover:scale-105" />
        
        {/* Animated Particle Network */}
        <svg className="absolute inset-0 w-full h-full text-[var(--indigo)] opacity-[0.25]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.circle cx="20" cy="30" r="1.5" fill="currentColor" animate={{ y: [30, 25, 30] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} />
          <motion.circle cx="50" cy="20" r="1.5" fill="currentColor" animate={{ y: [20, 24, 20] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} />
          <motion.circle cx="80" cy="40" r="1.5" fill="currentColor" animate={{ y: [40, 35, 40] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} />
          <motion.circle cx="40" cy="70" r="1.5" fill="currentColor" animate={{ x: [40, 44, 40] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} />
          <motion.circle cx="70" cy="75" r="1.5" fill="currentColor" animate={{ y: [75, 78, 75] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} />
          
          <line x1="20" y1="30" x2="50" y2="20" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 2" />
          <line x1="50" y1="20" x2="80" y2="40" stroke="currentColor" strokeWidth="0.25" />
          <line x1="20" y1="30" x2="40" y2="70" stroke="currentColor" strokeWidth="0.25" />
          <line x1="40" y1="70" x2="70" y2="75" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 2" />
          <line x1="80" y1="40" x2="70" y2="75" stroke="currentColor" strokeWidth="0.25" />
        </svg>
        {/* Glow bottom edge inward */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(129,140,248,0.15)] to-transparent" />
      </div>
    );
  }

  if (cat === "web") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* Background gradient from the design spec */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#080E0D] via-[#0D2018] to-[#0A1A14] transition-transform duration-700 group-hover:scale-105" />
        
        {/* CSS grid animation (drawing lines smoothly) */}
        <svg className="absolute inset-0 w-full h-full text-[var(--jade)] opacity-[0.2]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="cardGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.25" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cardGrid)" />
          {/* Laser scanning bar */}
          <motion.line 
            x1="0" y1="0" x2="100" y2="0" 
            stroke="currentColor" strokeWidth="0.5" 
            animate={{ y: [0, 100, 0] }} 
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }} 
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(61,214,140,0.15)] to-transparent" />
      </div>
    );
  }

  // Mobile
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background gradient from the design spec */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#140E08] via-[#201808] to-[#1A1408] transition-transform duration-700 group-hover:scale-105" />
      
      {/* Outline phone frame SVG */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-14 h-14 text-[var(--gold)] opacity-[0.25]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <motion.rect 
            x="5" y="2" width="14" height="20" rx="2" 
            animate={{ y: [0, -3, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
          />
          <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
          <motion.path d="M8 6h8" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} />
          <motion.path d="M10 10h4" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} />
        </svg>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(245,158,11,0.15)] to-transparent" />
    </div>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 3D Tilt States
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const category = project.category.toLowerCase();
  
  // Category specific styles
  let badgeLabel = "";
  let accentColor = "";
  let badgeColorClass = "";
  let techPillClass = "";
  let giantText = "";

  if (category === "ai" || category === "data") {
    badgeLabel = "AI / Data";
    accentColor = "var(--indigo)";
    badgeColorClass = "bg-[var(--indigo-dim)] border-[rgba(129,140,248,0.3)] text-[var(--indigo)]";
    techPillClass = "bg-[var(--indigo-dim)] border-[rgba(129,140,248,0.15)] text-[var(--indigo)]";
    giantText = "AI";
  } else if (category === "web") {
    badgeLabel = "Web Fullstack";
    accentColor = "var(--jade)";
    badgeColorClass = "bg-[var(--jade-dim)] border-[var(--jade-glow)] text-[var(--jade)]";
    techPillClass = "bg-[var(--jade-dim)] border-[rgba(61,214,140,0.15)] text-[var(--jade)]";
    giantText = "WEB";
  } else {
    badgeLabel = "Mobile Dev";
    accentColor = "var(--gold)";
    badgeColorClass = "bg-[var(--gold-dim)] border-[rgba(245,158,11,0.3)] text-[var(--gold)]";
    techPillClass = "bg-[var(--gold-dim)] border-[rgba(245,158,11,0.15)] text-[var(--gold)]";
    giantText = "MBL";
  }

  // Mouse move handler for 3D Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    const degX = -(mouseY / (height / 2)) * 5;
    const degY = (mouseX / (width / 2)) * 5;
    
    setRotateX(degX);
    setRotateY(degY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="rounded-2xl bg-[var(--surface)] border border-[var(--b1)] overflow-hidden cursor-pointer group transition-shadow duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
      style={{
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: rotateX === 0 && rotateY === 0 ? "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s, box-shadow 0.3s" : "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      <Link href={`/projects/${project.slug}`} className="block w-full">
        {/* THUMBNAIL (Height: 220px) */}
        <div className="relative h-[220px] w-full overflow-hidden border-b border-[var(--b1)]">
          {/* Dynamic Vector Background per Category */}
          <CategoryGraphics category={project.category} />

          {/* Huge Faded Background Kanji/Text */}
          <span 
            style={{ fontFamily: '"Noto Serif JP", serif', fontWeight: 900 }}
            className="absolute left-6 bottom-1 text-[7.5rem] text-white opacity-[0.035] select-none pointer-events-none leading-none"
          >
            {giantText}
          </span>

          {/* Top-Right Badge */}
          <span className={`absolute top-4 right-4 text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-full border ${badgeColorClass}`}>
            {badgeLabel}
          </span>

          {/* Tech Stack Icons (bottom-left) */}
          <div className="absolute bottom-4 left-6 flex items-center gap-2 relative z-10">
            {project.tech_stack.slice(0, 4).map((tech, i) => (
              <div 
                key={i} 
                className="w-6 h-6 rounded-md bg-black/40 border border-white/10 flex items-center justify-center text-white/70"
                title={tech}
              >
                {getTechIcon(tech)}
              </div>
            ))}
            {project.tech_stack.length > 4 && (
              <span className="text-[10px] font-semibold text-white/50 font-mono">
                +{project.tech_stack.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* CARD BODY (padding 20px 24px) */}
        <div className="p-[20px_24px] flex flex-col justify-between min-h-[170px]">
          <div>
            {/* Title */}
            <h3
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
              className="text-[20px] font-semibold text-[var(--text-1)] group-hover:text-[var(--jade)] transition-colors leading-tight"
            >
              {project.name}
            </h3>

            {/* Description */}
            <p className="mt-2.5 text-[13px] font-light text-[var(--text-2)] leading-relaxed line-clamp-2 min-h-[38px]">
              {project.description}
            </p>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-[var(--b1)] my-3.5" />

          {/* Card Footer */}
          <div className="flex items-center justify-between">
            {/* Tech Tags (Max 3) */}
            <div className="flex gap-1.5 flex-wrap">
              {project.tech_stack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${techPillClass}`}
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Go arrow */}
            <span 
              className="text-[var(--text-3)] group-hover:text-white transition-colors p-1"
              style={{ color: accentColor }}
            >
              <ArrowUpRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
