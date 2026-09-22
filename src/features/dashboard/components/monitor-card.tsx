import { Link } from '@tanstack/react-router'
import { Globe, Lock, PauseCircle, Timer } from 'lucide-react'
import { useUptime } from '@/hooks/monitor.queries'
import {
  daysUntil,
  formatDate,
  formatInterval,
  formatUptimePercentage,
  hostnameOf,
  uptimeWindowLabel,
} from '@/lib/format'
import { presentStatus } from '@/lib/status'
import { cn } from '@/lib/utils'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { StatusBadge, StatusDot } from '@/components/ui/status'
import type { Monitor } from '@/types/monitor.types'

/** Certificate chip colour: red inside a week, amber inside a month. */
function tlsVariant(days: number): BadgeVariant {
  if (days < 7) return 'down'
  if (days < 30) return 'degraded'
  return 'neutral'
}

export function MonitorCard({ monitor }: { monitor: Monitor }) {
  const { data: uptimeData } = useUptime(monitor.id)
  const status = presentStatus(monitor)
  const isDown = !monitor.paused && !monitor.in_maintenance && monitor.confirmed_status === 'DOWN'

  // A monitor stored before URL validation existed can still be unparseable,
  // and an exception here would unmount the entire grid, not just this card.
  // hostnameOf falls back to the raw string instead of throwing.
  const hostname = hostnameOf(monitor.url)

  const tlsDays = daysUntil(monitor.tls_expiry_at)

  return (
    <Link
      to="/monitor/$monitorId"
      params={{ monitorId: monitor.id.toString() }}
      className={cn(
        'card card-hover group flex min-h-[152px] flex-col gap-4 p-5',
        'focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none',
        isDown && 'border-down/40'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <StatusDot tone={status.tone} live={status.live} />
            <span className="truncate">{monitor.name ?? hostname}</span>
          </h3>
          <p className="mt-1 truncate font-mono text-[12px] text-muted-foreground">
            <span className="mr-1.5 text-subtle-foreground">{monitor.method}</span>
            {monitor.url}
          </p>
        </div>

        <StatusBadge
          tone={status.tone}
          label={status.label}
          live={status.live}
          className="shrink-0"
        />
      </div>

      <div className="mt-auto flex items-end justify-between gap-3">
        <div className="min-w-0">
          <span className="eyebrow block truncate">{uptimeWindowLabel(uptimeData)}</span>
          <span className="tabular mt-1 block text-xl leading-none font-semibold tracking-tight text-foreground">
            {uptimeData ? `${formatUptimePercentage(uptimeData)}%` : '…'}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {monitor.paused && (
            <Badge variant="paused" title="Checks are paused">
              <PauseCircle className="size-3" />
              Paused
            </Badge>
          )}

          <Badge variant="neutral" title="Check interval">
            <Timer className="size-3" />
            {formatInterval(monitor.interval_seconds)}
          </Badge>

          {monitor.regions.length > 0 && (
            <Badge variant="neutral" title="Checked from these regions">
              <Globe className="size-3" />
              {monitor.regions.length} {monitor.regions.length === 1 ? 'region' : 'regions'}
            </Badge>
          )}

          {tlsDays !== null && (
            <Badge
              variant={tlsVariant(tlsDays)}
              className="tabular"
              title={`TLS certificate expires ${formatDate(monitor.tls_expiry_at)}`}
            >
              <Lock className="size-3" />
              {tlsDays < 0 ? 'TLS expired' : `TLS ${tlsDays}d`}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}
