
import { cn } from '@/lib/utils'
import { Badge, type BadgeVariant } from './badge'

export type StatusTone = 'up' | 'down' | 'degraded' | 'maintenance' | 'paused' | 'unknown'

const DOT_CLASS: Record<StatusTone, string> = {
  up: 'bg-up',
  down: 'bg-down',
  degraded: 'bg-degraded',
  maintenance: 'bg-maintenance',
  paused: 'bg-paused',
  unknown: 'bg-unknown',
}

/** A coloured dot; `live` adds a slow radar pulse for states that are "now". */
function StatusDot({
  tone,
  live = false,
  className,
}: {
  tone: StatusTone
  live?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden
      data-live={live}
      className={cn('status-dot', DOT_CLASS[tone], className)}
    />
  )
}

function StatusBadge({
  tone,
  label,
  live,
  size,
  className,
}: {
  tone: StatusTone
  label: string
  live?: boolean
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  return (
    <Badge variant={tone as BadgeVariant} size={size} className={className}>
      <StatusDot tone={tone} live={live} className="size-1.5" />
      {label}
    </Badge>
  )
}

export { StatusDot, StatusBadge }
