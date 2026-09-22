import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
import { useAcknowledgeIncident } from '@/hooks/monitor.queries'
import { getApiErrorMessage } from '@/api/errors'
import { formatDuration } from '@/lib/format'
import { humanizeRootCause } from '@/lib/status'
import type { Incident, OrgIncident } from '@/types/monitor.types'

interface IncidentListProps {
  incidents: Array<Incident | OrgIncident>
  /** Shows which monitor each incident belongs to, for the workspace view. */
  showMonitor?: boolean
  emptyTitle?: string
  emptyHint?: string
}

function monitorLabel(incident: Incident | OrgIncident): string | null {
  if (!('monitor_url' in incident)) return null
  return incident.monitor_name ?? incident.monitor_url
}

export function IncidentList({
  incidents,
  showMonitor = false,
  emptyTitle = 'No incident history',
  emptyHint = 'No downtime has been recorded yet.',
}: IncidentListProps) {
  const acknowledge = useAcknowledgeIncident()

  if (incidents.length === 0) {
    return (
      <div className="border border-dashed border-neutral-200 bg-neutral-50/50 py-24 text-center dark:border-neutral-800 dark:bg-[#111]">
        <p className="mb-2 text-base font-medium text-neutral-900 dark:text-neutral-200">
          {emptyTitle}
        </p>
        <p className="text-sm text-neutral-500">{emptyHint}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => {
        const resolved = incident.resolved_at !== null
        const label = monitorLabel(incident)

        return (
          <div
            key={incident.id}
            className="border border-neutral-200 bg-white p-6 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:hover:border-neutral-700"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    resolved ? 'bg-emerald-500' : 'animate-pulse bg-red-500'
                  }`}
                />
                <div className="min-w-0">
                  <span className="block text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
                    {resolved ? 'Resolved' : 'Active outage'}
                  </span>
                  {showMonitor && label && (
                    <span className="block truncate text-[13px] text-neutral-500">{label}</span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="bg-neutral-100 px-3 py-1 text-[12px] font-medium uppercase tracking-widest text-neutral-500 dark:bg-[#111]">
                  {incident.duration_seconds !== null
                    ? formatDuration(incident.duration_seconds)
                    : 'Ongoing'}
                </span>

                {/* Acknowledging is open to members: the person who spots an
                    outage is not always the person who can reconfigure it. */}
                {!resolved && !incident.acknowledged_at && (
                  <button
                    onClick={() =>
                      acknowledge.mutate(incident.id, {
                        onSuccess: () => toast.success('Incident acknowledged'),
                        onError: (error) =>
                          toast.error(getApiErrorMessage(error, 'Could not acknowledge')),
                      })
                    }
                    disabled={acknowledge.isPending}
                    className="rounded-md border border-neutral-200 px-3 py-1 text-[12px] font-medium transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                  >
                    Acknowledge
                  </button>
                )}

                {incident.acknowledged_at && (
                  <span className="flex items-center gap-1.5 text-[12px] text-emerald-600 dark:text-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Acknowledged
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-[14px] md:grid-cols-2">
              <div className="border-l-2 border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-[#111]">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Started
                </p>
                <p className="text-neutral-900 dark:text-neutral-300">
                  {new Date(incident.started_at).toLocaleString()}
                </p>
              </div>

              {incident.resolved_at && (
                <div className="border-l-2 border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-[#111]">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Resolved
                  </p>
                  <p className="text-neutral-900 dark:text-neutral-300">
                    {new Date(incident.resolved_at).toLocaleString()}
                  </p>
                </div>
              )}

              {(incident.root_cause || incident.failure_detail) && (
                <div className="col-span-1 border-l-2 border-red-500/50 bg-red-50 p-4 dark:bg-red-900/10 md:col-span-2">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-red-800/60 dark:text-red-400/60">
                    {humanizeRootCause(incident.root_cause) ?? 'Failure'}
                  </p>
                  {incident.failure_detail && (
                    <p className="font-mono text-xs text-red-900 dark:text-red-400">
                      {incident.failure_detail}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
