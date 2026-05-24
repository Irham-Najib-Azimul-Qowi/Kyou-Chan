"use client";
import { motion } from "framer-motion";

interface KanjiWatermarkProps {
  kanji?: string;
  className?: string;
}

export function KanjiWatermark({ kanji = "名人強", className = "" }: KanjiWatermarkProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1.0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: '"Noto Serif JP", serif',
          fontWeight: 900,
          color: "rgba(78, 203, 160, 0.03)",
          transform: "rotate(-15deg) translate(-5%, -5%)",
          fontSize: "clamp(24rem, 40vw, 36rem)",
          lineHeight: 1,
        }}
        className="absolute -top-10 -left-10 font-bold whitespace-nowrap"
      >
        {kanji}
      </motion.div>
    </div>
  );
}
