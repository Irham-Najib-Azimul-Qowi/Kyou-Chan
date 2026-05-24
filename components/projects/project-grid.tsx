"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project, ProjectCategory } from "@/lib/data";
import { ProjectCard } from "./project-card";

const filters: Array<[string, ProjectCategory | "all"]> = [
  ["All", "all"],
  ["AI/Data Science", "ai"],
  ["Web Fullstack", "web"],
  ["Mobile Dev", "mobile"],
];

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<ProjectCategory | "all">("all");

  const filtered = useMemo(() => {
    if (active === "all") return projects;
    // Map 'ai' to cover both 'ai' and 'data' categories
    if (active === "ai") {
      return projects.filter((p) => p.category === "ai" || p.category === "data");
    }
    return projects.filter((p) => p.category === active);
  }, [active, projects]);

  return (
    <div className="space-y-10">
      {/* Filters pill tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map(([label, value]) => {
          const isActive = active === value;
          return (
            <button
              key={value}
              onClick={() => setActive(value)}
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-300 ${
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

      {/* Grid wrapper */}
      <motion.div 
        layout
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => (
            <motion.div
              layout
              key={project.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
