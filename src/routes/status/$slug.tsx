import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Bell, ExternalLink, Loader2, SearchX } from 'lucide-react'
import { publicStatusApi } from '@/api/status-service'
import { getApiErrorMessage } from '@/api/errors'
import { UptimeBar } from '@/features/status/components/uptime-bar'
import { formatDateTime, formatDuration, formatRelative } from '@/lib/format'
import { PUBLIC_STATUS } from '@/lib/status'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogoMark } from '@/components/ui/logo'
import { StatusDot, type StatusTone } from '@/components/ui/status'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import type { PublicIncident, PublicStatusPage as PublicStatusPageData } from '@/types/status.types'

export const Route = createFileRoute('/status/$slug')({
  component: PublicStatusPage,
})

const OVERALL: Record<
  PublicStatusPageData['overall'],
  { text: string; tone: StatusTone; live: boolean; className: string }
> = {
  operational: {
    text: 'All systems operational',
    tone: 'up',
    live: false,
    className: 'border-up/30 bg-up-soft',
  },
  degraded: {
    text: 'Degraded performance',
    tone: 'degraded',
    live: true,
    className: 'border-degraded/30 bg-degraded-soft',
  },
  outage: {
    text: 'Active outage',
    tone: 'down',
    live: true,
    className: 'border-down/30 bg-down-soft',
  },
  maintenance: {
    text: 'Under maintenance',
    tone: 'maintenance',
    live: false,
    className: 'border-maintenance/30 bg-maintenance-soft',
  },
}

/** Static map so Tailwind can see every class it needs to emit. */
const TONE_TEXT: Record<StatusTone, string> = {
  up: 'text-muted-foreground',
  down: 'text-down',
  degraded: 'text-degraded',
  maintenance: 'text-maintenance',
  paused: 'text-muted-foreground',
  unknown: 'text-unknown',
}

const UPDATE_TONE: Record<string, 'degraded' | 'brand' | 'maintenance' | 'up' | 'neutral'> = {
  investigating: 'degraded',
  identified: 'brand',
  monitoring: 'maintenance',
  resolved: 'up',
}

function PublicStatusPage() {
  const { slug } = Route.useParams()

  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['public-status', slug],
    queryFn: () => publicStatusApi.get(slug),
    retry: false,
    // People leave this open during an outage and expect it to move.
    refetchInterval: 60_000,
  })

  if (isLoading) {
    return (
      <Shell>
        <Loader2 className="mx-auto size-5 animate-spin text-subtle-foreground" />
      </Shell>
    )
  }

  if (isError || !data) {
    return (
      <Shell>
        <div className="card mx-auto max-w-md p-8 text-center">
          <span className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground">
            <SearchX className="size-5" />
          </span>
          <h1 className="text-lg font-semibold tracking-tight">No status page here</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This address doesn't match a published status page.
          </p>
        </div>
      </Shell>
    )
  }

  const overall = OVERALL[data.overall]

  return (
    <Shell title={data.name}>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{data.name}</h1>
        {data.headline && <p className="mt-1.5 text-sm text-muted-foreground">{data.headline}</p>}
      </header>

      <div
        className={cn(
          'mb-8 flex flex-wrap items-center gap-3 rounded-xl border px-5 py-4',
          overall.className
        )}
      >
        <StatusDot tone={overall.tone} live={overall.live} className="size-2.5" />
        <span className="text-base font-semibold">{overall.text}</span>
        <span className="ml-auto text-[12px] text-muted-foreground">
          Updated {formatRelative(new Date(dataUpdatedAt).toISOString())}
        </span>
      </div>

      {data.active_incidents.length > 0 && (
        <section className="mb-8 space-y-3" aria-labelledby="active-heading">
          <h2 id="active-heading" className="eyebrow">
            Active incidents
          </h2>
          {data.active_incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </section>
      )}

      <section className="mb-10" aria-labelledby="components-heading">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="components-heading" className="eyebrow">
            Components
          </h2>
          {data.show_uptime && (
            <span className="text-[12px] text-subtle-foreground">Last 90 days</span>
          )}
        </div>

        {data.components.length === 0 ? (
          <p className="card p-5 text-sm text-muted-foreground">Nothing is being reported yet.</p>
        ) : (
          <div className="card divide-y divide-border">
            {data.components.map((component) => {
              const status = PUBLIC_STATUS[component.status]
              return (
                <div key={component.name} className="space-y-2.5 px-5 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <StatusDot tone={status.tone} live={status.live} />
                      {component.name}
                    </span>
                    <span className={cn('tabular text-[13px]', TONE_TEXT[status.tone])}>
                      {component.uptime_percentage !== null && data.show_uptime
                        ? `${component.uptime_percentage.toFixed(2)}%`
                        : status.label}
                    </span>
                  </div>

                  {data.show_uptime && <UptimeBar history={component.history} showAxis={false} />}
                </div>
              )
            })}
            {data.show_uptime && (
              <div className="flex justify-between px-5 py-2 text-[11px] text-subtle-foreground">
                <span>90 days ago</span>
                <span>Today</span>
              </div>
            )}
          </div>
        )}
      </section>

      {data.recent_incidents.filter((incident) => incident.resolved_at !== null).length > 0 && (
        <section className="mb-10 space-y-3" aria-labelledby="past-heading">
          <h2 id="past-heading" className="eyebrow">
            Past incidents
          </h2>
          {data.recent_incidents
            .filter((incident) => incident.resolved_at !== null)
            .map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
        </section>
      )}

      {data.about && (
        <section className="mb-10">
          <h2 className="eyebrow mb-3">About</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {data.about}
          </p>
        </section>
      )}

      <SubscribeForm slug={slug} />

      {data.support_url && (
        <p className="mt-8 text-center text-[13px]">
          <a
            href={data.support_url}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            Contact support
            <ExternalLink className="size-3" />
          </a>
        </p>
      )}
    </Shell>
  )
}

function IncidentCard({ incident }: { incident: PublicIncident }) {
  const resolved = incident.resolved_at !== null
  const duration = resolved
    ? Math.round(
        (new Date(incident.resolved_at!).getTime() - new Date(incident.started_at).getTime()) / 1000
      )
    : null

  return (
    <article
      className={cn(
        'card border-l-[3px] p-5',
        resolved ? 'border-l-up' : 'border-l-down'
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <StatusDot tone={resolved ? 'up' : 'down'} live={!resolved} />
          {incident.component}
        </h3>
        <span className="text-[12px] text-muted-foreground">
          {formatDateTime(incident.started_at)}
          {duration !== null && ` · resolved after ${formatDuration(duration)}`}
        </span>
      </div>

      {incident.updates.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          {resolved
            ? 'This incident has been resolved.'
            : "We're aware of the issue and looking into it."}
        </p>
      ) : (
        <ol className="space-y-3 border-l border-border pl-4">
          {incident.updates.map((update, index) => (
            <li key={index} className="relative">
              <span className="absolute top-1.5 -left-[21px] size-2 rounded-full border-2 border-card bg-border-strong" />
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={UPDATE_TONE[update.status] ?? 'neutral'} size="sm">
                  {update.status}
                </Badge>
                <span className="text-[11px] text-subtle-foreground">
                  {formatDateTime(update.created_at)}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-foreground/90">
                {update.body}
              </p>
            </li>
          ))}
        </ol>
      )}
    </article>
  )
}

function SubscribeForm({ slug }: { slug: string }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const subscribe = useMutation({
    mutationFn: () => publicStatusApi.subscribe(slug, email.trim()),
    onSuccess: (result) => {
      setMessage(result.message)
      setEmail('')
    },
    onError: (error) =>
      setMessage(getApiErrorMessage(error, 'Could not subscribe. Please try again.')),
  })

  return (
    <section className="card p-5" aria-labelledby="subscribe-heading">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Bell className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="subscribe-heading" className="text-sm font-semibold">
            Get notified
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            We'll email you when an incident starts and when it's resolved.
          </p>

          <form
            className="mt-4 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault()
              setMessage(null)
              if (email.trim()) subscribe.mutate()
            }}
          >
            <Input
              type="email"
              required
              aria-label="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-10 flex-1"
            />
            <Button type="submit" className="h-10" loading={subscribe.isPending}>
              Subscribe
            </Button>
          </form>

          {message && <p className="mt-3 text-[13px] text-muted-foreground">{message}</p>}
        </div>
      </div>
    </section>
  )
}

function Shell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-5 sm:px-6">
        <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <LogoMark
            className="size-5 text-foreground"
            style={{ '--logo-ink': 'var(--background)', '--logo-accent': 'var(--brand)' } as React.CSSProperties}
          />
          {title ? 'Status' : 'RouteRX'}
        </span>
        <ThemeToggle compact />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {children}
        <footer className="mt-16 flex items-center justify-center gap-1.5 text-[12px] text-subtle-foreground">
          Powered by
          <a
            href="https://github.com/Arka90/routerx-api"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-muted-foreground hover:text-foreground"
          >
            RouteRX
          </a>
        </footer>
      </div>
    </div>
  )
}
