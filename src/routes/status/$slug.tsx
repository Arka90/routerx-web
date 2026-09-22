import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { publicStatusApi } from '@/api/status-service'
import { getApiErrorMessage } from '@/api/errors'
import { UptimeBar } from '@/features/status/components/uptime-bar'
import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PublicComponentStatus, PublicIncident } from '@/types/status.types'

export const Route = createFileRoute('/status/$slug')({
  component: PublicStatusPage,
})

const STATUS_LABEL: Record<PublicComponentStatus, string> = {
  operational: 'Operational',
  degraded: 'Degraded performance',
  outage: 'Outage',
  maintenance: 'Under maintenance',
  unknown: 'Not monitored',
}

const STATUS_DOT: Record<PublicComponentStatus, string> = {
  operational: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  outage: 'bg-red-500',
  maintenance: 'bg-sky-500',
  unknown: 'bg-neutral-300 dark:bg-neutral-600',
}

const OVERALL_COPY = {
  operational: { text: 'All systems operational', bar: 'bg-emerald-500' },
  degraded: { text: 'Degraded performance', bar: 'bg-amber-500' },
  outage: { text: 'Active outage', bar: 'bg-red-500' },
  maintenance: { text: 'Under maintenance', bar: 'bg-sky-500' },
}

function PublicStatusPage() {
  const { slug } = Route.useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-status', slug],
    queryFn: () => publicStatusApi.get(slug),
    retry: false,
    // People leave this open during an outage and expect it to move.
    refetchInterval: 60_000,
  })

  if (isLoading) {
    return (
      <Shell>
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-neutral-400" />
      </Shell>
    )
  }

  if (isError || !data) {
    return (
      <Shell>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          No status page here
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          This address doesn't match a published status page.
        </p>
      </Shell>
    )
  }

  const overall = OVERALL_COPY[data.overall]

  return (
    <Shell wide>
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {data.name}
        </h1>
        {data.headline && <p className="mt-1 text-sm text-neutral-500">{data.headline}</p>}
      </header>

      <div
        className={cn(
          'mb-10 flex items-center gap-3 rounded-xl border p-5',
          data.overall === 'operational'
            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-500/5'
            : 'border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40'
        )}
      >
        <span className={cn('h-2.5 w-2.5 rounded-full', overall.bar)} />
        <span className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          {overall.text}
        </span>
      </div>

      {data.active_incidents.length > 0 && (
        <section className="mb-10 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
            Active
          </h2>
          {data.active_incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </section>
      )}

      <section className="mb-12 space-y-6">
        {data.components.map((component) => (
          <div key={component.name}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[component.status])} />
                {component.name}
              </span>
              <span className="text-[13px] text-neutral-500">
                {component.uptime_percentage !== null && data.show_uptime
                  ? `${component.uptime_percentage.toFixed(2)}%`
                  : STATUS_LABEL[component.status]}
              </span>
            </div>

            {data.show_uptime && <UptimeBar history={component.history} />}
          </div>
        ))}

        {data.components.length === 0 && (
          <p className="text-sm text-neutral-500">Nothing is being reported yet.</p>
        )}
      </section>

      {data.recent_incidents.length > 0 && (
        <section className="mb-12 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
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
        <section className="mb-12">
          <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {data.about}
          </p>
        </section>
      )}

      <SubscribeForm slug={slug} />

      {data.support_url && (
        <p className="mt-8 text-center text-[13px]">
          <a
            href={data.support_url}
            className="text-neutral-500 underline hover:text-neutral-900 dark:hover:text-neutral-200"
          >
            Contact support
          </a>
        </p>
      )}
    </Shell>
  )
}

function IncidentCard({ incident }: { incident: PublicIncident }) {
  const duration =
    incident.resolved_at !== null
      ? Math.round(
          (new Date(incident.resolved_at).getTime() -
            new Date(incident.started_at).getTime()) /
            1000
        )
      : null

  return (
    <article className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {incident.component}
        </h3>
        <span className="text-[12px] text-neutral-500">
          {new Date(incident.started_at).toLocaleString()}
          {duration !== null && ` · resolved after ${formatDuration(duration)}`}
        </span>
      </div>

      {incident.updates.length === 0 ? (
        <p className="text-[13px] text-neutral-500">
          {incident.resolved_at
            ? 'This incident has been resolved.'
            : "We're aware of the issue and looking into it."}
        </p>
      ) : (
        <ol className="space-y-3 border-l border-neutral-200 pl-4 dark:border-neutral-800">
          {incident.updates.map((update, index) => (
            <li key={index}>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {update.status} · {new Date(update.created_at).toLocaleString()}
              </div>
              <p className="mt-0.5 whitespace-pre-line text-[13px] text-neutral-700 dark:text-neutral-300">
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
    <section className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        Get notified
      </h2>
      <p className="mt-1 text-[13px] text-neutral-500">
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
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="h-10 flex-1 rounded-md border border-neutral-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black dark:border-neutral-800 dark:bg-[#111] dark:text-neutral-100 dark:focus-visible:ring-white"
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="h-10 rounded-md bg-neutral-900 px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {subscribe.isPending ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>

      {message && <p className="mt-3 text-[13px] text-neutral-600 dark:text-neutral-400">{message}</p>}
    </section>
  )
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen w-full bg-white px-6 py-16 font-sans dark:bg-black">
      <div className={cn('mx-auto', wide ? 'max-w-3xl' : 'max-w-md text-center')}>
        {children}
        <footer className="mt-16 text-center text-[12px] text-neutral-400">
          Status powered by RouteRX
        </footer>
      </div>
    </div>
  )
}
