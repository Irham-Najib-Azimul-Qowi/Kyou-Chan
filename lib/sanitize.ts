import DOMPurify from 'isomorphic-dompurify'

export function sanitizeText(input: string): string {
  // Hapus semua HTML tags
  const stripped = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
  // Trim whitespace
  return stripped.trim()
}

export function sanitizeName(name: string): string {
  // Hanya huruf, angka, spasi, titik, tanda kutip
  return name
    .replace(/[^a-zA-Z0-9\s\.\'\-àáâãäåèéêëìíîïòóôõöùúûüýÿ]/g, '')
    .trim()
    .slice(0, 50)
}

export function sanitizeMessage(message: string): string {
  return sanitizeText(message).slice(0, 500)
}
