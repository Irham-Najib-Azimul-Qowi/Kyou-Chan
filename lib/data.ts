export type ProjectCategory = "ai" | "web" | "mobile" | "data";

export type Project = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  long_description?: string | null;
  tech_stack: string[];
  category: ProjectCategory;
  thumbnail_url?: string | null;
  demo_url?: string | null;
  github_url?: string | null;
  is_featured?: boolean;
  order_index?: number;
  created_at?: string;
};

export type GuestbookMessage = {
  id?: string;
  sender_name: string;
  message: string;
  is_approved?: boolean;
  created_at?: string;
};

export const seedProjects: Project[] = [
  {
    name: "StuntSense",
    slug: "stuntsense",
    description: "AI-powered Android app for toddler stunting screening using computer vision.",
    long_description:
      "StuntSense explores accessible early stunting screening through Android, pose estimation, and on-device inference. It combines MobileNetV3, MediaPipe, and TensorFlow Lite to support a practical health-focused AI workflow.",
    tech_stack: ["Kotlin", "Jetpack Compose", "MobileNetV3", "MediaPipe", "TFLite", "Firebase"],
    category: "ai",
    is_featured: true,
    github_url: "https://github.com/irhamqowi/stuntsense",
    order_index: 1,
  },
  {
    name: "RAG System",
    slug: "rag-system",
    description: "Retrieval-Augmented Generation pipeline for intelligent document Q&A.",
    long_description:
      "A retrieval pipeline that embeds domain knowledge, stores semantic chunks in Pinecone, and grounds Gemini responses with relevant context for safer, more useful Q&A.",
    tech_stack: ["Python", "LangChain", "Gemini", "Pinecone", "FastAPI"],
    category: "data",
    is_featured: true,
    order_index: 2,
  },
  {
    name: "Ticket Ordering System",
    slug: "ticket-system",
    description: "Web-based ticket ordering system built for a real client with payment gateway integration.",
    long_description:
      "A production-oriented ticket ordering platform with admin workflows, customer order flow, and payment gateway integration for a real client use case.",
    tech_stack: ["Laravel", "Next.js", "MySQL", "Midtrans"],
    category: "web",
    is_featured: false,
    order_index: 3,
  },
  {
    name: "Stricter",
    slug: "stricter",
    description: "Productivity RPG Android app with app-blocking, focus sessions, and gamification quest system.",
    long_description:
      "Stricter turns focus into a quest system with app blocking, scheduled sessions, local persistence, and RPG-style motivation for Android users.",
    tech_stack: ["Kotlin", "Jetpack Compose", "Room", "WorkManager"],
    category: "mobile",
    is_featured: false,
    order_index: 4,
  },
];

export const approvedGuestbookFallback: GuestbookMessage[] = [
  { sender_name: "Visitor", message: "Website portfolio-nya tenang, rapi, dan vibes Jepangnya berasa.", created_at: new Date().toISOString(), is_approved: true },
  { sender_name: "Client", message: "Najin cepat memahami kebutuhan dan membangun solusi yang praktis.", created_at: new Date().toISOString(), is_approved: true },
];
