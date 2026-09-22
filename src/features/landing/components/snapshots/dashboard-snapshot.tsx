import { Plus, Search } from 'lucide-react'
import { SNAPSHOT_MONITORS } from '../../data'
import { MiniMonitorCard, MiniSidebar, MiniStat } from './shared'

export function DashboardSnapshot() {
  const up = SNAPSHOT_MONITORS.filter((monitor) => monitor.status === 'UP').length
  const attention = SNAPSHOT_MONITORS.filter(
    (monitor) => monitor.status === 'DOWN' || monitor.status === 'DEGRADED'
  ).length

  return (
    <div className="flex min-h-[420px] text-left">
      <MiniSidebar />
      <div className="min-w-0 flex-1 space-y-4 p-4 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-base font-semibold tracking-tight">Monitors</div>
            <div className="text-[11px] text-muted-foreground">
              Everything this workspace is watching, refreshed every 30 seconds.
            </div>
          </div>
          <span className="inline-flex h-7 items-center gap-1 rounded-md bg-primary px-2.5 text-[11px] font-medium text-primary-foreground">
            <Plus className="size-3" /> Add monitor
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <MiniStat label="Monitors" value={String(SNAPSHOT_MONITORS.length)} />
          <MiniStat label="Operational" value={String(up)} tone="up" />
          <MiniStat label="Needs attention" value={String(attention)} tone="down" />
          <MiniStat label="Open incidents" value="1" tone="down" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-7 flex-1 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-[11px] text-subtle-foreground">
            <Search className="size-3" /> Search monitors
          </div>
          <div className="hidden items-center gap-0.5 rounded-md border border-border bg-surface-2 p-0.5 text-[10px] sm:flex">
            <span className="rounded bg-card px-2 py-0.5 font-medium shadow-sm">All</span>
            <span className="px-2 py-0.5 text-muted-foreground">Operational</span>
            <span className="px-2 py-0.5 text-muted-foreground">Attention</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {SNAPSHOT_MONITORS.map((monitor) => (
            <MiniMonitorCard key={monitor.url} monitor={monitor} />
          ))}
        </div>
      </div>
    </div>
  )
}
