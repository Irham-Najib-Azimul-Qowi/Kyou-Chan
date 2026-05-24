import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { answerPortfolioQuestion } from "@/lib/rag/chain";
const schema = z.object({ message: z.string().min(1).max(1000) });
export async function POST(req: NextRequest) { const parsed = schema.safeParse(await req.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 400 }); try { const answer = await answerPortfolioQuestion(parsed.data.message); return new NextResponse(answer, { headers: { "Content-Type": "text/plain; charset=utf-8" } }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "RAG failed" }, { status: 500 }); } }
