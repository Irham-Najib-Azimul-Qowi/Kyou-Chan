"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project, ProjectCategory } from "@/lib/data";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Upload,
  ArrowRight,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import toast from "react-hot-toast";

interface ProjectManagerProps {
  initialProjects: Project[];
}

export function ProjectManager({ initialProjects }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("ai");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [demoUrl, setDemoUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [orderIndex, setOrderIndex] = useState(1);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open Panel for creating new project
  const handleAddClick = () => {
    setEditingProject(null);
    setName("");
    setCategory("ai");
    setDescription("");
    setLongDescription("");
    setTechInput("");
    setTechStack([]);
    setDemoUrl("");
    setGithubUrl("");
    setIsFeatured(false);
    setOrderIndex(projects.length + 1);
    setPreviewImage(null);
    setIsPanelOpen(true);
  };

  // Open Panel for editing existing project
  const handleEditClick = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setCategory(p.category);
    setDescription(p.description);
    setLongDescription(p.long_description || "");
    setTechInput("");
    setTechStack(p.tech_stack);
    setDemoUrl(p.demo_url || "");
    setGithubUrl(p.github_url || "");
    setIsFeatured(!!p.is_featured);
    setOrderIndex(p.order_index || 1);
    setPreviewImage(p.thumbnail_url || null);
    setIsPanelOpen(true);
  };

  // Handle tech tag addition
  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = techInput.trim();
      if (val && !techStack.includes(val)) {
        setTechStack([...techStack, val]);
        setTechInput("");
      }
    }
  };

  const removeTechTag = (tag: string) => {
    setTechStack(techStack.filter((t) => t !== tag));
  };

  // Mock upload action
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      toast.success("Thumbnail preview loaded successfully!");
    }
  };

  // Delete Action
  const handleDeleteClick = (slug: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter((p) => p.slug !== slug));
      toast.success("Project deleted successfully (simulated)!");
    }
  };

  // Toggle Featured state in list directly
  const toggleFeaturedDirectly = (slug: string) => {
    setProjects(
      projects.map((p) => {
        if (p.slug === slug) {
          const nextVal = !p.is_featured;
          toast.success(`Project featured state is now ${nextVal ? "ON" : "OFF"}`);
          return { ...p, is_featured: nextVal };
        }
        return p;
      })
    );
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      toast.error("Please fill required fields.");
      return;
    }

    const slug = editingProject?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const savedProject: Project = {
      name,
      slug,
      category,
      description,
      long_description: longDescription,
      tech_stack: techStack,
      demo_url: demoUrl || null,
      github_url: githubUrl || null,
      is_featured: isFeatured,
      order_index: orderIndex,
      thumbnail_url: previewImage,
    };

    if (editingProject) {
      // Edit
      setProjects(projects.map((p) => (p.slug === editingProject.slug ? savedProject : p)));
      toast.success("Project updated successfully (simulated)!");
    } else {
      // Add
      if (projects.some((p) => p.slug === slug)) {
        toast.error("A project with this slug/name already exists.");
        return;
      }
      setProjects([...projects, savedProject]);
      toast.success("Project created successfully (simulated)!");
    }

    setIsPanelOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title + Action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <h2 
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
            className="text-3xl font-light text-[var(--text-primary)]"
          >
            Manage Projects
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-light mt-1">
            Create, edit, delete, or re-order your portfolio work highlights.
          </p>
        </div>

        <button
          onClick={handleAddClick}
          className="flex items-center gap-1 bg-[var(--jade)] hover:bg-[#5ae6b5] text-[var(--bg-void)] px-4 py-2 rounded font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>

      {/* Projects Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-normal)] bg-[var(--bg-surface)]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--bg-raised)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              <th className="p-4 w-12">Preview</th>
              <th className="p-4">Name</th>
              <th className="p-4 w-28">Category</th>
              <th className="p-4">Tech Stack</th>
              <th className="p-4 w-20 text-center">Featured</th>
              <th className="p-4 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              let catBadge = "";
              if (p.category === "ai" || p.category === "data") {
                catBadge = "bg-[var(--maple-dim)] text-[var(--maple)] border-[rgba(232,93,60,0.2)]";
              } else if (p.category === "web") {
                catBadge = "bg-[var(--jade-glow)] text-[var(--jade)] border-[var(--jade-border)]";
              } else {
                catBadge = "bg-[var(--gold-glow)] text-[var(--gold)] border-[rgba(232,184,75,0.2)]";
              }

              return (
                <tr key={p.slug} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-raised)]/35 transition-colors">
                  {/* Preview Thumbnail */}
                  <td className="p-4">
                    <div className="w-10 h-10 rounded border border-[var(--border-normal)] bg-gradient-to-br from-[var(--bg-void)] to-[var(--bg-surface)] overflow-hidden flex items-center justify-center font-display font-black text-[10px] text-[var(--jade)] select-none">
                      {p.name.slice(0, 2)}
                    </div>
                  </td>
                  
                  {/* Name */}
                  <td className="p-4 font-semibold text-[var(--text-primary)]">
                    {p.name}
                  </td>
                  
                  {/* Category */}
                  <td className="p-4">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${catBadge}`}>
                      {p.category}
                    </span>
                  </td>
                  
                  {/* Tech stack */}
                  <td className="p-4 text-[var(--text-secondary)] font-light max-w-xs truncate">
                    {p.tech_stack.join(", ")}
                  </td>
                  
                  {/* Featured Toggle Switch */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleFeaturedDirectly(p.slug)}
                      className="text-[var(--text-secondary)] hover:text-[var(--jade)] p-1 cursor-pointer"
                    >
                      {p.is_featured ? (
                        <ToggleRight className="h-6 w-6 text-[var(--jade)]" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-[var(--text-muted)]" />
                      )}
                    </button>
                  </td>
                  
                  {/* Actions buttons */}
                  <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleEditClick(p)}
                      className="p-1.5 rounded hover:bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:text-[var(--jade)] transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(p.slug)}
                      className="p-1.5 rounded hover:bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:text-[var(--maple)] transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[var(--text-muted)] font-light">
                  No projects configured yet. Click &quot;Add Project&quot; to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-in Edit/Add Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            {/* Modal Backdrop */}
            <div
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Side panel container */}
            <div
              className="fixed right-0 top-0 bottom-0 z-[60] w-full max-w-lg bg-[var(--bg-surface)] border-l border-[var(--border-normal)] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-6">
                  <h3 
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                    className="text-2xl font-semibold text-[var(--text-primary)]"
                  >
                    {editingProject ? `Edit Project: ${editingProject.name}` : "Create New Project"}
                  </h3>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSave} className="space-y-4">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.g. StuntSense Growth Screener"
                      className="w-full bg-[var(--bg-raised)] border border-[var(--border-normal)] rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)] transition-all"
                    />
                  </div>

                  {/* Category select */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                      Domain Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                      className="w-full bg-[var(--bg-raised)] border border-[var(--border-normal)] rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)] transition-all"
                    >
                      <option value="ai">AI / Machine Learning</option>
                      <option value="data">Data Science / RAG</option>
                      <option value="web">Web Fullstack</option>
                      <option value="mobile">Mobile Application</option>
                    </select>
                  </div>

                  {/* Description field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                      Short Description *
                    </label>
                    <input
                      type="text"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="E.g. AI-powered Android app for toddler stunting screening..."
                      className="w-full bg-[var(--bg-raised)] border border-[var(--border-normal)] rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)] transition-all"
                    />
                  </div>

                  {/* Long description field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                      Long Documentation (Markdown supported)
                    </label>
                    <textarea
                      rows={4}
                      value={longDescription}
                      onChange={(e) => setLongDescription(e.target.value)}
                      placeholder="Write comprehensive engineering docs, API flows, or structural benchmarks..."
                      className="w-full bg-[var(--bg-raised)] border border-[var(--border-normal)] rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)] transition-all resize-y min-h-[80px]"
                    />
                  </div>

                  {/* Tech stack tags input */}
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                      Tech Stack (Type tag & press Enter)
                    </label>
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={handleTechKeyDown}
                      placeholder="E.g. Kotlin, then press Enter"
                      className="w-full bg-[var(--bg-raised)] border border-[var(--border-normal)] rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)] transition-all"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {techStack.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-[var(--jade-border)] bg-[var(--jade-glow)] text-[var(--jade)] font-medium"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() => removeTechTag(tech)}
                            className="text-[var(--jade)] hover:text-white rounded-full p-0.5 hover:bg-[var(--jade-dim)] cursor-pointer"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Demo/GitHub URLs */}
                  <div className="grid gap-3 grid-cols-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                        Deployment URL
                      </label>
                      <input
                        type="url"
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[var(--bg-raised)] border border-[var(--border-normal)] rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)] transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                        GitHub Repository
                      </label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full bg-[var(--bg-raised)] border border-[var(--border-normal)] rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)] transition-all"
                      />
                    </div>
                  </div>

                  {/* Drag drop mockup thumbnail selector */}
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                      Thumbnail Image
                    </label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-[var(--border-strong)] rounded-lg p-5 flex flex-col items-center justify-center bg-[var(--bg-raised)] hover:border-[var(--jade-border)] transition-colors cursor-pointer text-center"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*"
                        className="hidden" 
                      />
                      {previewImage ? (
                        <div className="space-y-2">
                          <div className="w-20 h-12 border border-[var(--border-subtle)] rounded bg-[var(--bg-void)] mx-auto overflow-hidden flex items-center justify-center text-[8px] text-[var(--jade)] font-black">
                            {previewImage.startsWith("blob:") ? "Preview Image" : "Stored Cover"}
                          </div>
                          <span className="text-[10px] text-[var(--jade)] font-medium">Click to replace thumbnail</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-[var(--text-muted)] mb-2" />
                          <span className="text-[10px] text-[var(--text-secondary)] font-semibold">Drag & drop or Click to upload cover</span>
                          <span className="text-[9px] text-[var(--text-muted)] mt-0.5">Supports JPG, PNG, WEBP</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Ordering Index + Featured Toggle */}
                  <div className="flex items-center justify-between bg-[var(--bg-raised)] border border-[var(--border-subtle)] p-4 rounded-lg">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                        Order Index
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={orderIndex}
                        onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
                        className="w-20 bg-[var(--bg-overlay)] border border-[var(--border-normal)] rounded px-2.5 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-primary)]">
                          Featured Project
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)] font-light">Show on homepage archive</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsFeatured(!isFeatured)}
                        className="text-[var(--text-secondary)] hover:text-[var(--jade)] p-1 cursor-pointer"
                      >
                        {isFeatured ? (
                          <ToggleRight className="h-7 w-7 text-[var(--jade)]" />
                        ) : (
                          <ToggleLeft className="h-7 w-7 text-[var(--text-muted)]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Save Cancel Buttons */}
                  <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPanelOpen(false)}
                      className="px-4 py-2 border border-[var(--border-normal)] text-[var(--text-primary)] rounded font-semibold text-xs uppercase tracking-wider hover:bg-[var(--bg-raised)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[var(--jade)] hover:bg-[#5ae6b5] text-[var(--bg-void)] rounded font-semibold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
