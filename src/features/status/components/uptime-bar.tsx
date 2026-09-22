import { cn } from '@/lib/utils'

interface UptimeBarProps {
  history: Array<{ date: string; uptime: number | null }>
}

/**
 * Ninety days at a glance.
 *
 * A null day means the monitor did not exist yet, which is drawn as an empty
 * slot rather than as an outage — showing 89 red days for a component added
 * yesterday would be a lie in the most visible place the product has.
 */
export function UptimeBar({ history }: UptimeBarProps) {
  if (history.length === 0) return null

  const known = history.filter((day) => day.uptime !== null)
  const first = known[0]
  const last = known[known.length - 1]

  return (
    <div>
      <div className="flex h-8 items-stretch gap-[2px]">
        {history.map((day) => (
          <div
            key={day.date}
            title={
              day.uptime === null
                ? `${day.date} — not monitored`
                : `${day.date} — ${day.uptime.toFixed(2)}%`
            }
            className={cn(
              'flex-1 rounded-[1px] transition-opacity hover:opacity-70',
              day.uptime === null
                ? 'bg-neutral-100 dark:bg-neutral-900'
                : day.uptime >= 99.9
                  ? 'bg-emerald-500'
                  : day.uptime >= 95
                    ? 'bg-amber-400'
                    : 'bg-red-500'
            )}
          />
        ))}
      </div>

      <div className="mt-1.5 flex justify-between text-[11px] text-neutral-400">
        <span>{first ? `${known.length} days ago` : ''}</span>
        <span>{last ? 'Today' : ''}</span>
      </div>
    </div>
  )
}
