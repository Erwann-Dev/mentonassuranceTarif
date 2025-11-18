export function isoToFr(iso?: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return ''
  return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
}

export function frToIso(fr?: string): string | undefined {
  if (!fr) return undefined
  const cleaned = fr.replace(/[^0-9]/g, '')
  if (cleaned.length < 8) return undefined
  const d = cleaned.slice(0, 2)
  const m = cleaned.slice(2, 4)
  const y = cleaned.slice(4, 8)
  // basic range checks
  const day = Number(d), mon = Number(m)
  if (mon < 1 || mon > 12 || day < 1 || day > 31) return undefined
  return `${y}-${m}-${d}`
}

export function maskFrDate(input: string): string {
  const s = input.replace(/[^0-9]/g, '').slice(0, 8)
  const parts = [] as string[]
  if (s.length >= 2) parts.push(s.slice(0, 2))
  if (s.length >= 4) parts.push(s.slice(2, 4))
  if (s.length > 4) parts.push(s.slice(4))
  return parts.join('/')
}

