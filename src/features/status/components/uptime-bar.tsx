import { cn } from '@/lib/utils'

interface UptimeBarProps {
  history: Array<{ date: string; uptime: number | null }>
  /** Hide the "90 days ago / Today" axis when several bars share one. */
  showAxis?: boolean
}

/**
 * Ninety days at a glance.
 *
 * A null day means the monitor did not exist yet, which is drawn as an empty
 * slot rather than as an outage — showing 89 red days for a component added
 * yesterday would be a lie in the most visible place the product has.
 */
export function UptimeBar({ history, showAxis = true }: UptimeBarProps) {
  if (history.length === 0) return null

  const known = history.filter((day) => day.uptime !== null)

  return (
    <div>
      <div className="flex h-7 items-stretch gap-px sm:gap-[2px]">
        {history.map((day) => (
          <div
            key={day.date}
            title={
              day.uptime === null
                ? `${day.date} — not monitored`
                : `${day.date} — ${day.uptime.toFixed(2)}%`
            }
            className={cn(
              'flex-1 rounded-[2px] transition-opacity hover:opacity-70',
              day.uptime === null
                ? 'bg-surface-3'
                : day.uptime >= 99.9
                  ? 'bg-up'
                  : day.uptime >= 95
                    ? 'bg-degraded'
                    : 'bg-down'
            )}
          />
        ))}
      </div>

      {showAxis && (
        <div className="mt-1.5 flex justify-between text-[11px] text-subtle-foreground">
          <span>{known.length > 0 ? `${known.length} days ago` : ''}</span>
          <span>Today</span>
        </div>
      )}
    </div>
  )
}
