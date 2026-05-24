import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken, ADMIN_COOKIE } from '@/lib/auth'

export async function POST(request: NextRequest) {
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
