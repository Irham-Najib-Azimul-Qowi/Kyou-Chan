import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getEmbeddings, getPineconeIndex } from "../lib/rag/embedder";

type PineconeVector = { id: string; values: number[]; metadata: { source: string; text: string } };
type LegacyUpsertIndex = { upsert: (vectors: PineconeVector[]) => Promise<unknown> };

async function main() {
  const dir = path.join(process.cwd(), "knowledge-base");
  const files = (await fs.readdir(dir)).filter((file) => file.endsWith(".txt"));
  const embeddings = getEmbeddings();
  const index = getPineconeIndex() as unknown as LegacyUpsertIndex;
  for (const file of files) {
    const text = await fs.readFile(path.join(dir, file), "utf8");
    const chunks = text.match(/[\s\S]{1,1200}(?=\n|$)/g) ?? [text];
    const vectors: PineconeVector[] = await Promise.all(chunks.map(async (chunk, i) => ({
      id: `${file}-${i}-${randomUUID()}`,
      values: await embeddings.embedQuery(chunk),
      metadata: { source: file, text: chunk },
    })));
    await index.upsert(vectors);
    console.log(`Ingested ${vectors.length} chunks from ${file}`);
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
