import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken, ADMIN_COOKIE } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1'
  
  // 1. Rate Limiting: Max 5 login attempts per 15 minutes per IP
  const { allowed } = checkRateLimit(ip, { maxRequests: 5, windowMs: 15 * 60 * 1000 })
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait 15 minutes.' },
      { status: 429 }
    )
  }

  const { password } = await request.json()
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }
  
  const token = await signAdminToken()
  
  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: '/',
  })
  
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(ADMIN_COOKIE)
  return response
}
