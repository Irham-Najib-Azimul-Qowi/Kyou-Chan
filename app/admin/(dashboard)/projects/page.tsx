import { getProjects } from "@/lib/projects";
import { seedProjects } from "@/lib/data";
import { ProjectManager } from "@/components/admin/project-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { 
  title: "Admin Projects Manager", 
  description: "Create, edit, and moderate portfolio project showcase entries." 
};

export default async function AdminProjectsPage() { 
  const projects = await getProjects(); 
  const initialProjects = projects.length ? projects : seedProjects;

  return (
    <div className="relative z-10">
      <ProjectManager initialProjects={initialProjects} />
    </div>
  );
}
