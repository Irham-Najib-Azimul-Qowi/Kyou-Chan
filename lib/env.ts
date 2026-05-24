function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

const isServer = typeof window === 'undefined';

// Export validated env vars
export const env = {
  supabaseUrl:         requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey:     requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceKey:  isServer ? requireEnv('SUPABASE_SERVICE_ROLE_KEY') : '',
  adminPassword:       isServer ? requireEnv('ADMIN_PASSWORD') : '',
  adminJwtSecret:      isServer ? requireEnv('ADMIN_JWT_SECRET') : '',
  resendApiKey:        process.env.RESEND_API_KEY ?? null,
  notificationEmail:   process.env.NOTIFICATION_EMAIL ?? null,
  geminiApiKey:        process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? null,
} as const

// Validasi panjang JWT secret
if (isServer && env.adminJwtSecret.length < 32) {
  throw new Error('ADMIN_JWT_SECRET must be at least 32 characters')
}
