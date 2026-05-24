import type { Metadata } from "next";
import { getProjects } from "@/lib/projects";
import { seedProjects } from "@/lib/data";
import { ProjectsPageClient } from "@/components/projects/projects-page-client";

export const metadata: Metadata = { 
  title: "Projects Archive | Najin Kyou", 
  description: "AI, data, web, and mobile projects built by Najin Kyou." 
};

export default async function ProjectsPage() {
  const dbProjects = await getProjects();
  const projects = dbProjects.length ? dbProjects : seedProjects;

  // Calculate statistics
  const totalCount = projects.length;
  const aiCount = projects.filter(p => p.category === "ai" || p.category === "data").length;
  const webCount = projects.filter(p => p.category === "web").length;
  const mobileCount = projects.filter(p => p.category === "mobile").length;

  return (
    <ProjectsPageClient 
      projects={projects}
      totalCount={totalCount}
      aiCount={aiCount}
      webCount={webCount}
      mobileCount={mobileCount}
    />
  );
}
