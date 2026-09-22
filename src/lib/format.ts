import type { UptimeResponse } from '@/types/monitor.types'

/** "0s" / "45s" / "12m" / "3h 20m" / "2d 4h" — rather than a raw second count. */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return '0s'
  if (seconds < 60) return `${Math.round(seconds)}s`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours < 24) {
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return remainingHours ? `${days}d ${remainingHours}h` : `${days}d`
}

export function formatUptimePercentage(data: UptimeResponse | undefined): string {
  if (!data) return '…'

  return data.uptime_percentage === 100 ? '100' : data.uptime_percentage.toFixed(2)
}

/**
 * A monitor younger than the requested window has only been observed for part
 * of it. Saying "30-day uptime" over four hours of data overstates what the
 * number means, so the label follows the data.
 */
export function uptimeWindowLabel(data: UptimeResponse | undefined): string {
  if (!data) return '30-day uptime'

  // Tolerance: the observed window is always a hair under the requested one.
  if (data.observed_hours >= data.window_hours - 1) {
    const days = Math.round(data.window_hours / 24)
    return `${days}-day uptime`
  }

  if (data.observed_hours < 1) return 'Uptime since setup'

  if (data.observed_hours < 48) {
    return `Uptime, last ${Math.round(data.observed_hours)}h`
  }

  return `Uptime, last ${Math.floor(data.observed_hours / 24)}d`
}

/** "Every 30s" / "Every 5m" / "Every 1h" for an interval in seconds. */
export function formatInterval(seconds: number): string {
  if (seconds < 60) return `Every ${seconds}s`
  if (seconds < 3600) return `Every ${Math.round(seconds / 60)}m`
  return `Every ${Math.round(seconds / 3600)}h`
}

/** "just now" / "4m ago" / "2h ago" / "3d ago" */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diff)) return '—'
  const seconds = Math.round(diff / 1000)
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Whole days until an ISO timestamp; negative once it has passed. */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  if (Number.isNaN(diff)) return null
  return Math.floor(diff / 86_400_000)
}

/** Hostname for display, tolerating URLs stored before validation existed. */
export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}
