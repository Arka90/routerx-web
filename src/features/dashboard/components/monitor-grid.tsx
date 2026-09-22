import { Activity, SearchX } from 'lucide-react'
import { useCanManage } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import type { Monitor } from '@/types/monitor.types'
import { CreateMonitorModal } from './create-monitor-modal'
import { MonitorCard } from './monitor-card'

interface MonitorGridProps {
  monitors: Monitor[]
  isLoading: boolean
  isError: boolean
  /** True when a search or filter may be hiding monitors that do exist. */
  filtered?: boolean
  onClearFilters?: () => void
}

const GRID_CLASS = 'grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3'

function MonitorCardSkeleton() {
  return (
    <div className="card flex min-h-[152px] flex-col justify-between p-5" aria-hidden>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </div>
  )
}

export function MonitorGrid({
  monitors,
  isLoading,
  isError,
  filtered = false,
  onClearFilters,
}: MonitorGridProps) {
  const canManage = useCanManage()

  if (isError) {
    return (
      <div className="card border-down/30 bg-down-soft p-4 text-sm text-down">
        Failed to load monitors. Please check your connection.
      </div>
    )
  }

  if (isLoading && !monitors.length) {
    return (
      <div className={GRID_CLASS}>
        {Array.from({ length: 6 }).map((_, index) => (
          <MonitorCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (monitors.length === 0) {
    if (filtered) {
      return (
        <EmptyState
          icon={<SearchX />}
          title="No monitors match"
          description="Try a different search, or clear the filter to see every monitor."
          action={
            onClearFilters && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      )
    }

    // CreateMonitorModal renders nothing for members, so only offer the
    // action when it will actually appear — otherwise point at an admin.
    return (
      <EmptyState
        icon={<Activity />}
        title="No monitors yet"
        description={
          canManage
            ? 'Add the first endpoint to start tracking its uptime, latency and certificate. Checks begin within a minute.'
            : 'Nothing is being watched in this workspace yet. Ask an admin to add the first monitor.'
        }
        action={canManage ? <CreateMonitorModal /> : undefined}
      />
    )
  }

  return (
    <div className={GRID_CLASS}>
      {monitors.map((monitor) => (
        <MonitorCard key={monitor.id} monitor={monitor} />
      ))}
    </div>
  )
}
