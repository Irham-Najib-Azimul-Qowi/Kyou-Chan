import { seedProjects, type Project } from "@/lib/data";
import { getSupabaseAdmin, getSupabaseAnon } from "@/lib/supabase/server";

export async function getProjects(featuredOnly = false): Promise<Project[]> {
  const supabase = getSupabaseAnon();
  if (!supabase) return featuredOnly ? seedProjects.filter((p) => p.is_featured) : seedProjects;
  let query = supabase.from("projects").select("*").order("order_index", { ascending: true });
  if (featuredOnly) query = query.eq("is_featured", true);
  const { data, error } = await query;
  if (error || !data) return featuredOnly ? seedProjects.filter((p) => p.is_featured) : seedProjects;
  return data as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = getSupabaseAnon();
  if (!supabase) return seedProjects.find((p) => p.slug === slug) ?? null;
  const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).single();
  if (error || !data) return seedProjects.find((p) => p.slug === slug) ?? null;
  return data as Project;
}

export async function upsertProject(project: Project) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase service role is not configured");
  return supabase.from("projects").upsert(project, { onConflict: "slug" }).select().single();
}
