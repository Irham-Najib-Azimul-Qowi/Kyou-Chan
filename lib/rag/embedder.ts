import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
export function getEmbeddings() { if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is missing"); return new GoogleGenerativeAIEmbeddings({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY, model: "text-embedding-004" }); }
export function getPineconeIndex() { if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) throw new Error("Pinecone env vars are missing"); return new Pinecone({ apiKey: process.env.PINECONE_API_KEY }).index(process.env.PINECONE_INDEX_NAME); }
export async function embedText(text: string) { return getEmbeddings().embedQuery(text); }
