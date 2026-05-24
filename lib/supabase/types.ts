export type Project = {
  id: string
  name: string
  slug: string
  description: string
  long_description: string | null
  tech_stack: string[]
  category: 'ai' | 'data' | 'web' | 'mobile'
  thumbnail_url: string | null
  screenshots: string[]
  demo_url: string | null
  github_url: string | null
  features: string[]
  is_featured: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export type GuestbookMessage = {
  id: string
  sender_name: string
  message: string
  is_approved: boolean
  ip_address: string | null
  created_at: string
}

export type SiteConfig = {
  key: string
  value: string
  updated_at: string
}
