"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Work", href: "/projects" },
  { label: "About", href: "/#about" },
  { label: "Playground", href: "/playground" },
  { label: "Guestbook", href: "/guestbook" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLinkActive = (href: string) => {
    if (!mounted) return false;
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) {
      return pathname === "/" && typeof window !== "undefined" && window.location.hash === href.substring(1);
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[var(--b1)] flex items-center justify-between px-5 lg:px-10 backdrop-blur-xl"
        style={{ background: "rgba(8, 8, 9, 0.85)" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group select-none">
          <span 
            style={{ fontFamily: '"Noto Serif JP", serif', fontWeight: 900 }}
            className="text-lg text-[var(--jade)] transition-colors duration-300 group-hover:text-[var(--text-primary)]"
          >
            名人強
          </span>
          <span 
            style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "0.1em" }}
            className="text-xs text-[var(--text-2)] font-mono hidden sm:block"
          >
            Najin Kyou
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map(({ label, href }) => {
            const active = isLinkActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="relative text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] transition-colors duration-300 hover:text-[var(--jade)] py-2 select-none"
              >
                {label}
                {active && (
                  <motion.span
                    layoutId="activeNavbarDot"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] w-[4px] rounded-full bg-[var(--jade)] shadow-[0_0_8px_var(--jade)]"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block select-none">
          <Link
            href="/guestbook"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--jade)] text-[var(--bg-void)] text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-[#5ae6b5] hover:scale-[1.02]"
          >
            HIRE ME →
          </Link>
        </div>

        {/* Mobile hamburger menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-[var(--bg-raised)] border border-transparent hover:border-[var(--b1)] transition-all cursor-pointer"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0, y: open ? 5.5 : 0 }}
            className="w-5 h-[1.5px] bg-[var(--text-1)] block"
          />
          <motion.span
            animate={{ opacity: open ? 0 : 1 }}
            className="w-5 h-[1.5px] bg-[var(--text-1)] block"
          />
          <motion.span
            animate={{ rotate: open ? -45 : 0, y: open ? -5.5 : 0 }}
            className="w-5 h-[1.5px] bg-[var(--text-1)] block"
          />
        </button>
      </header>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer from right side */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[var(--surface)] border-l border-[var(--b1)] flex flex-col lg:hidden shadow-2xl p-6"
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-6 border-b border-[var(--b1)] mb-6 select-none">
                <span 
                  style={{ fontFamily: '"Noto Serif JP", serif', fontWeight: 900 }}
                  className="text-lg text-[var(--jade)]"
                >
                  名人強
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-raised)] transition-colors text-[var(--text-2)] cursor-pointer text-xl font-light"
                >
                  ✕
                </button>
              </div>

              {/* Staggered links */}
              <div className="flex-1 space-y-1">
                {links.map((link, i) => {
                  const active = isLinkActive(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between w-full py-4 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                          active 
                            ? "bg-[var(--jade-dim)] text-[var(--jade)] border border-[var(--jade-glow)]" 
                            : "text-[var(--text-1)] hover:bg-[var(--bg-raised)] hover:text-[var(--jade)] border border-transparent"
                        }`}
                      >
                        {link.label}
                        <ArrowRight className={`w-4 h-4 transition-transform ${active ? "text-[var(--jade)]" : "text-[var(--text-3)]"}`} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom CTA HIRE ME */}
              <div className="pt-6 border-t border-[var(--b1)] select-none">
                <Link
                  href="/guestbook"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[var(--jade)] text-[var(--bg-void)] font-bold text-xs uppercase tracking-wider transition-all hover:bg-[#5ae6b5] hover:scale-[1.02]"
                >
                  Let's work together →
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
