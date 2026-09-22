import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format } from 'date-fns'
import { Activity } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusDot } from '@/components/ui/status'
import type { Probe } from '@/types/monitor.types'

interface ProbeGraphProps {
  data: Probe[]
}

/**
 * One entry per timing layer, in stacking order. Colours come from the chart
 * tokens so the graph follows the theme like everything else.
 */
const SERIES = [
  { key: 'dns', name: 'DNS Resolving', color: 'var(--chart-dns)', width: 2, filled: false },
  { key: 'tcp', name: 'TCP Handshake', color: 'var(--chart-tcp)', width: 2, filled: true },
  { key: 'tls', name: 'TLS Negotiation', color: 'var(--chart-tls)', width: 2, filled: true },
  { key: 'ttfb', name: 'TTFB / Total', color: 'var(--chart-ttfb)', width: 2.5, filled: true },
] as const

const TICK_STYLE = {
  fontSize: 11,
  fill: 'var(--subtle-foreground)',
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
}

interface TooltipItem {
  dataKey?: string | number
  name?: string
  value?: number | string | null
  color?: string
}

function ProbeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: ReadonlyArray<TooltipItem>
  label?: string | number
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="card min-w-[176px] p-3 shadow-md">
      <p className="mb-2 font-mono text-[11px] text-muted-foreground">{label}</p>
      <ul className="space-y-1">
        {payload.map((item) => (
          <li
            key={String(item.dataKey)}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ background: item.color }}
              />
              {item.name}
            </span>
            <span className="tabular font-mono font-medium text-foreground">
              {item.value === null || item.value === undefined ? '—' : `${item.value} ms`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProbeGraph({ data }: ProbeGraphProps) {
  const chartData = useMemo(() => {
    // Postgres returns timestamptz, which serialises to a proper ISO string.
    // The old SQLite schema stored a zone-less "YYYY-MM-DD HH:MM:SS" that had
    // to be patched into UTC here before it could be parsed.
    return data
      .map((point) => ({
        ...point,
        formattedTime: format(new Date(point.timestamp), 'HH:mm:ss'),
      }))
      .sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
  }, [data])

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Activity />}
        title="Waiting for the first check"
        description="Per-layer timings appear here as soon as the first probe completes."
      />
    )
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="eyebrow">per layer, ms</span>
          <h3 className="mt-1 text-sm font-semibold tracking-tight text-foreground">
            Response timing
          </h3>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <StatusDot tone="up" live />
          Live · refreshes every 10s
        </span>
      </div>

      {/* Legend drawn by hand: recharts' own is hard to theme and wraps badly. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5" aria-hidden>
        {SERIES.map((series) => (
          <span
            key={series.key}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: series.color }}
            />
            {series.name}
          </span>
        ))}
      </div>

      <div className="mt-4 h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              {SERIES.map((series) => (
                <linearGradient
                  key={series.key}
                  id={`probe-fill-${series.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={series.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={series.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />

            <XAxis
              dataKey="formattedTime"
              axisLine={false}
              tickLine={false}
              tick={TICK_STYLE}
              minTickGap={32}
              dy={6}
            />

            <YAxis axisLine={false} tickLine={false} tick={TICK_STYLE} width={48} />

            <Tooltip
              content={<ProbeTooltip />}
              cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />

            {SERIES.map((series) => (
              <Area
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.name}
                stroke={series.color}
                strokeWidth={series.width}
                fill={series.filled ? `url(#probe-fill-${series.key})` : 'transparent'}
                fillOpacity={1}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
