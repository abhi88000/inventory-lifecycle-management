export function stageSince(lot: any): string | undefined {
  return lot.updatedAt || lot.createdAt
}

export function formatAge(dateStr?: string): string {
  if (!dateStr) return ''
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diffMs / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? '1 day ago' : `${days} days ago`
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ageBadgeClass(dateStr?: string): string {
  if (!dateStr) return 'badge-gray'
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days >= 3) return 'badge-red'
  if (days >= 1) return 'badge-yellow'
  return 'badge-green'
}

export function sortByOldest<T extends Record<string, any>>(list: T[]): T[] {
  return [...list].sort((a, b) => new Date(stageSince(a) || 0).getTime() - new Date(stageSince(b) || 0).getTime())
}
