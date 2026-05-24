import { embedText, getPineconeIndex } from "./embedder";
export async function retrieveContext(query: string, topK = 4) { const vector = await embedText(query); const results = await getPineconeIndex().query({ vector, topK, includeMetadata: true }); return results.matches?.map((m) => String(m.metadata?.text ?? "")).filter(Boolean).join("\n\n---\n\n") ?? ""; }
