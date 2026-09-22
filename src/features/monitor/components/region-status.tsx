import { formatRelative } from '@/lib/format'
import { humanizeRootCause } from '@/lib/status'
import { StatusDot, type StatusTone } from '@/components/ui/status'
import type { MonitorRegionState, Region } from '@/types/status.types'

const TONE: Record<MonitorRegionState['status'], StatusTone> = {
  UP: 'up',
  DOWN: 'down',
  DEGRADED: 'degraded',
  UNCONFIRMED: 'unknown',
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
    <section className="card space-y-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">By region</h3>
        <span className="tabular text-xs text-muted-foreground">
          {confirmations} of {states.length} must agree
        </span>
      </div>

      {belowQuorum && (
        <p className="rounded-lg border border-degraded/30 bg-degraded-soft px-3 py-2 text-[13px] text-degraded">
          {failing.length === 1
            ? `Only ${nameFor(failing[0].region)} can't reach this endpoint.`
            : `${failing.length} regions can't reach this endpoint.`}{' '}
          That's below the confirmation threshold, so no incident has been opened — this
          usually means a routing problem rather than an outage.
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {states.map((state) => {
          const failing = state.status === 'DOWN' || state.status === 'DEGRADED'

          return (
            <div
              key={state.region}
              className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface-2/60 px-3 py-2.5"
            >
              <div className="min-w-0">
                <span className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                  <StatusDot tone={TONE[state.status]} live={failing} />
                  <span className="truncate">{nameFor(state.region)}</span>
                </span>

                <span className="mt-0.5 block pl-4 text-xs text-muted-foreground">
                  {LABEL[state.status]}
                  {state.last_root_cause &&
                    state.status !== 'UP' &&
                    ` · ${humanizeRootCause(state.last_root_cause)}`}
                </span>
              </div>

              {state.last_checked_at && (
                <span
                  className="shrink-0 text-[11px] text-subtle-foreground"
                  title={new Date(state.last_checked_at).toLocaleString()}
                >
                  {formatRelative(state.last_checked_at)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
