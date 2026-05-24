import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  if (!await getAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createServerClient()
  const { data } = await supabase.from('site_config').select('*')
  return NextResponse.json({ config: data })
}

export async function PATCH(request: NextRequest) {
  if (!await getAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const updates: Record<string, string> = await request.json()
  const supabase = createServerClient()
  
  for (const [key, value] of Object.entries(updates)) {
    await supabase.from('site_config')
      .upsert({ key, value }, { onConflict: 'key' })
  }
  
  return NextResponse.json({ success: true })
}
