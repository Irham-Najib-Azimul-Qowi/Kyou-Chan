import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import { ProjectDetailClient } from "@/components/projects/project-detail-client";

export async function generateStaticParams() { 
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug })); 
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { 
  const { slug } = await params; 
  const project = await getProjectBySlug(slug); 
  return { 
    title: project ? `${project.name} | Najin Kyou` : "Project Details", 
    description: project?.description || "Interactive portfolio showcase"
  }; 
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) { 
  const { slug } = await params; 
  const project = await getProjectBySlug(slug); 
  if (!project) notFound(); 

  const allProjects = await getProjects();
  const currentIndex = allProjects.findIndex(p => p.slug === slug);
  
  // Find next project in the loop
  const nextProjectIndex = currentIndex !== -1 ? (currentIndex + 1) % allProjects.length : 0;
  const nextProject = allProjects[nextProjectIndex];

  return (
    <ProjectDetailClient 
      project={project} 
      nextProject={nextProject} 
    />
  );
}
