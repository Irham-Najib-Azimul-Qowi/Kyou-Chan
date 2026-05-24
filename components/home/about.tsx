"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

// Simple count up component with easeOutExpo to avoid external dependency issues
function Counter({ value, duration = 1.5, delay = 0 }: { value: number; duration?: number; delay?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    if (start === end) return;

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * (end - start) + start));

      if (progress < 1) {
        window.requestAnimationFrame(animate);
      }
    };

    const delayTimeout = setTimeout(() => {
      window.requestAnimationFrame(animate);
    }, delay * 1000);

    return () => clearTimeout(delayTimeout);
  }, [isInView, value, duration, delay]);

  return <span ref={ref}>{count}</span>;
}

function AboutLeftColumn() {
  return (
    <div className="space-y-4">
      
      {/* PROFILE CARD */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        className="relative rounded-2xl border border-[var(--b1)] bg-[var(--surface)] overflow-hidden p-6"
      >
        {/* Kanji watermark */}
        <div className="absolute right-4 bottom-4 text-[5rem] font-serif font-black opacity-[0.04] text-[var(--indigo)] select-none pointer-events-none leading-none">
          名
        </div>
        
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--indigo-dim)] border border-[var(--indigo-glow)] flex items-center justify-center text-2xl font-serif text-[var(--indigo)] font-bold flex-shrink-0 select-none">
            N
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-1)]">Irham Najib A.Q</h3>
            <p className="text-xs text-[var(--text-3)] font-mono mt-0.5">Najin Kyou · 名人強</p>
          </div>
        </div>
        
        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider px-3.5 py-1.5 rounded-full bg-[var(--jade-dim)] border border-[var(--jade-glow)] text-[var(--jade)] uppercase">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[var(--jade)]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Open for freelance
          </span>
          <span className="text-[10px] font-mono font-bold tracking-wider px-3.5 py-1.5 rounded-full bg-[var(--bg-raised)] border border-[var(--b1)] text-[var(--text-2)] uppercase">
            📍 Madiun, Indonesia
          </span>
        </div>
        
        {/* Quick bio */}
        <p className="text-sm text-[var(--text-2)] leading-relaxed font-light">
          Semester 4 Software Engineering student at Politeknik Negeri Madiun,
          building intelligent AI applications and data systems.
        </p>
      </motion.div>
      
      {/* STATS GRID */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        {[
          { value: 4, label: "Projects Built", color: "text-[var(--jade)]", suffix: "" },
          { value: 2, label: "Real Clients", color: "text-[var(--indigo)]", suffix: "" },
          { value: 2023, label: "Active Since", color: "text-[var(--gold)]", suffix: "" },
          { value: 1, label: "AI Competition", color: "text-[var(--maple)]", suffix: " entry" },
        ].map((stat, i) => (
          <div 
            key={i}
            className="rounded-xl border border-[var(--b1)] bg-[var(--surface)] p-4 hover:border-[var(--b2)] transition-colors"
          >
            <div className="flex items-end gap-1 mb-1">
              <span className={`text-2xl font-mono font-bold ${stat.color}`}>
                <Counter value={stat.value} />
              </span>
              {stat.suffix && (
                <span className="text-[10px] text-[var(--text-3)] mb-1 font-mono">{stat.suffix}</span>
              )}
            </div>
            <p className="text-[10px] font-mono text-[var(--text-3)] uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>
      
      {/* AVAILABILITY CARD */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-[var(--jade-glow)] bg-[var(--jade-dim)] p-4 flex items-center justify-between"
      >
        <div>
          <p className="text-sm font-semibold text-[var(--jade)]">Available for projects</p>
          <p className="text-xs text-[var(--text-3)] mt-0.5 font-light">Remote · Freelance · Collaboration</p>
        </div>
        <Link 
          href="/guestbook"
          className="inline-flex items-center justify-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[var(--jade)] border border-[var(--jade-glow)] px-3.5 py-1.5 rounded-full hover:bg-[var(--jade)]/10 transition-colors select-none whitespace-nowrap"
        >
          Say hello →
        </Link>
      </motion.div>
      
    </div>
  );
}

function AboutRightColumn() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const pillVariants = {
    hidden: { opacity: 0, x: -16, scale: 0.9 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="space-y-10">
      
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
      >
        <h2 
          style={{ fontFamily: '"Cormorant Garamond", serif', letterSpacing: "-0.02em" }}
          className="text-4xl lg:text-5xl font-light text-[var(--text-1)] leading-[1.2] mb-4"
        >
          Calm systems,<br />
          <span className="italic text-[var(--text-2)] font-light">strong intelligence.</span>
        </h2>
        <p className="text-[var(--text-2)] leading-relaxed font-light text-sm md:text-base">
          Irham Najib Azimul Qowi is a Software Engineering student at Politeknik
          Negeri Madiun, Indonesia. Under the professional moniker <span className="text-[var(--jade)] font-medium">Najin Kyou</span>, he explores
          the intersection of data workflows, pose screening algorithms, and semantic
          retrieval layers. He believes in clean engineering and quiet craft.
        </p>
      </motion.div>
      
      {/* Skills per kategori */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {[
          {
            label: "AI & Data Science",
            color: "indigo",
            skills: ["Python", "LangChain", "Gemini", "Pinecone", "TFLite", "MediaPipe", "FastAPI"]
          },
          {
            label: "Web Fullstack",
            color: "jade",
            skills: ["Next.js", "React", "Laravel", "TypeScript", "MySQL", "Supabase", "TailwindCSS"]
          },
          {
            label: "Mobile Engineering",
            color: "gold",
            skills: ["Kotlin XML", "Jetpack Compose", "Room Database", "WorkManager", "Retrofit"]
          },
        ].map((group, i) => (
          <div key={i}>
            <p 
              className="text-[10px] font-mono tracking-widest uppercase mb-2 font-bold"
              style={{ color: `var(--${group.color})` }}
            >
              {group.label}
            </p>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap gap-1.5"
            >
              {group.skills.map((skill) => (
                <motion.span 
                  key={skill}
                  variants={pillVariants}
                  className="text-xs px-2.5 py-1 rounded-full border transition-colors hover:border-[var(--b3)] cursor-default select-none font-medium"
                  style={{
                    background: `var(--${group.color}-dim)`,
                    borderColor: `var(--${group.color}-glow)`,
                    color: `var(--${group.color})`
                  }}
                >
                  {skill}
                </motion.span>
              ))}
            </motion.div>
          </div>
        ))}
      </motion.div>
      
      {/* Timeline */}
      <div className="relative pl-6">
        {/* Vertical line — animated draw */}
        <div className="absolute left-0 top-2 bottom-2 w-[1px] bg-[var(--b1)]">
          <motion.div
            className="w-full bg-[var(--jade)]"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            style={{ transformOrigin: "top", height: "100%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </div>
        
        {[
          {
            period: "Semester 1 (2023)",
            text: "Acquired core programming fundamentals, building static web applications and understanding algorithms.",
            color: "jade"
          },
          {
            period: "Year 2 (2024)",
            text: "Developed production client websites, ticket platforms, and started diving into mobile development with Kotlin.",
            color: "indigo"
          },
          {
            period: "Present (2026)",
            text: "Deeply focused on AI workflows: engineering RAG pipelines, building on-device ML vision screeners, and exploring machine learning endpoints.",
            color: "gold"
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="relative mb-6 last:mb-0"
          >
            {/* Dot */}
            <div
              className="absolute -left-[27.5px] top-1 w-2.5 h-2.5 rounded-full border-2 rotate-45"
              style={{
                borderColor: `var(--${item.color})`,
                background: `var(--bg-deep)`,
              }}
            />
            <p 
              className="text-[10px] font-mono font-bold tracking-widest uppercase mb-1"
              style={{ color: `var(--${item.color})` }}
            >
              {item.period}
            </p>
            <p className="text-xs md:text-sm text-[var(--text-2)] font-light leading-relaxed">{item.text}</p>
          </motion.div>
        ))}
      </div>
      
    </div>
  );
}

export function About() {
  return (
    <section 
      id="about"
      className="relative py-32 overflow-hidden border-y border-[var(--b1)]"
      style={{
        background: "linear-gradient(180deg, var(--bg-deep) 0%, #0A0A10 100%)"
      }}
    >
      
      {/* Top and Bottom Fades */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[var(--bg-void)] to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A0A0C] to-transparent pointer-events-none z-10" />
      
      {/* Subtle dot grid */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(129,140,248,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />
      
      <div className="relative z-20 max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        
        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <div className="h-[1px] w-8 bg-[var(--indigo)]/50" />
          <span 
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            className="text-xs font-semibold text-[var(--indigo)] tracking-[0.2em] uppercase"
          >
            ABOUT ME
          </span>
        </div>
        
        {/* Grid: 2 kolom di desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* LEFT: Identity card */}
          <AboutLeftColumn />
          
          {/* RIGHT: Bio */}
          <AboutRightColumn />
        </div>

      </div>
    </section>
  );
}
