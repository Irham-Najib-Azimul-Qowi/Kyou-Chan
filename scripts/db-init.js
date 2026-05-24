const { Client } = require('pg');

const migrationSql = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE: projects
CREATE TABLE IF NOT EXISTS public.projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT NOT NULL,
  long_description TEXT,
  tech_stack      TEXT[] DEFAULT '{}',
  category        TEXT NOT NULL CHECK (category IN ('ai', 'data', 'web', 'mobile')),
  thumbnail_url   TEXT,
  screenshots     TEXT[] DEFAULT '{}',
  demo_url        TEXT,
  github_url      TEXT,
  features        TEXT[] DEFAULT '{}',
  is_featured     BOOLEAN DEFAULT false,
  order_index     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: guestbook
CREATE TABLE IF NOT EXISTS public.guestbook (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_name   TEXT NOT NULL CHECK (char_length(sender_name) >= 2),
  message       TEXT NOT NULL CHECK (char_length(message) >= 5 AND char_length(message) <= 500),
  is_approved   BOOLEAN DEFAULT false,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: site_config
CREATE TABLE IF NOT EXISTS public.site_config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: admin_sessions
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token       TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_public_read" ON public.projects;
CREATE POLICY "projects_public_read"
  ON public.projects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "projects_service_write" ON public.projects;
CREATE POLICY "projects_service_write"
  ON public.projects FOR ALL
  USING (true);

ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guestbook_public_insert" ON public.guestbook;
CREATE POLICY "guestbook_public_insert"
  ON public.guestbook FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "guestbook_approved_select" ON public.guestbook;
CREATE POLICY "guestbook_approved_select"
  ON public.guestbook FOR SELECT
  USING (is_approved = true);

DROP POLICY IF EXISTS "guestbook_service_all" ON public.guestbook;
CREATE POLICY "guestbook_service_all"
  ON public.guestbook FOR ALL
  USING (true);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_config_public_read" ON public.site_config;
CREATE POLICY "site_config_public_read"
  ON public.site_config FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "site_config_service_write" ON public.site_config;
CREATE POLICY "site_config_service_write"
  ON public.site_config FOR ALL
  USING (true);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_sessions_service_only" ON public.admin_sessions;
CREATE POLICY "admin_sessions_service_only"
  ON public.admin_sessions FOR ALL
  USING (true);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_order ON public.projects(order_index);
CREATE INDEX IF NOT EXISTS idx_guestbook_approved ON public.guestbook(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(token);

-- FUNCTION: updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS site_config_updated_at ON public.site_config;
CREATE TRIGGER site_config_updated_at
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "portfolio_public_read" ON storage.objects;
CREATE POLICY "portfolio_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "portfolio_service_write" ON storage.objects;
CREATE POLICY "portfolio_service_write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "portfolio_service_delete" ON storage.objects;
CREATE POLICY "portfolio_service_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolio');
`;

const seederSql = `
-- SEEDER: projects
INSERT INTO public.projects (
  name, slug, description, long_description,
  tech_stack, category, is_featured, order_index,
  demo_url, github_url, features
) VALUES
(
  'StuntSense',
  'stuntsense',
  'AI-powered Android app for toddler stunting screening using computer vision.',
  'StuntSense is a mobile application designed to help posyandu cadres and parents screen toddlers for stunting risk without specialized medical equipment. Using a standard smartphone camera and a 30cm ruler reference, the app captures a full-body photo and runs on-device inference using MobileNetV3-Large (quantized TFLite model) combined with MediaPipe Pose Landmarker to extract key anthropometric measurements. The system calculates height estimates and compares them against WHO growth standards, providing an immediate stunting risk classification with confidence scores.',
  ARRAY['Kotlin', 'Jetpack Compose', 'MobileNetV3', 'MediaPipe', 'TFLite', 'Firebase', 'Room'],
  'ai',
  true,
  1,
  null,
  'https://github.com/irhamqowi/stuntsense',
  ARRAY[
    'On-device ML inference using MobileNetV3-Large (TFLite) — no internet required',
    'MediaPipe Pose Landmarker for real-time keypoint extraction',
    'WHO growth standard comparison with confidence scoring',
    'Firebase sync for posyandu cadre data management',
    'Offline-first architecture with Room database',
    'Dual user types: Kader Posyandu and Orang Tua Balita'
  ]
),
(
  'RAG System',
  'rag-system',
  'Retrieval-Augmented Generation pipeline for intelligent document Q&A with semantic search.',
  'A production-ready RAG (Retrieval-Augmented Generation) pipeline built with LangChain, Google Gemini, and Pinecone vector store. The system ingests documents, chunks them intelligently, embeds them using Gemini text-embedding-004, and stores them in Pinecone for fast similarity retrieval. At query time, the pipeline retrieves the top-k relevant chunks and feeds them as context to Gemini 1.5 Pro for accurate, grounded responses. Built as a FastAPI service with streaming support.',
  ARRAY['Python', 'LangChain', 'Gemini', 'Pinecone', 'FastAPI', 'Pydantic'],
  'data',
  true,
  2,
  null,
  'https://github.com/irhamqowi/rag-system',
  ARRAY[
    'LangChain orchestration with custom retrieval chain',
    'Gemini text-embedding-004 for high-quality semantic embeddings',
    'Pinecone vector store with metadata filtering',
    'Streaming response support via FastAPI',
    'Configurable chunk size and overlap for different document types',
    'REST API with Pydantic validation'
  ]
),
(
  'Ticket Ordering System',
  'ticket-system',
  'Web-based ticket ordering system built for a real client with payment gateway integration.',
  'A full-stack web application built for a real client to handle event ticket sales online. The system supports multiple ticket categories, real-time seat availability tracking, and payment processing via Midtrans payment gateway. Built with Laravel for the backend API and Next.js for the customer-facing frontend, deployed on a VPS with MySQL database.',
  ARRAY['Laravel', 'Next.js', 'MySQL', 'Midtrans', 'Tailwind CSS', 'Redis'],
  'web',
  false,
  3,
  null,
  null,
  ARRAY[
    'Real client project — production deployed',
    'Midtrans payment gateway integration (VA, QRIS, Credit Card)',
    'Real-time seat availability with Redis',
    'Admin panel for event and ticket management',
    'PDF ticket generation with QR code',
    'Email confirmation via SMTP'
  ]
),
(
  'Stricter',
  'stricter',
  'Productivity RPG Android app with app-blocking, focus sessions, and gamification system.',
  'Stricter is a productivity Android application that gamifies focus and discipline. Users create "Focus Sessions" and block distracting apps during active sessions. Completed sessions earn tokens that can be spent on RPG-style rewards and character progression. The app features a quest system, a "Dark Alchemy Laboratory" UI theme, and background app-blocking using Android Accessibility Service and UsageStatsManager.',
  ARRAY['Kotlin', 'Jetpack Compose', 'Room', 'WorkManager', 'Hilt', 'DataStore'],
  'mobile',
  false,
  4,
  null,
  'https://github.com/irhamqowi/stricter',
  ARRAY[
    'App-blocking using Android Accessibility Service',
    'Focus Session timer with background WorkManager',
    'Token reward system for completed sessions',
    'RPG quest system with daily and weekly challenges',
    'Dark Alchemy Laboratory UI theme',
    'Hilt dependency injection + Clean Architecture'
  ]
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  long_description = EXCLUDED.long_description,
  tech_stack = EXCLUDED.tech_stack,
  category = EXCLUDED.category,
  is_featured = EXCLUDED.is_featured,
  order_index = EXCLUDED.order_index,
  demo_url = EXCLUDED.demo_url,
  github_url = EXCLUDED.github_url,
  features = EXCLUDED.features;

-- SEEDER: site_config
INSERT INTO public.site_config (key, value) VALUES
  ('bio',              'Software Engineering student at Politeknik Negeri Madiun, Indonesia. I specialize in building practical artificial intelligence systems, document RAG pipelines, on-device ML models, and high-quality mobile-fullstack applications.'),
  ('tagline',         'Data Scientist & AI Engineer'),
  ('open_for_hire',   'true'),
  ('profile_photo',   ''),
  ('github_url',      'https://github.com/irhamqowi'),
  ('linkedin_url',    'https://linkedin.com/in/irhamqowi'),
  ('whatsapp_number', '6281234567890'),
  ('email',           'irham@email.com'),
  ('location',        'Madiun, East Java, Indonesia'),
  ('university',      'Politeknik Negeri Madiun')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- SEEDER: sample guestbook (approved)
INSERT INTO public.guestbook (sender_name, message, is_approved) VALUES
  ('Budi Santoso',    'Keren banget portofolionya! Sangat menginspirasi, semangat terus untuk PKM-KC nya!', true),
  ('Dewi Rahayu',     'Impressive work on StuntSense! The use of MediaPipe for pose estimation is really clever.', true),
  ('Ahmad Fauzi',     'Baru tau ada developer di Madiun yang segaul ini skillnya. Sukses terus bro!', true),
  ('Sarah Chen',      'Love the clean design and the AI playground concept. Looking forward to seeing the RAG demo live!', true),
  ('Rizky Pratama',   'StuntSense project is genuinely impactful. Great combination of mobile and AI. Hit me up if you need a collaborator!', true)
ON CONFLICT DO NOTHING;
`;

async function main() {
  const client = new Client({
    host: 'db.wqchbiunmcwxipusjsfe.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'sBs9KXvVUFf+%G/',
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connecting to Supabase PostgreSQL database via direct connection params...');
  await client.connect();

  try {
    console.log('Executing Migration SQL...');
    await client.query(migrationSql);
    console.log('Migration SQL completed successfully.');

    console.log('Executing Seeder SQL...');
    await client.query(seederSql);
    console.log('Seeder SQL completed successfully.');

    console.log('Database initialization completed successfully!');
  } catch (err) {
    console.error('Error during database initialization:', err);
  } finally {
    await client.end();
  }
}

main();
