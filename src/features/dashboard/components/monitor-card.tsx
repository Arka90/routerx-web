import { Link } from '@tanstack/react-router'
import { Lock, PauseCircle } from 'lucide-react'
import { useUptime } from '@/hooks/monitor.queries'
import { formatUptimePercentage, uptimeWindowLabel } from '@/lib/format'
import { presentStatus } from '@/lib/status'
import type { Monitor } from '@/types/monitor.types'

export function MonitorCard({ monitor }: { monitor: Monitor }) {
  const { data: uptimeData } = useUptime(monitor.id)
  const status = presentStatus(monitor)
  const isDown = !monitor.paused && !monitor.in_maintenance && monitor.confirmed_status === 'DOWN'

  // A monitor stored before URL validation existed can still be unparseable,
  // and an exception here would unmount the entire grid, not just this card.
  let hostname = monitor.url
  try {
    hostname = new URL(monitor.url).hostname
  } catch {
    hostname = monitor.url
  }

  return (
    <Link
      to="/monitor/$monitorId"
      params={{ monitorId: monitor.id.toString() }}
      className="group relative flex min-h-[160px] cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-[#0A0A0A] dark:hover:border-neutral-700"
    >
      {isDown && (
        <span className="absolute -left-[1px] bottom-0 top-0 w-[2px] rounded-l-md bg-red-500" />
      )}

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="flex items-center gap-2 truncate text-[14px] font-medium text-neutral-900 dark:text-neutral-100">
            {!isDown && <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} />}
            <span className="truncate">{monitor.name ?? hostname}</span>
          </h3>
          <p className="truncate text-[13px] text-neutral-500">
            <span className="mr-1.5 font-mono text-[11px] uppercase text-neutral-400">
              {monitor.method}
            </span>
            {monitor.url}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[12px] font-medium ${status.badge} ${status.text}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            {uptimeWindowLabel(uptimeData)}
          </span>
          <span className="text-xl font-medium leading-none tracking-tight text-neutral-900 dark:text-neutral-100">
            {uptimeData ? `${formatUptimePercentage(uptimeData)}%` : '…'}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {monitor.paused && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
              <PauseCircle className="h-3 w-3" />
              Checks paused
            </span>
          )}

          {monitor.tls_expiry_at && (
            <span
              className="flex items-center gap-1.5 rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50"
              title="TLS certificate expiry"
            >
              <Lock className="h-3 w-3" />
              TLS{' '}
              {new Date(monitor.tls_expiry_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
