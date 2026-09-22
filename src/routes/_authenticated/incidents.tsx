import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAllIncidents } from '@/hooks/monitor.queries'
import { IncidentList } from '@/features/monitor/components/incident-list'
import { Page, PageHeader } from '@/components/ui/page-header'
import { Segmented } from '@/components/ui/segmented'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_authenticated/incidents')({
  component: IncidentsPage,
})

type IncidentFilter = 'all' | 'open'

function IncidentsPage() {
  const [openOnly, setOpenOnly] = useState(false)

  // One request for the whole workspace. This page used to fetch every
  // monitor and then issue a request per monitor, discarding the ones with
  // no incidents.
  const { data, isLoading, isError } = useAllIncidents(openOnly)

  const incidents = data?.incidents ?? []
  const openCount = incidents.filter((incident) => !incident.resolved_at).length

  return (
    <Page>
      <PageHeader
        title="Incidents"
        description="Every confirmed outage across this workspace, newest first."
        actions={
          <Segmented<IncidentFilter>
            aria-label="Filter incidents"
            value={openOnly ? 'open' : 'all'}
            onChange={(value) => setOpenOnly(value === 'open')}
            options={[
              { value: 'all', label: 'All' },
              { value: 'open', label: 'Open only' },
            ]}
          />
        }
      />

      {isError ? (
        <div className="card border-down/30 bg-down-soft p-4 text-sm text-down">
          Failed to load incidents. Please check your connection.
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.length > 0 && (
            <p className="text-[13px] text-muted-foreground">
              <span className="tabular">{incidents.length}</span>{' '}
              {incidents.length === 1 ? 'incident' : 'incidents'} ·{' '}
              <span className="tabular">{openCount}</span> open
            </p>
          )}

          <IncidentList
            incidents={incidents}
            showMonitor
            emptyTitle={openOnly ? 'Nothing is down' : 'No incidents recorded'}
            emptyHint={
              openOnly
                ? 'Every monitor in this workspace is currently healthy.'
                : 'Incidents appear here once a monitor fails enough checks to be confirmed down.'
            }
          />

          {incidents.length === 0 && !openOnly && (
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/dashboard" className="link font-medium">
                Go to the dashboard
              </Link>{' '}
              to add a monitor.
            </p>
          )}
        </div>
      )}
    </Page>
  )
}
