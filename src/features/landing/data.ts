import {
  Activity,
  Bell,
  CalendarClock,
  FileText,
  Globe,
  KeyRound,
  Layers,
  Lock,
  MapPinned,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { StatusTone } from '@/components/ui/status'

/**
 * Everything the product actually does, in the order it is worth explaining.
 * If a feature is not shipped in routerx-api it does not belong here.
 */
export interface Feature {
  icon: LucideIcon
  title: string
  description: string
  /** Wide tiles get a small visual. */
  visual?: 'pipeline' | 'regions' | 'channels' | 'assertion' | 'statuspage' | 'roles'
}

export const FEATURES: Feature[] = [
  {
    icon: SlidersHorizontal,
    title: 'Checks you configure, not just ping',
    description:
      'Method, headers, body, expected status codes, timeout, redirect policy and an interval from 30 seconds to an hour. A 404 counts as down unless you say otherwise.',
    visual: 'assertion',
  },
  {
    icon: Layers,
    title: 'Per-layer timing on every check',
    description:
      'DNS, TCP, TLS and time-to-first-byte are measured separately and charted live, so a slow site tells you which layer got slow.',
    visual: 'pipeline',
  },
  {
    icon: Search,
    title: 'Root-cause classification',
    description:
      'Failures are named, not counted. DNS failure, TCP refused, TLS handshake, HTTP 4xx/5xx, timeout, redirect loop or a failed body assertion.',
  },
  {
    icon: ShieldCheck,
    title: 'Content assertions',
    description:
      'Assert the body contains a string, does not contain one, or that a JSON path equals a value. Catches the 200 that renders an error page.',
  },
  {
    icon: MapPinned,
    title: 'Multi-region confirmation',
    description:
      'Run workers anywhere. Choose how many regions must agree before an incident opens, so one bad route never pages the whole team. Recovery needs every region healthy.',
    visual: 'regions',
  },
  {
    icon: Activity,
    title: 'Incidents that mean something',
    description:
      'Opened only after consecutive failures, deduplicated, acknowledgeable by anyone on the team, and re-notified on a cadence you set until someone picks it up.',
  },
  {
    icon: Zap,
    title: 'Latency alerts',
    description:
      'Set a slow threshold per monitor. A site that keeps answering above it is marked degraded and treated as an incident, not a success.',
  },
  {
    icon: Lock,
    title: 'TLS certificate expiry',
    description:
      'Every HTTPS check reads the certificate and counts the days left. You hear about it at 30, 14, 7 and 1 day, not the morning after.',
  },
  {
    icon: CalendarClock,
    title: 'Maintenance windows',
    description:
      'Schedule a window and checks keep running while alerts stay quiet. Status pages show maintenance instead of an outage.',
  },
  {
    icon: Bell,
    title: 'Alerts where you already are',
    description:
      'Email, Slack, Discord or a signed webhook, routed per monitor or per workspace. Every delivery attempt is logged, so "why wasn\'t I paged" has an answer.',
    visual: 'channels',
  },
  {
    icon: Globe,
    title: 'Public status pages',
    description:
      'A page per workspace with 90 days of per-component uptime, incident history with posted updates, and double-opt-in email subscribers.',
    visual: 'statuspage',
  },
  {
    icon: Users,
    title: 'Team workspaces',
    description:
      'Invite teammates by email as owner, admin or read-only member. Members can acknowledge an incident without being able to reconfigure it.',
    visual: 'roles',
  },
  {
    icon: FileText,
    title: 'Weekly reliability report',
    description:
      'Uptime, downtime, incident count and longest outage per monitor, mailed to the workspace every week.',
  },
  {
    icon: KeyRound,
    title: 'Passwordless, revocable sessions',
    description:
      'Sign in with a one-time code. See every device signed in to your account and sign any of them out, instantly.',
  },
]

export const ROOT_CAUSES: Array<{ code: string; meaning: string; layer: string }> = [
  { code: 'DNS_FAILURE', meaning: 'The hostname did not resolve', layer: 'DNS' },
  { code: 'TCP_CONNECTION_FAILED', meaning: 'Nothing accepted the connection', layer: 'TCP' },
  { code: 'TLS_HANDSHAKE_FAILED', meaning: 'Certificate rejected or handshake failed', layer: 'TLS' },
  { code: 'HTTP_5XX', meaning: 'The server answered with a 5xx', layer: 'HTTP' },
  { code: 'HTTP_4XX', meaning: 'The server answered with a 4xx', layer: 'HTTP' },
  { code: 'TIMEOUT', meaning: 'No response before the monitor timeout', layer: 'HTTP' },
  { code: 'REDIRECT_LOOP', meaning: 'Still redirecting after five hops', layer: 'HTTP' },
  { code: 'SLOW_RESPONSE', meaning: 'Responded, but above the slow threshold', layer: 'Latency' },
  { code: 'ASSERTION_FAILED', meaning: 'Status fine, body did not match', layer: 'Body' },
  { code: 'BLOCKED_TARGET', meaning: 'Resolved to a private address; refused', layer: 'Safety' },
]

export const PIPELINE: Array<{ stage: string; label: string; ms: number; detail: string }> = [
  { stage: 'DNS', label: 'Resolve', ms: 11, detail: 'A/AAAA lookup, timed' },
  { stage: 'TCP', label: 'Connect', ms: 23, detail: 'SYN → ACK to the origin' },
  { stage: 'TLS', label: 'Handshake', ms: 58, detail: 'Cert read, expiry recorded' },
  { stage: 'HTTP', label: 'Request', ms: 184, detail: 'TTFB and status code' },
  { stage: 'Assert', label: 'Verify', ms: 2, detail: 'Codes, body, JSON path' },
]

/** Fixture data for the product snapshots on the landing page. */
export interface SnapshotMonitor {
  name: string
  url: string
  method: string
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'MAINTENANCE'
  uptime: string
  interval: string
  tlsDays: number
  regions: number
}

export const SNAPSHOT_TONE: Record<
  SnapshotMonitor['status'],
  { tone: StatusTone; label: string; live: boolean }
> = {
  UP: { tone: 'up', label: 'Operational', live: false },
  DOWN: { tone: 'down', label: 'Outage', live: true },
  DEGRADED: { tone: 'degraded', label: 'Degraded', live: true },
  MAINTENANCE: { tone: 'maintenance', label: 'Maintenance', live: false },
}

export const SNAPSHOT_MONITORS: SnapshotMonitor[] = [
  {
    name: 'Checkout API',
    url: 'https://api.acme.dev/health',
    method: 'GET',
    status: 'UP',
    uptime: '100',
    interval: 'Every 30s',
    tlsDays: 61,
    regions: 3,
  },
  {
    name: 'Marketing site',
    url: 'https://acme.dev/',
    method: 'GET',
    status: 'UP',
    uptime: '99.98',
    interval: 'Every 1m',
    tlsDays: 24,
    regions: 3,
  },
  {
    name: 'Auth service',
    url: 'https://auth.acme.dev/ready',
    method: 'POST',
    status: 'DEGRADED',
    uptime: '99.71',
    interval: 'Every 30s',
    tlsDays: 88,
    regions: 2,
  },
  {
    name: 'EU edge',
    url: 'https://eu.acme.dev/ping',
    method: 'HEAD',
    status: 'DOWN',
    uptime: '98.42',
    interval: 'Every 30s',
    tlsDays: 5,
    regions: 3,
  },
  {
    name: 'Webhook relay',
    url: 'https://hooks.acme.dev/',
    method: 'GET',
    status: 'MAINTENANCE',
    uptime: '99.95',
    interval: 'Every 5m',
    tlsDays: 40,
    regions: 1,
  },
  {
    name: 'Docs',
    url: 'https://docs.acme.dev/',
    method: 'GET',
    status: 'UP',
    uptime: '100',
    interval: 'Every 5m',
    tlsDays: 120,
    regions: 1,
  },
]

/** Deterministic pseudo-random so the snapshot is identical on every render. */
export function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

/** 90 days of uptime, mostly perfect with a couple of dips. */
export function uptimeHistory(seed: number, dips: number[] = []): Array<number | null> {
  const random = seeded(seed)
  return Array.from({ length: 90 }, (_, index) => {
    if (index < 6) return null
    if (dips.includes(index)) return 92 + random() * 5
    return random() > 0.96 ? 99.5 + random() * 0.4 : 100
  })
}

/** A plausible series of layered timings for the response chart. */
export function probeSeries(seed: number, points = 48) {
  const random = seeded(seed)
  return Array.from({ length: points }, (_, index) => {
    const spike = index === 17 || index === 33 ? 90 : 0
    const dns = 8 + random() * 8
    const tcp = 18 + random() * 10
    const tls = 44 + random() * 18
    const ttfb = 150 + random() * 55 + spike
    return { dns, tcp, tls, ttfb }
  })
}
