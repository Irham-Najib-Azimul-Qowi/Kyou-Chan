import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  if (!await getAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createServerClient()
  const { data } = await supabase.from('projects').select('*').order('order_index')
  return NextResponse.json({ projects: data })
}

export async function POST(request: NextRequest) {
  if (!await getAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const supabase = createServerClient()
  const { data, error } = await supabase.from('projects').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ project: data })
}
