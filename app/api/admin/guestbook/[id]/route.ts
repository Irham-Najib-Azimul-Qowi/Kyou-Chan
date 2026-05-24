import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { id } = await params
  const { action } = await request.json()
  const supabase = createServerClient()
  
  if (action === 'delete') {
    await supabase.from('guestbook').delete().eq('id', id)
  } else if (action === 'approve') {
    await supabase.from('guestbook').update({ is_approved: true }).eq('id', id)
  } else if (action === 'reject') {
    await supabase.from('guestbook').update({ is_approved: false }).eq('id', id)
  }
  
  return NextResponse.json({ success: true })
}
