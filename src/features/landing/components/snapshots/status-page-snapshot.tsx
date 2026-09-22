import { uptimeHistory } from '../../data'
import { StatusDot } from '@/components/ui/status'
import { MiniUptimeBar } from './shared'

const COMPONENTS = [
  { name: 'API', status: 'up' as const, uptime: '100.00%', history: uptimeHistory(11) },
  { name: 'Dashboard', status: 'up' as const, uptime: '99.98%', history: uptimeHistory(23, [40]) },
  { name: 'Authentication', status: 'degraded' as const, uptime: '99.71%', history: uptimeHistory(31, [62, 88]) },
  { name: 'EU edge', status: 'down' as const, uptime: '98.42%', history: uptimeHistory(47, [12, 55, 89]) },
]

export function StatusPageSnapshot() {
  return (
    <div className="mx-auto max-w-xl space-y-4 p-4 text-left sm:p-6">
      <div>
        <div className="text-lg font-semibold tracking-tight">Acme status</div>
        <div className="text-[11px] text-muted-foreground">Live status of the Acme platform</div>
      </div>

      <div className="flex items-center gap-2.5 rounded-lg border border-down/30 bg-down-soft px-3.5 py-2.5">
        <StatusDot tone="down" live />
        <span className="text-[12px] font-medium">Partial outage</span>
        <span className="ml-auto text-[10px] text-muted-foreground">Updated just now</span>
      </div>

      <div className="card divide-y divide-border">
        {COMPONENTS.map((component) => (
          <div key={component.name} className="space-y-1.5 px-3.5 py-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-2 font-medium">
                <StatusDot tone={component.status} live={component.status !== 'up'} />
                {component.name}
              </span>
              <span className="tabular text-muted-foreground">{component.uptime}</span>
            </div>
            <MiniUptimeBar history={component.history} />
          </div>
        ))}
        <div className="flex justify-between px-3.5 py-1.5 text-[9px] text-subtle-foreground">
          <span>90 days ago</span>
          <span>Today</span>
        </div>
      </div>

      <div className="card px-3.5 py-3">
        <div className="text-[11px] font-semibold">Get notified</div>
        <div className="text-[10px] text-muted-foreground">
          We'll email you when an incident starts and when it's resolved.
        </div>
        <div className="mt-2 flex gap-1.5">
          <span className="flex h-7 flex-1 items-center rounded-md border border-border bg-card px-2 text-[10px] text-subtle-foreground">
            you@example.com
          </span>
          <span className="flex h-7 items-center rounded-md bg-foreground px-2.5 text-[10px] font-medium text-background">
            Subscribe
          </span>
        </div>
      </div>
    </div>
  )
}
