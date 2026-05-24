import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sanitizeName, sanitizeMessage } from '@/lib/sanitize'
import { checkRateLimit } from '@/lib/rate-limit'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// GET: Ambil 50 pesan terbaru yang sudah approved
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('guestbook')
      .select('id, sender_name, message, created_at')
      .eq('is_approved', true)
      .order('created_at', { ascending: true })
      .limit(50)
    
    if (error) throw error
    
    // Juga ambil total count
    const { count } = await supabase
      .from('guestbook')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true)
    
    return NextResponse.json({
      messages: data ?? [],
      total: count ?? 0
    })
    
  } catch (error) {
    console.error('GET /api/guestbook error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST: Kirim pesan baru
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1'
    
    // 1. In-memory Rate Limit: Max 3 pesan per 10 menit per IP
    const { allowed } = checkRateLimit(ip, { maxRequests: 3, windowMs: 10 * 60 * 1000 })
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before trying again.' },
        { status: 429, headers: { 'Retry-After': '600' } }
      )
    }

    const body = await request.json()
    const { sender_name, message } = body
    
    // 2. Input Sanitization
    const cleanName = sanitizeName(sender_name || '')
    const cleanMessage = sanitizeMessage(message || '')
    
    // Validasi panjang
    if (cleanName.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      )
    }
    
    if (cleanMessage.length < 5) {
      return NextResponse.json(
        { error: 'Message must be at least 5 characters' },
        { status: 400 }
      )
    }
    
    if (cleanMessage.length > 500) {
      return NextResponse.json(
        { error: 'Message must be at most 500 characters' },
        { status: 400 }
      )
    }
    
    const supabase = createServerClient()
    
    // 3. Database Rate Limit Check: cek apakah IP yang sama sudah kirim dalam 5 menit terakhir
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: recentFromIp } = await supabase
      .from('guestbook')
      .select('id')
      .eq('ip_address', ip)
      .gte('created_at', fiveMinutesAgo)
      .limit(1)
    
    if (recentFromIp && recentFromIp.length > 0) {
      return NextResponse.json(
        { error: 'Please wait a few minutes before sending another message' },
        { status: 429 }
      )
    }
    
    // Insert ke database
    const { data, error } = await supabase
      .from('guestbook')
      .insert({
        sender_name: cleanName,
        message: cleanMessage,
        is_approved: false,
        ip_address: ip,
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Kirim notifikasi email ke admin
    if (process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
      await resend.emails.send({
        from: 'noreply@najinkyou.dev',
        to: process.env.NOTIFICATION_EMAIL,
        subject: `📨 New guestbook message from ${cleanName}`,
        html: `
          <div style="font-family: monospace; padding: 20px; background: #0D0D0B; color: #EEEEF0;">
            <h2 style="color: #3DD68C;">New Guestbook Message</h2>
            <p><strong>From:</strong> ${cleanName}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left: 3px solid #3DD68C; padding-left: 12px; color: #9696A0;">
              ${cleanMessage}
            </blockquote>
            <p><strong>Time:</strong> ${new Date().toLocaleString('id-ID')}</p>
            <hr style="border-color: #252528;" />
            <a href="https://najinkyou.dev/admin/guestbook" 
               style="color: #3DD68C;">
              Approve or reject in admin dashboard →
            </a>
          </div>
        `
      }).catch(err => console.error('Email send failed:', err))
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message sent! Awaiting approval.',
      id: data.id
    })
    
  } catch (error) {
    console.error('POST /api/guestbook error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
