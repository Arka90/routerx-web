import { CheckCircle2 } from 'lucide-react'
import { StatusDot } from '@/components/ui/status'
import { Badge } from '@/components/ui/badge'
import { MiniBadge } from './shared'

export function IncidentSnapshot() {
  return (
    <div className="space-y-4 p-4 text-left sm:p-5">
      <div>
        <div className="text-base font-semibold tracking-tight">Incidents</div>
        <div className="text-[11px] text-muted-foreground">
          Every confirmed outage across this workspace, newest first.
        </div>
      </div>

      <div className="card border-l-[3px] border-l-down">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <StatusDot tone="down" live />
            <div>
              <div className="text-[12px] font-semibold">Active outage</div>
              <div className="text-[10px] text-muted-foreground">EU edge · https://eu.acme.dev/ping</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MiniBadge>Ongoing · 14m</MiniBadge>
            <span className="flex items-center gap-1 text-[10px] text-up">
              <CheckCircle2 className="size-3" /> Acknowledged
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-border bg-border text-[11px] lg:grid-cols-4">
          {[
            ['Started', 'Sep 22, 12:15'],
            ['Seen from', 'Frankfurt, Virginia'],
            ['Failures', '3 consecutive'],
            ['Alerted', 'Slack · Email'],
          ].map(([label, value]) => (
            <div key={label} className="bg-card px-4 py-2.5">
              <div className="eyebrow text-[9px]">{label}</div>
              <div className="mt-0.5">{value}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="down">DNS failure</Badge>
            <span className="font-mono text-[10px] text-muted-foreground">
              getaddrinfo ENOTFOUND eu.acme.dev
            </span>
          </div>
        </div>

        <div className="border-t border-border px-4 py-3">
          <ol className="space-y-2.5 border-l border-border pl-3.5 text-[11px]">
            {[
              { status: 'Identified', tone: 'brand', time: '12:24', body: 'Root cause is an expired NS delegation at the registrar. Renewal in progress.', internal: false },
              { status: 'Investigating', tone: 'degraded', time: '12:17', body: 'Two regions cannot resolve eu.acme.dev. Checking DNS provider status.', internal: false },
              { status: 'Investigating', tone: 'degraded', time: '12:16', body: 'Paging on-call. Do not fail over yet.', internal: true },
            ].map((update, index) => (
              <li key={index} className="relative">
                <span className="absolute top-1.5 -left-[19px] size-2 rounded-full border-2 border-card bg-border-strong" />
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={update.tone as 'brand' | 'degraded'} size="sm">
                    {update.status}
                  </Badge>
                  <span className="font-mono text-[9px] text-subtle-foreground">{update.time}</span>
                  {update.internal && <MiniBadge>internal</MiniBadge>}
                </div>
                <p className="mt-0.5 text-muted-foreground">{update.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="card border-l-[3px] border-l-up opacity-80">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <StatusDot tone="up" />
            <div>
              <div className="text-[12px] font-semibold">Resolved</div>
              <div className="text-[10px] text-muted-foreground">Auth service · https://auth.acme.dev/ready</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MiniBadge>5m 19s</MiniBadge>
            <Badge variant="degraded" size="sm">Slow response</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
