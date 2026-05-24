// Rate limiting in-memory (untuk production gunakan Redis/Upstash jika diperlukan)

const rateLimit = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  ip: string,
  options: { maxRequests: number; windowMs: number }
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const key = ip
  const record = rateLimit.get(key)
  
  // Hapus record lama
  if (record && now > record.resetAt) {
    rateLimit.delete(key)
  }
  
  const current = rateLimit.get(key)
  
  if (!current) {
    rateLimit.set(key, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true, remaining: options.maxRequests - 1 }
  }
  
  if (current.count >= options.maxRequests) {
    return { allowed: false, remaining: 0 }
  }
  
  current.count++
  return { allowed: true, remaining: options.maxRequests - current.count }
}

// Cleanup memory setiap 10 menit
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    rateLimit.forEach((value, key) => {
      if (now > value.resetAt) rateLimit.delete(key)
    })
  }, 10 * 60 * 1000)
}
