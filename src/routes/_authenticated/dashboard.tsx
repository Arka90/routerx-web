import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useAllIncidents, useMonitors } from '@/hooks/monitor.queries'
import { presentStatus } from '@/lib/status'
import { Page } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header'
import { MonitorGrid } from '@/features/dashboard/components/monitor-grid'
import type { Monitor } from '@/types/monitor.types'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

type MonitorFilter = 'all' | 'operational' | 'attention' | 'paused'

/**
 * Buckets follow presentStatus so the filter agrees with the badge on each
 * card: a paused monitor is "paused" even if its last observed status was
 * DOWN, and maintenance / pending monitors only show under "All".
 */
function bucketOf(monitor: Monitor): Exclude<MonitorFilter, 'all'> | null {
  const { tone } = presentStatus(monitor)
  if (tone === 'paused') return 'paused'
  if (tone === 'up') return 'operational'
  if (tone === 'down' || tone === 'degraded') return 'attention'
  return null
}

function DashboardPage() {
  const { data: monitors = [], isLoading, isError } = useMonitors()

  // The same query the sidebar badge uses, so both numbers always agree.
  const { data: openIncidents, isLoading: isIncidentsLoading } = useAllIncidents(true)
  const openIncidentCount = openIncidents?.incidents.length ?? 0

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<MonitorFilter>('all')

  const counts = useMemo(() => {
    const result = { all: monitors.length, operational: 0, attention: 0, paused: 0 }
    for (const monitor of monitors) {
      const bucket = bucketOf(monitor)
      if (bucket) result[bucket] += 1
    }
    return result
  }, [monitors])

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return monitors.filter((monitor) => {
      if (filter !== 'all' && bucketOf(monitor) !== filter) return false
      if (!needle) return true
      return (
        (monitor.name ?? '').toLowerCase().includes(needle) ||
        monitor.url.toLowerCase().includes(needle)
      )
    })
  }, [monitors, search, filter])

  const filtering = search.trim() !== '' || filter !== 'all'

  return (
    <Page>
      <DashboardHeader />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Monitors" value={counts.all} loading={isLoading} />
        <StatCard label="Operational" value={counts.operational} tone="up" loading={isLoading} />
        <StatCard
          label="Needs attention"
          value={counts.attention}
          tone={counts.attention > 0 ? 'down' : 'default'}
          hint="Down or degraded right now"
          loading={isLoading}
        />
        <StatCard
          label="Open incidents"
          value={openIncidentCount}
          tone={openIncidentCount > 0 ? 'down' : 'default'}
          hint={
            <Link to="/incidents" className="link">
              View incidents
            </Link>
          }
          loading={isIncidentsLoading}
        />
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or URL"
              aria-label="Search monitors"
              className="pl-9"
            />
          </div>

          <Segmented
            aria-label="Filter monitors"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: counts.all },
              { value: 'operational', label: 'Operational', count: counts.operational },
              { value: 'attention', label: 'Attention', count: counts.attention },
              { value: 'paused', label: 'Paused', count: counts.paused },
            ]}
          />
        </div>

        <MonitorGrid
          monitors={visible}
          isLoading={isLoading}
          isError={isError}
          filtered={filtering}
          onClearFilters={() => {
            setSearch('')
            setFilter('all')
          }}
        />
      </section>
    </Page>
  )
}
