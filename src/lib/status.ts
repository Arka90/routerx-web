import type { Monitor, MonitorStatus } from '@/types/monitor.types'

export interface StatusPresentation {
  label: string
  /** Tailwind text colour class. */
  text: string
  /** Tailwind background class for the badge. */
  badge: string
  /** Tailwind background class for the dot. */
  dot: string
}

const PRESENTATION: Record<MonitorStatus | 'PAUSED', StatusPresentation> = {
  UP: {
    label: 'Operational',
    text: 'text-emerald-700 dark:text-emerald-500',
    badge: 'bg-emerald-50 dark:bg-emerald-500/10',
    dot: 'bg-emerald-500',
  },
  DOWN: {
    label: 'Outage',
    text: 'text-red-600 dark:text-red-500',
    badge: 'bg-red-50 dark:bg-red-500/10',
    dot: 'bg-red-500',
  },
  DEGRADED: {
    label: 'Degraded',
    text: 'text-amber-600 dark:text-amber-500',
    badge: 'bg-amber-50 dark:bg-amber-500/10',
    dot: 'bg-amber-500',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    text: 'text-sky-600 dark:text-sky-400',
    badge: 'bg-sky-50 dark:bg-sky-500/10',
    dot: 'bg-sky-500',
  },
  UNCONFIRMED: {
    label: 'Pending',
    text: 'text-neutral-500',
    badge: 'bg-neutral-100 dark:bg-neutral-900',
    dot: 'bg-neutral-300 dark:bg-neutral-600',
  },
  PAUSED: {
    label: 'Paused',
    text: 'text-neutral-500',
    badge: 'bg-neutral-100 dark:bg-neutral-900',
    dot: 'bg-neutral-300 dark:bg-neutral-600',
  },
}

/**
 * Paused and in-maintenance both override the last observed status: showing
 * "Outage" for something deliberately switched off is alarming and wrong.
 */
export function presentStatus(monitor: Monitor): StatusPresentation {
  if (monitor.paused) return PRESENTATION.PAUSED
  if (monitor.in_maintenance) return PRESENTATION.MAINTENANCE
  return PRESENTATION[monitor.confirmed_status] ?? PRESENTATION.UNCONFIRMED
}

/** Turns HTTP_5XX into "Http 5xx" for display. */
export function humanizeRootCause(rootCause: string | null): string | null {
  if (!rootCause) return null

  const words = rootCause.toLowerCase().split('_')

  return words
    .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ')
}
