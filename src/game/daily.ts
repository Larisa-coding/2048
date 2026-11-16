/** YYYY-MM-DD in local timezone */
export const getLocalDateKey = (date = new Date()): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Stable 32-bit seed from a date string */
export const seedFromDate = (dateKey: string): number => {
  let hash = 2166136261
  for (let i = 0; i < dateKey.length; i += 1) {
    hash ^= dateKey.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  // Mix with a game-specific salt so it differs from other apps
  hash ^= 0x32303438 // "2048"
  return hash >>> 0
}

export const formatDailyDateRu = (dateKey: string): string => {
  const [y, m, d] = dateKey.split('-').map(Number)
  if (!y || !m || !d) return dateKey
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
