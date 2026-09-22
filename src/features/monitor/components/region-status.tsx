import { humanizeRootCause } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { MonitorRegionState, Region } from '@/types/status.types'

const DOT: Record<MonitorRegionState['status'], string> = {
  UP: 'bg-emerald-500',
  DOWN: 'bg-red-500',
  DEGRADED: 'bg-amber-500',
  UNCONFIRMED: 'bg-neutral-300 dark:bg-neutral-600',
}

const LABEL: Record<MonitorRegionState['status'], string> = {
  UP: 'Reachable',
  DOWN: 'Unreachable',
  DEGRADED: 'Slow',
  UNCONFIRMED: 'Waiting for first check',
}

interface RegionStatusProps {
  states: MonitorRegionState[]
  regions: Region[]
  confirmations: number
}

/**
 * What each vantage point sees.
 *
 * This is the only place a single-region failure is visible: by design it
 * never reaches the monitor's overall status when confirmation is required,
 * which is exactly why it needs somewhere to be shown.
 */
export function RegionStatus({ states, regions, confirmations }: RegionStatusProps) {
  if (states.length <= 1) return null

  const nameFor = (code: string) =>
    regions.find((region) => region.code === code)?.name ?? code

  const failing = states.filter(
    (state) => state.status === 'DOWN' || state.status === 'DEGRADED'
  )

  const belowQuorum = failing.length > 0 && failing.length < confirmations

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          By region
        </h3>
        <span className="text-[12px] text-neutral-500">
          {confirmations} of {states.length} must agree before alerting
        </span>
      </div>

      {belowQuorum && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-[13px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-500">
          {failing.length === 1
            ? `Only ${nameFor(failing[0].region)} can't reach this endpoint.`
            : `${failing.length} regions can't reach this endpoint.`}{' '}
          That's below the confirmation threshold, so no incident has been opened — this
          usually means a routing problem rather than an outage.
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {states.map((state) => (
          <div
            key={state.region}
            className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <div className="min-w-0">
              <span className="flex items-center gap-2 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                <span className={cn('h-2 w-2 shrink-0 rounded-full', DOT[state.status])} />
                {nameFor(state.region)}
              </span>

              <span className="mt-0.5 block text-[12px] text-neutral-500">
                {LABEL[state.status]}
                {state.last_root_cause &&
                  state.status !== 'UP' &&
                  ` · ${humanizeRootCause(state.last_root_cause)}`}
              </span>
            </div>

            {state.last_checked_at && (
              <span className="shrink-0 text-[11px] text-neutral-400">
                {new Date(state.last_checked_at).toLocaleTimeString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
