import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, MessageSquare, ShieldCheck } from 'lucide-react'
import { useAcknowledgeIncident } from '@/hooks/monitor.queries'
import { getApiErrorMessage } from '@/api/errors'
import { formatDateTime, formatDuration } from '@/lib/format'
import { humanizeRootCause } from '@/lib/status'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusDot } from '@/components/ui/status'
import { IncidentUpdates } from './incident-updates'
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

  // Updates are fetched per incident, so they load only when opened rather
  // than firing a request for every incident on the page.
  const [openUpdates, setOpenUpdates] = useState<number | null>(null)

  if (incidents.length === 0) {
    return <EmptyState icon={<ShieldCheck />} title={emptyTitle} description={emptyHint} />
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => {
        const resolved = incident.resolved_at !== null
        const label = monitorLabel(incident)
        const expanded = openUpdates === incident.id
        const rootCause = humanizeRootCause(incident.root_cause)

        return (
          <article
            key={incident.id}
            className={cn(
              'card border-l-[3px] p-5',
              resolved ? 'border-l-up' : 'border-l-down'
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <StatusDot tone={resolved ? 'up' : 'down'} live={!resolved} />
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {resolved ? 'Resolved' : 'Active outage'}
                  </span>
                  {showMonitor && label && (
                    <span className="block truncate text-[13px] text-muted-foreground">
                      {label}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Badge variant={resolved ? 'neutral' : 'down'} className="tabular">
                  {incident.duration_seconds !== null
                    ? formatDuration(incident.duration_seconds)
                    : 'Ongoing'}
                </Badge>

                {/* Acknowledging is open to members: the person who spots an
                    outage is not always the person who can reconfigure it. */}
                {!resolved && !incident.acknowledged_at && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      acknowledge.mutate(incident.id, {
                        onSuccess: () => toast.success('Incident acknowledged'),
                        onError: (error) =>
                          toast.error(getApiErrorMessage(error, 'Could not acknowledge')),
                      })
                    }
                    disabled={acknowledge.isPending}
                    loading={acknowledge.isPending && acknowledge.variables === incident.id}
                  >
                    Acknowledge
                  </Button>
                )}

                {incident.acknowledged_at && (
                  <span className="inline-flex items-center gap-1.5 px-1 text-[12px] font-medium text-up">
                    <CheckCircle2 className="size-3.5" />
                    Acknowledged
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setOpenUpdates((current) => (current === incident.id ? null : incident.id))
                  }
                  aria-expanded={expanded}
                  aria-controls={`incident-${incident.id}-updates`}
                >
                  <MessageSquare />
                  Updates
                </Button>
              </div>
            </div>

            <dl className="mt-4 grid gap-x-6 gap-y-3 text-[13px] sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="eyebrow">Started</dt>
                <dd className="mt-1 text-foreground">{formatDateTime(incident.started_at)}</dd>
              </div>

              {incident.resolved_at && (
                <div>
                  <dt className="eyebrow">Resolved</dt>
                  <dd className="mt-1 text-foreground">{formatDateTime(incident.resolved_at)}</dd>
                </div>
              )}

              {incident.affected_regions?.length > 1 && (
                <div>
                  <dt className="eyebrow">Seen from</dt>
                  <dd className="mt-1 text-foreground">{incident.affected_regions.join(', ')}</dd>
                </div>
              )}

              {(incident.root_cause || incident.failure_detail) && (
                <div className="sm:col-span-2 lg:col-span-4">
                  <dt className="eyebrow">Root cause</dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="down">{rootCause ?? 'Failure'}</Badge>
                    {incident.failure_detail && (
                      <span className="font-mono text-xs break-all text-muted-foreground">
                        {incident.failure_detail}
                      </span>
                    )}
                  </dd>
                </div>
              )}
            </dl>

            {expanded && (
              <div id={`incident-${incident.id}-updates`}>
                <IncidentUpdates incidentId={incident.id} />
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
