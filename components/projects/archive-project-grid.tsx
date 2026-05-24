"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project, ProjectCategory } from "@/lib/data";
import { ArchiveProjectCard } from "./archive-project-card";

const filters: Array<[string, ProjectCategory | "all"]> = [
  ["All", "all"],
  ["AI & Data Science", "ai"],
  ["Web Apps", "web"],
  ["Mobile Apps", "mobile"],
];

export function ArchiveProjectGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<ProjectCategory | "all">("all");

  const filtered = useMemo(() => {
    if (active === "all") return projects;
    if (active === "ai") {
      return projects.filter((p) => p.category === "ai" || p.category === "data");
    }
    return projects.filter((p) => p.category === active);
  }, [active, projects]);

  return (
    <div className="space-y-8">
      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-30 -mx-5 px-5 py-4 bg-[rgba(13,13,11,0.9)] backdrop-blur-[12px] border-b border-[var(--border-subtle)]">
        <div className="mx-auto max-w-6xl flex flex-wrap gap-2.5">
          {filters.map(([label, value]) => {
            const isActive = active === value;
            return (
              <button
                key={value}
                onClick={() => setActive(value)}
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-[var(--jade)] text-[var(--bg-void)] border-[var(--jade)] shadow-[0_0_12px_var(--jade-glow)] scale-[1.02]"
                    : "border-[var(--border-normal)] text-[var(--text-secondary)] bg-transparent hover:border-[var(--jade-border)] hover:text-[var(--text-primary)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Grid - col-span-2 for featured projects */}
      <motion.div 
        layout 
        className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => {
            // Check if project is featured (colspan 2 in md screens)
            const isFeatured = !!project.is_featured;
            return (
              <motion.div
                layout
                key={project.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className={isFeatured ? "md:col-span-2" : "col-span-1"}
              >
                <ArchiveProjectCard project={project} isLarge={isFeatured} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
