"use client";
import React from "react";
import { motion } from "framer-motion";

interface DividerProps {
  variant?: "jade" | "indigo" | "gold" | "subtle";
  label?: string;
}

export function SectionDivider({ variant = "subtle", label }: DividerProps) {
  const color = {
    jade: "var(--jade)",
    indigo: "var(--indigo)",
    gold: "var(--gold)",
    subtle: "var(--b1)",
  }[variant];
  
  return (
    <div className="relative py-8 flex items-center justify-center overflow-hidden w-full select-none pointer-events-none">
      
      {/* Left line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative w-full max-w-[200px] h-[1px]"
        style={{ background: color, opacity: 0.3, transformOrigin: "right" }}
      />
      
      {/* Center ornament / Label */}
      {label ? (
        <span 
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          className="relative px-4 text-[10px] font-semibold tracking-[0.2em] text-[var(--text-3)] bg-transparent whitespace-nowrap uppercase"
        >
          {label}
        </span>
      ) : (
        <motion.span
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="relative px-3 text-xs"
          style={{ color }}
        >
          ◆
        </motion.span>
      )}
      
      {/* Right line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }}
        className="relative w-full max-w-[200px] h-[1px]"
        style={{ background: color, opacity: 0.3, transformOrigin: "left" }}
      />
      
    </div>
  );
}
