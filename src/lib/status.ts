import type { Monitor, MonitorStatus } from '@/types/monitor.types'
import type { PublicComponentStatus } from '@/types/status.types'
import type { StatusTone } from '@/components/ui/status'

export interface StatusPresentation {
  label: string
  tone: StatusTone
  /** True when the state is happening right now and deserves a pulse. */
  live: boolean
}

const PRESENTATION: Record<MonitorStatus | 'PAUSED', StatusPresentation> = {
  UP: { label: 'Operational', tone: 'up', live: false },
  DOWN: { label: 'Outage', tone: 'down', live: true },
  DEGRADED: { label: 'Degraded', tone: 'degraded', live: true },
  MAINTENANCE: { label: 'Maintenance', tone: 'maintenance', live: false },
  UNCONFIRMED: { label: 'Pending', tone: 'unknown', live: false },
  PAUSED: { label: 'Paused', tone: 'paused', live: false },
}

/**
 * Paused and in-maintenance both override the last observed status: showing
 * "Outage" for something deliberately switched off is alarming and wrong.
 */
export function presentStatus(monitor: Pick<Monitor, 'paused' | 'in_maintenance' | 'confirmed_status'>): StatusPresentation {
  if (monitor.paused) return PRESENTATION.PAUSED
  if (monitor.in_maintenance) return PRESENTATION.MAINTENANCE
  return PRESENTATION[monitor.confirmed_status] ?? PRESENTATION.UNCONFIRMED
}

export const PUBLIC_STATUS: Record<PublicComponentStatus, StatusPresentation> = {
  operational: { label: 'Operational', tone: 'up', live: false },
  degraded: { label: 'Degraded performance', tone: 'degraded', live: true },
  outage: { label: 'Outage', tone: 'down', live: true },
  maintenance: { label: 'Under maintenance', tone: 'maintenance', live: false },
  unknown: { label: 'Not monitored', tone: 'paused', live: false },
}

/** Turns HTTP_5XX into "HTTP 5xx", TLS_HANDSHAKE_FAILED into "TLS handshake failed". */
export function humanizeRootCause(rootCause: string | null): string | null {
  if (!rootCause) return null

  const ACRONYMS = new Set(['dns', 'tcp', 'tls', 'http', 'ssl'])

  return rootCause
    .toLowerCase()
    .split('_')
    .map((word, index) => {
      if (ACRONYMS.has(word)) return word.toUpperCase()
      if (/^\dxx$/.test(word)) return word
      return index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
    })
    .join(' ')
}

/** Short explanation of each classifier outcome, for tooltips and legends. */
export const ROOT_CAUSE_HELP: Record<string, string> = {
  DNS_FAILURE: 'The hostname did not resolve.',
  TCP_CONNECTION_FAILED: 'Nothing accepted the connection on that port.',
  TLS_HANDSHAKE_FAILED: 'The certificate was rejected or the handshake failed.',
  HTTP_5XX: 'The server answered with a 5xx status.',
  HTTP_4XX: 'The server answered with a 4xx status.',
  ASSERTION_FAILED: 'The status was fine but the body assertion did not match.',
  SLOW_RESPONSE: 'It responded, but above the slow threshold.',
  TIMEOUT: 'No response before the monitor timeout.',
  REDIRECT_LOOP: 'Still redirecting after five hops.',
  BLOCKED_TARGET: 'Resolved to a private or reserved address and was refused.',
}
