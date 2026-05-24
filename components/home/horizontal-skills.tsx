"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { BrainCircuit, Cpu, Globe, Smartphone } from "lucide-react";

interface SkillItem {
  name: string;
  level: "ADVANCED" | "INTERMEDIATE";
  icon: string;
  devicon: string | null;
}

interface SkillCategory {
  id: string;
  label: string;
  exp: string;
  color: string;
  bgGradient: string;
  icon: React.ReactNode;
  skills: SkillItem[];
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "ai",
    label: "AI Agents & RAG Pipelines",
    exp: "2+ YEARS EXP",
    color: "indigo",
    bgGradient: "from-[#080D14] to-[#0D1428]",
    icon: <BrainCircuit className="w-6 h-6" />,
    skills: [
      { name: "Python", level: "ADVANCED", icon: "🐍", devicon: "python" },
      { name: "LangChain", level: "INTERMEDIATE", icon: "⛓️", devicon: null },
      { name: "Gemini APIs", level: "ADVANCED", icon: "♊", devicon: null },
      { name: "Pinecone", level: "INTERMEDIATE", icon: "🌲", devicon: null },
      { name: "FastAPI", level: "ADVANCED", icon: "⚡", devicon: "fastapi" }
    ]
  },
  {
    id: "ml",
    label: "On-Device Deep Learning",
    exp: "1+ YEARS EXP",
    color: "maple",
    bgGradient: "from-[#140808] to-[#281414]",
    icon: <Cpu className="w-6 h-6" />,
    skills: [
      { name: "TensorFlow Lite", level: "INTERMEDIATE", icon: "🧠", devicon: "tensorflow" },
      { name: "MediaPipe", level: "ADVANCED", icon: "👁️", devicon: null },
      { name: "Computer Vision", level: "INTERMEDIATE", icon: "📷", devicon: null },
      { name: "MobileNetV3", level: "INTERMEDIATE", icon: "📱", devicon: null }
    ]
  },
  {
    id: "web",
    label: "Web Interfaces & Frameworks",
    exp: "3+ YEARS EXP",
    color: "jade",
    bgGradient: "from-[#080E0D] to-[#0D2018]",
    icon: <Globe className="w-6 h-6" />,
    skills: [
      { name: "Next.js / React", level: "ADVANCED", icon: "⚛️", devicon: "nextjs" },
      { name: "TypeScript", level: "INTERMEDIATE", icon: "📘", devicon: "typescript" },
      { name: "Laravel", level: "ADVANCED", icon: "🔴", devicon: "laravel" },
      { name: "TailwindCSS", level: "ADVANCED", icon: "🎨", devicon: "tailwindcss" },
      { name: "Gin Gonic", level: "INTERMEDIATE", icon: "🐹", devicon: "go" }
    ]
  },
  {
    id: "mobile",
    label: "Mobile Architecture",
    exp: "2+ YEARS EXP",
    color: "gold",
    bgGradient: "from-[#140E08] to-[#201808]",
    icon: <Smartphone className="w-6 h-6" />,
    skills: [
      { name: "Kotlin", level: "ADVANCED", icon: "🎯", devicon: "kotlin" },
      { name: "Jetpack Compose", level: "ADVANCED", icon: "🎨", devicon: "jetpackcompose" },
      { name: "Android Architecture", level: "INTERMEDIATE", icon: "🏗️", devicon: "android" },
      { name: "Room Database", level: "INTERMEDIATE", icon: "🗄️", devicon: null },
      { name: "WorkManager", level: "INTERMEDIATE", icon: "⚙️", devicon: null }
    ]
  }
];

function ProgressIndicatorItem({ i, smoothProgress, length }: { i: number; smoothProgress: any; length: number }) {
  const scaleX = useTransform(
    smoothProgress,
    [i / length, (i + 1) / length],
    [0, 1]
  );
  return (
    <div className="h-0.5 w-10 rounded-full bg-[var(--surface)] overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-[var(--jade)]"
        style={{
          scaleX,
          transformOrigin: "left"
        }}
      />
    </div>
  );
}

function SkillCardMobile({ category, index }: { category: SkillCategory; index: number }) {
  return (
    <div
      className={`
        relative w-full h-[480px]
        rounded-2xl overflow-hidden
        border border-[var(--b1)]
        bg-gradient-to-br ${category.bgGradient}
        transition-all duration-300
      `}
      style={{
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
      }}
    >
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: `var(--${category.color})` }}
      />

      <div className="relative p-6 sm:p-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border"
          style={{
            background: `var(--${category.color}-dim)`,
            borderColor: "rgba(255,255,255,0.08)",
            color: `var(--${category.color})`
          }}
        >
          {category.icon}
        </div>

        <div
          className="absolute top-6 right-6 sm:top-8 sm:right-8 text-[9px] font-mono font-bold px-3 py-1 rounded-full border"
          style={{
            background: `var(--${category.color}-dim)`,
            borderColor: "rgba(255,255,255,0.06)",
            color: `var(--${category.color})`
          }}
        >
          {category.exp}
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-1)] leading-tight mt-2 min-h-[56px] flex items-center">
          {category.label}
        </h3>
      </div>

      <div className="mx-6 sm:mx-8 h-[1px] bg-[var(--b1)]" />

      <div className="p-6 sm:p-8 space-y-4">
        {category.skills.map((skill, i) => (
          <div key={skill.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {skill.devicon ? (
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <img
                    src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${skill.devicon}/${skill.devicon}-original.svg`}
                    alt={skill.name}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.parentElement?.querySelector(".emoji-fallback");
                      if (fallback) fallback.classList.remove("hidden");
                    }}
                  />
                  <span className="emoji-fallback hidden text-base leading-none">{skill.icon}</span>
                </div>
              ) : (
                <span className="text-base leading-none">{skill.icon}</span>
              )}
              <span className="text-sm text-[var(--text-2)] font-medium">{skill.name}</span>
            </div>

            <span
              className="text-[9px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full border"
              style={{
                color: skill.level === "ADVANCED" ? `var(--${category.color})` : "var(--text-3)",
                borderColor: skill.level === "ADVANCED" ? `var(--${category.color}-glow)` : "var(--b1)",
                background: skill.level === "ADVANCED" ? `var(--${category.color}-dim)` : "transparent"
              }}
            >
              {skill.level}
            </span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-6 right-6 sm:left-8 sm:right-8">
        <div className="h-[1px] bg-[var(--b1)] mb-3" />
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-[var(--text-3)]">
            {String(index + 1).padStart(2, "0")} / {String(SKILL_CATEGORIES.length).padStart(2, "0")}
          </span>
          <span
            className="text-[10px] font-mono hover:underline"
            style={{ color: `var(--${category.color})` }}
          >
            {category.id.toUpperCase()} ↗
          </span>
        </div>
      </div>
    </div>
  );
}

function SkillCardDesktop({ category, index, progress }: { category: SkillCategory; index: number; progress: any }) {
  const cardScale = useTransform(
    progress,
    [
      (index - 1) / SKILL_CATEGORIES.length,
      index / SKILL_CATEGORIES.length,
      (index + 1) / SKILL_CATEGORIES.length
    ],
    [0.92, 1.0, 0.92]
  );

  const cardOpacity = useTransform(
    progress,
    [
      (index - 0.5) / SKILL_CATEGORIES.length,
      index / SKILL_CATEGORIES.length,
      (index + 0.5) / SKILL_CATEGORIES.length
    ],
    [0.5, 1.0, 0.5]
  );

  return (
    <motion.div
      style={{ scale: cardScale, opacity: cardOpacity }}
      className={`
        relative flex-shrink-0 w-[300px] md:w-[380px] h-[520px]
        rounded-2xl overflow-hidden
        border border-[var(--b1)]
        bg-gradient-to-br ${category.bgGradient}
        transition-colors duration-300
      `}
      whileHover={{ scale: 1.03, borderColor: `var(--${category.color})` }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: `var(--${category.color})` }}
      />

      <div className="relative p-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border"
          style={{
            background: `var(--${category.color}-dim)`,
            borderColor: "rgba(255,255,255,0.08)",
            color: `var(--${category.color})`
          }}
        >
          {category.icon}
        </div>

        <div
          className="absolute top-8 right-8 text-[9px] font-mono font-bold px-3 py-1 rounded-full border"
          style={{
            background: `var(--${category.color}-dim)`,
            borderColor: "rgba(255,255,255,0.06)",
            color: `var(--${category.color})`
          }}
        >
          {category.exp}
        </div>

        <h3 className="text-2xl font-bold text-[var(--text-1)] leading-tight mt-2 min-h-[64px] flex items-center">
          {category.label}
        </h3>
      </div>

      <div className="mx-8 h-[1px] bg-[var(--b1)]" />

      <div className="p-8 space-y-4">
        {category.skills.map((skill, i) => (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {skill.devicon ? (
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <img
                    src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${skill.devicon}/${skill.devicon}-original.svg`}
                    alt={skill.name}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.parentElement?.querySelector(".emoji-fallback");
                      if (fallback) fallback.classList.remove("hidden");
                    }}
                  />
                  <span className="emoji-fallback hidden text-base leading-none">{skill.icon}</span>
                </div>
              ) : (
                <span className="text-base leading-none">{skill.icon}</span>
              )}
              <span className="text-sm text-[var(--text-2)] font-medium">{skill.name}</span>
            </div>

            <span
              className="text-[9px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full border"
              style={{
                color: skill.level === "ADVANCED" ? `var(--${category.color})` : "var(--text-3)",
                borderColor: skill.level === "ADVANCED" ? `var(--${category.color}-glow)` : "var(--b1)",
                background: skill.level === "ADVANCED" ? `var(--${category.color}-dim)` : "transparent"
              }}
            >
              {skill.level}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="absolute bottom-6 left-8 right-8">
        <div className="h-[1px] bg-[var(--b1)] mb-3" />
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-[var(--text-3)]">
            {String(index + 1).padStart(2, "0")} / {String(SKILL_CATEGORIES.length).padStart(2, "0")}
          </span>
          <span
            className="text-[10px] font-mono hover:underline"
            style={{ color: `var(--${category.color})` }}
          >
            {category.id.toUpperCase()} ↗
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function SkillsSectionMobile() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const width = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / (width * 0.85));
    setActiveIndex(Math.min(Math.max(newIndex, 0), SKILL_CATEGORIES.length - 1));
  };

  const scrollTo = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const width = container.offsetWidth;
    container.scrollTo({
      left: index * width * 0.85,
      behavior: "smooth"
    });
    setActiveIndex(index);
  };

  return (
    <div className="w-full">
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 py-4 scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {SKILL_CATEGORIES.map((category, i) => (
          <div key={category.id} className="flex-shrink-0 w-[82vw] max-w-[320px] snap-center">
            <SkillCardMobile category={category} index={i} />
          </div>
        ))}
      </div>
      
      {/* Dot indicators */}
      <div className="flex justify-center gap-2.5 mt-6 select-none">
        {SKILL_CATEGORIES.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              activeIndex === i ? "w-4 bg-[var(--jade)]" : "bg-[var(--text-3)]"
            }`}
            aria-label={`Go to skill group ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function HorizontalSkills() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll dalam container yang di-pin
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Spring physics untuk smooth movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  });

  // Translate cards ke kiri secara dinamis berdasarkan lebar viewport riil
  const x = useTransform(smoothProgress, (latest) => {
    if (typeof window === "undefined") return 0;
    const totalWidth = 1616; // 4 cards of 380px + 3 gaps of 32px
    const visibleWidth = window.innerWidth;
    const overflow = totalWidth - (visibleWidth - 128); // 128px padding (px-16)
    const maxScroll = Math.max(0, overflow);
    return -latest * maxScroll;
  });

  // Scroll hint opacity transform
  const hintOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);

  return (
    <section className="relative bg-[var(--bg-void)] border-b border-[var(--b1)]">
      
      {/* 3.1 Gradient Fades */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[var(--bg-deep)] to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--bg-deep)] to-transparent pointer-events-none z-10" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* DESKTOP PINNED SCROLL */}
      <div ref={containerRef} style={{ height: "350vh" }} className="hidden lg:block relative w-full">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
          
          {/* Header section */}
          <div className="mx-auto max-w-6xl w-full px-16 mb-12 relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-mono text-[var(--jade)] tracking-widest uppercase font-bold"
            >
              Capabilities
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
              className="text-5xl font-light text-[var(--text-1)] mt-2"
            >
              Skills & tools
            </motion.h2>
            
            {/* Progress indicator */}
            <div className="flex gap-2 mt-6">
              {SKILL_CATEGORIES.map((_, i) => (
                <ProgressIndicatorItem
                  key={i}
                  i={i}
                  smoothProgress={smoothProgress}
                  length={SKILL_CATEGORIES.length}
                />
              ))}
            </div>
            
            {/* Scroll hint */}
            <motion.p
              className="text-xs font-mono text-[var(--text-3)] mt-4"
              style={{ opacity: hintOpacity }}
            >
              ↓ scroll to explore capabilities
            </motion.p>
          </div>
          
          {/* Cards container — bergerak horizontal */}
          <div className="relative flex items-center px-16 w-full z-10">
            <motion.div
              style={{ x }}
              className="flex gap-8"
            >
              {SKILL_CATEGORIES.map((category, i) => (
                <SkillCardDesktop 
                  key={category.id} 
                  category={category} 
                  index={i} 
                  progress={smoothProgress} 
                />
              ))}
            </motion.div>
          </div>
          
        </div>
      </div>

      {/* MOBILE SWIPEABLE CAROUSEL */}
      <div className="lg:hidden relative w-full py-16 px-5 sm:px-8 z-10">
        {/* Header section */}
        <div className="mb-10 text-left">
          <p className="text-[10px] font-mono text-[var(--jade)] tracking-widest uppercase font-bold">
            Capabilities
          </p>
          <h2
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
            className="text-4xl font-light text-[var(--text-1)] mt-2"
          >
            Skills & tools
          </h2>
          <p className="text-xs font-mono text-[var(--text-3)] mt-2">
            ← swipe left/right to view categories →
          </p>
        </div>

        {/* Swipeable container */}
        <SkillsSectionMobile />
      </div>

    </section>
  );
}
