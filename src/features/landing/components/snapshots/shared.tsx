import * as React from 'react'
import { AlertTriangle, Bell, Globe, LayoutDashboard, Settings, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import { StatusBadge, StatusDot } from '@/components/ui/status'
import { SNAPSHOT_TONE as TONE, type SnapshotMonitor } from '../../data'

/** A scaled-down copy of the real sidebar for the dashboard snapshot. */
export function MiniSidebar({ active = 'Dashboard', openIncidents = 1 }: { active?: string; openIncidents?: number }) {
  const items = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Incidents', icon: AlertTriangle, badge: openIncidents },
    { name: 'Alert channels', icon: Bell },
    { name: 'Status pages', icon: Globe },
    { name: 'Team', icon: Users },
    { name: 'Settings', icon: Settings },
  ]

  return (
    <aside className="hidden w-44 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-11 items-center px-3.5">
        <Logo className="scale-90 origin-left" />
      </div>
      <div className="px-2.5 pb-2">
        <div className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5">
          <span className="size-5 rounded bg-surface-3" />
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-medium">Acme Production</span>
            <span className="block text-[9px] text-subtle-foreground">owner</span>
          </span>
        </div>
      </div>
      <nav className="space-y-0.5 px-2.5">
        {items.map((item) => (
          <div
            key={item.name}
            className={cn(
              'flex h-7 items-center gap-2 rounded-md px-2 text-[11px] font-medium',
              item.name === active ? 'bg-accent text-foreground' : 'text-muted-foreground'
            )}
          >
            <item.icon className={cn('size-3.5', item.name === active ? 'text-brand' : 'text-subtle-foreground')} />
            <span className="flex-1">{item.name}</span>
            {item.badge ? (
              <span className="rounded bg-down-soft px-1 text-[9px] font-semibold text-down">{item.badge}</span>
            ) : null}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export function MiniStat({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'up' | 'down' | 'brand'
}) {
  return (
    <div className="card p-3">
      <div className="eyebrow text-[9px]">{label}</div>
      <div
        className={cn(
          'tabular mt-1.5 text-lg font-semibold tracking-tight',
          tone === 'up' && 'text-up',
          tone === 'down' && 'text-down',
          tone === 'brand' && 'text-brand'
        )}
      >
        {value}
      </div>
    </div>
  )
}

export function MiniMonitorCard({ monitor }: { monitor: SnapshotMonitor }) {
  const status = TONE[monitor.status]
  return (
    <div
      className={cn(
        'card flex flex-col gap-3 p-3.5',
        monitor.status === 'DOWN' && 'border-down/40'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[12px] font-medium">
            <StatusDot tone={status.tone} live={status.live} />
            <span className="truncate">{monitor.name}</span>
          </div>
          <div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
            <span className="mr-1 text-subtle-foreground">{monitor.method}</span>
            {monitor.url}
          </div>
        </div>
        <StatusBadge tone={status.tone} label={status.label} size="sm" />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow text-[9px]">30-day uptime</div>
          <div className="tabular text-base font-semibold">{monitor.uptime}%</div>
        </div>
        <div className="flex gap-1">
          <span className="rounded border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground">
            {monitor.interval}
          </span>
          <span
            className={cn(
              'rounded border border-border px-1.5 py-0.5 text-[9px]',
              monitor.tlsDays < 7 ? 'text-down' : monitor.tlsDays < 30 ? 'text-degraded' : 'text-muted-foreground'
            )}
          >
            TLS {monitor.tlsDays}d
          </span>
        </div>
      </div>
    </div>
  )
}

/** 90 thin bars, the same treatment the public status page uses. */
export function MiniUptimeBar({ history }: { history: Array<number | null> }) {
  return (
    <div className="flex h-5 items-stretch gap-px">
      {history.map((day, index) => (
        <span
          key={index}
          className={cn(
            'flex-1 rounded-[1px]',
            day === null
              ? 'bg-surface-3'
              : day >= 99.9
                ? 'bg-up'
                : day >= 95
                  ? 'bg-degraded'
                  : 'bg-down'
          )}
        />
      ))}
    </div>
  )
}

export function MiniBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border border-border bg-surface-2 px-1.5 py-px text-[9px] font-medium uppercase tracking-wider text-muted-foreground',
        className
      )}
    >
      {children}
    </span>
  )
}
