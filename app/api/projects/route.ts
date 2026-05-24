import { NextRequest, NextResponse } from "next/server";
import { getProjects, upsertProject } from "@/lib/projects";
import { getSupabaseAdmin } from "@/lib/supabase/server";
export async function GET() { return NextResponse.json(await getProjects()); }
export async function POST(req: NextRequest) { try { const data = await req.json(); const result = await upsertProject(data); if (result.error) throw result.error; return NextResponse.json(result.data); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 }); } }
export async function DELETE(req: NextRequest) { const supabase = getSupabaseAdmin(); if (!supabase) return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 500 }); const { searchParams } = new URL(req.url); const slug = searchParams.get("slug"); if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 }); const { error } = await supabase.from("projects").delete().eq("slug", slug); return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true }); }
