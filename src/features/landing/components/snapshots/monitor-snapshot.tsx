import { ChevronLeft, ExternalLink } from 'lucide-react'
import { probeSeries } from '../../data'
import { StatusBadge, StatusDot } from '@/components/ui/status'
import { MiniStat } from './shared'

const SERIES = probeSeries(7)
const LAYERS = [
  { key: 'dns', label: 'DNS', color: 'var(--chart-dns)' },
  { key: 'tcp', label: 'TCP', color: 'var(--chart-tcp)' },
  { key: 'tls', label: 'TLS', color: 'var(--chart-tls)' },
  { key: 'ttfb', label: 'TTFB', color: 'var(--chart-ttfb)' },
] as const

const WIDTH = 640
const HEIGHT = 200
const MAX = 300

function pathFor(key: (typeof LAYERS)[number]['key'], close: boolean) {
  const step = WIDTH / (SERIES.length - 1)
  const points = SERIES.map((point, index) => {
    const x = index * step
    const y = HEIGHT - (Math.min(point[key], MAX) / MAX) * HEIGHT
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const line = `M${points.join(' L')}`
  return close ? `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z` : line
}

/** Hand-rolled SVG so the snapshot stays deterministic and animates on load. */
function ResponseChart() {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[12px] font-semibold">Response timing</div>
          <div className="eyebrow text-[9px]">per layer, ms</div>
        </div>
        <div className="flex items-center gap-3">
          {LAYERS.map((layer) => (
            <span key={layer.key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="size-1.5 rounded-full" style={{ background: layer.color }} />
              {layer.label}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-40 w-full sm:h-48" preserveAspectRatio="none">
        <defs>
          <linearGradient id="snap-ttfb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-ttfb)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--chart-ttfb)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1="0"
            x2={WIDTH}
            y1={HEIGHT * fraction}
            y2={HEIGHT * fraction}
            stroke="var(--chart-grid)"
            strokeDasharray="3 4"
          />
        ))}
        <path d={pathFor('ttfb', true)} fill="url(#snap-ttfb)" />
        {LAYERS.map((layer) => (
          <path
            key={layer.key}
            d={pathFor(layer.key, false)}
            fill="none"
            stroke={layer.color}
            strokeWidth={layer.key === 'ttfb' ? 2.2 : 1.6}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="animate-dash"
            strokeDasharray="1000"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-subtle-foreground">
        <span>18:10</span>
        <span>18:20</span>
        <span>18:30</span>
        <span>18:40</span>
      </div>
    </div>
  )
}

export function MonitorSnapshot() {
  return (
    <div className="space-y-4 p-4 text-left sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
            <ChevronLeft className="size-3" /> Monitors
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold tracking-tight">Checkout API</span>
            <StatusBadge tone="up" label="Operational" size="sm" />
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            <span className="mr-1.5 text-subtle-foreground">GET</span>https://api.acme.dev/health
          </div>
        </div>
        <span className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2.5 text-[11px] font-medium">
          <ExternalLink className="size-3" /> Open URL
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <MiniStat label="30-day uptime" value="100%" />
        <MiniStat label="Total downtime" value="0s" />
        <MiniStat label="Success streak" value="4,812" tone="up" />
        <MiniStat label="Certificate" value="61 days" />
      </div>

      <div className="flex gap-4 border-b border-border text-[11px] font-medium">
        {['Overview', 'Incidents', 'Alerts', 'Maintenance', 'Settings'].map((tab, index) => (
          <span
            key={tab}
            className={
              index === 0
                ? '-mb-px border-b-2 border-brand pb-2 text-foreground'
                : 'pb-2 text-muted-foreground'
            }
          >
            {tab}
          </span>
        ))}
      </div>

      <ResponseChart />

      <div className="card divide-y divide-border">
        <div className="flex items-center justify-between px-3.5 py-2">
          <span className="text-[11px] font-semibold">By region</span>
          <span className="text-[10px] text-muted-foreground">2 of 3 must agree</span>
        </div>
        {[
          { name: 'Frankfurt', ms: '182 ms', ok: true },
          { name: 'Virginia', ms: '241 ms', ok: true },
          { name: 'Singapore', ms: '319 ms', ok: true },
        ].map((region) => (
          <div key={region.name} className="flex items-center justify-between px-3.5 py-2 text-[11px]">
            <span className="flex items-center gap-2">
              <StatusDot tone={region.ok ? 'up' : 'down'} />
              {region.name}
              <span className="text-muted-foreground">Reachable</span>
            </span>
            <span className="tabular font-mono text-muted-foreground">{region.ms}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
