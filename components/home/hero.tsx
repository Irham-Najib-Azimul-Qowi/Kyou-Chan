"use client";
import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { FloatingParticles } from "@/components/decorative/floating-particles";
import { NeuralNetwork } from "@/components/decorative/neural-network";

export function Hero() {
  const { scrollY } = useScroll();

  // Scroll-linked transformations for Parallax Kanji Watermark
  const kanjiY = useTransform(scrollY, [0, 500], [0, -80]);
  const kanjiOpacity = useTransform(scrollY, [0, 300], [0.08, 0]);

  // Subtle parallax for content column to feel organic
  const textY = useTransform(scrollY, [0, 500], [0, 20]);

  return (
    <section className="relative min-h-[100vh] w-full overflow-hidden bg-[#080809] pt-28 pb-20 px-5 sm:px-8 lg:px-16 flex items-center">
      {/* Background Layers */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Layer 2: Grid dots pattern */}
        <div 
          className="absolute inset-0 opacity-40" 
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />

        {/* Layer 3: Blob jade */}
        <div className="animate-blob-float absolute -bottom-[10vw] -left-[10vw] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(61,214,140,0.08)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Layer 4: Blob indigo */}
        <div 
          className="animate-blob-float absolute -top-[5vw] -right-[5vw] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.06)_0%,transparent_70%)] pointer-events-none"
          style={{ animationDelay: "-4s" }}
        />

        {/* Layer 5: Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Floating Particles in Hero */}
      <FloatingParticles />

      {/* Parallax Kanji Watermark in Background */}
      <motion.div 
        style={{ 
          y: kanjiY, 
          opacity: kanjiOpacity,
          fontFamily: '"Noto Serif JP", serif',
          fontWeight: 900
        }}
        className="absolute right-10 bottom-10 text-[clamp(8rem,24vw,20rem)] text-transparent bg-gradient-to-br from-[var(--jade)] to-[var(--indigo)] bg-clip-text select-none pointer-events-none leading-none z-0"
      >
        名人強
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* Left Content Column */}
        <motion.div 
          style={{ y: textY }}
          className="w-full lg:w-[58%] text-left"
        >
          {/* Pulsing Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(61,214,140,0.3)] bg-[rgba(61,214,140,0.06)] px-4 py-1.5 text-xs text-[var(--jade)] font-medium tracking-wide uppercase font-mono"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--jade)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--jade)]"></span>
            </span>
            Open for freelance
          </motion.div>

          {/* Kanji + Large Name Display */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 font-display font-black leading-none tracking-tight flex flex-col"
          >
            <span 
              style={{ fontFamily: '"Noto Serif JP", serif', textShadow: "0 0 120px rgba(61,214,140,0.3)" }}
              className="text-[clamp(3.5rem,12vw,7rem)] bg-gradient-to-r from-[var(--jade)] to-[var(--indigo)] bg-clip-text text-transparent leading-none"
            >
              名人強
            </span>
            <span 
              style={{ fontFamily: '"Cormorant Garamond", serif', letterSpacing: "0.3em" }}
              className="font-light text-[var(--text-2)] text-[clamp(1.2rem,5vw,2rem)] mt-3 uppercase"
            >
              Najin Kyou
            </span>
          </motion.h1>

          {/* Divider Line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-[1.5px] bg-[var(--jade)] my-6"
          />

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            className="font-semibold text-[clamp(0.8rem,2.5vw,1rem)] text-[var(--jade)] tracking-widest uppercase"
          >
            Data Scientist & AI Engineer
          </motion.h2>

          {/* Body Text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4 max-w-[500px] text-[clamp(0.85rem,2vw,1rem)] leading-relaxed text-[var(--text-2)] font-light"
          >
            Software Engineering student at Politeknik Negeri Madiun. I specialize in building practical artificial intelligence systems, document RAG pipelines, on-device ML models, and high-quality web-mobile fullstack applications.
          </motion.p>

          {/* CTA Buttons Row - Stacked on Mobile, Row on tablet+ */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto select-none"
          >
            <Link
              href="/projects"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-[6px] bg-[var(--jade)] text-[var(--void)] text-xs font-bold uppercase tracking-wider hover:bg-[#5ae6b5] hover:scale-[1.02] transition-all duration-300 shadow-[0_4px_20px_rgba(61,214,140,0.15)]"
            >
              See my work →
            </Link>
            <Link
              href="/guestbook"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-[6px] border border-[var(--b2)] bg-transparent text-[var(--text-1)] text-xs font-bold uppercase tracking-wider hover:border-[var(--jade)] hover:text-[var(--jade)] hover:scale-[1.02] transition-all duration-300"
            >
              Let&apos;s talk
            </Link>
          </motion.div>

          {/* Categorized Skills Badge Grid */}
          <div className="mt-10 space-y-4">
            {/* AI/DATA */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-col sm:flex-row sm:items-center gap-2"
            >
              <span 
                style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "0.15em" }}
                className="text-[9px] font-semibold text-[var(--text-3)] uppercase min-w-[80px]"
              >
                AI/DATA ·
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["Python", "RAG", "TFLite", "MediaPipe", "LangChain"].map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-[rgba(129,140,248,0.3)] bg-[var(--indigo-dim)] text-[var(--indigo)] font-semibold uppercase"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* WEB */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="flex flex-col sm:flex-row sm:items-center gap-2"
            >
              <span 
                style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "0.15em" }}
                className="text-[9px] font-semibold text-[var(--text-3)] uppercase min-w-[80px]"
              >
                WEB ·
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["Next.js", "React", "Laravel", "Gin"].map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-[var(--jade-glow)] bg-[var(--jade-dim)] text-[var(--jade)] font-semibold uppercase"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* MOBILE */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.75 }}
              className="flex flex-col sm:flex-row sm:items-center gap-2"
            >
              <span 
                style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "0.15em" }}
                className="text-[9px] font-semibold text-[var(--text-3)] uppercase min-w-[80px]"
              >
                MOBILE ·
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["Kotlin", "Compose"].map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-[rgba(245,158,11,0.3)] bg-[var(--gold-dim)] text-[var(--gold)] font-semibold uppercase"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column: Neural Network simulation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="w-full lg:w-[42%] h-[280px] sm:h-[350px] lg:h-[400px] relative z-10 flex items-center justify-center"
        >
          <NeuralNetwork />
        </motion.div>
      </div>
    </section>
  );
}
