import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  if (!await getAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('guestbook')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data })
}
