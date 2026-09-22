import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ChevronLeft, ExternalLink, Trash2 } from 'lucide-react'
import {
  useDeleteStatusPage,
  useSetComponents,
  useStatusPage,
  useUpdateStatusPage,
} from '@/hooks/status.queries'
import { useMonitors } from '@/hooks/monitor.queries'
import { useCanManage } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'
import { Input } from '@/components/ui/input'
import type { StatusPage } from '@/types/status.types'

export const Route = createFileRoute('/_authenticated/status-page/$pageId')({
  component: StatusPageEditor,
})

const labelClass = 'text-sm font-medium text-neutral-900 dark:text-neutral-100'
const hintClass = 'text-[12px] text-neutral-500 dark:text-neutral-400'

interface Selection {
  monitor_id: number
  display_name: string
}

function StatusPageEditor() {
  const { pageId } = Route.useParams()
  const id = Number.parseInt(pageId, 10)
  const canManage = useCanManage()

  const { data, isLoading, isError } = useStatusPage(id)
  const { data: monitors = [] } = useMonitors()

  // Publishing is the one action this component still owns; the two forms
  // below hold their own state so neither needs an effect to stay in sync.
  const updatePage = useUpdateStatusPage()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse space-y-4 p-8">
        <div className="h-8 w-48 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-900" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center text-sm text-neutral-500">
        That status page doesn't exist.{' '}
        <Link to="/status-pages" className="font-medium underline">
          Back to status pages
        </Link>
      </div>
    )
  }

  const page = data.status_page

  return (
    <div className="animate-in fade-in mx-auto max-w-3xl space-y-10 p-8 duration-500">
      <div>
        <Link
          to="/status-pages"
          className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <ChevronLeft className="h-4 w-4" /> Status pages
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {page.name}
          </h1>

          <div className="flex items-center gap-2">
            {page.published && (
              <a
                href={page.public_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <ExternalLink className="h-3 w-3" />
                View
              </a>
            )}

            {canManage && (
              <button
                onClick={() =>
                  updatePage.mutate(
                    { id, payload: { published: !page.published } },
                    {
                      onSuccess: () =>
                        toast.success(page.published ? 'Page unpublished' : 'Page is live'),
                      onError: (error) =>
                        toast.error(getApiErrorMessage(error, 'Could not change visibility')),
                    }
                  )
                }
                className="rounded-md bg-neutral-900 px-4 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
              >
                {page.published ? 'Unpublish' : 'Publish'}
              </button>
            )}
          </div>
        </div>

        <p className={`mt-1 ${hintClass}`}>
          {page.published
            ? `Live at ${page.public_url}`
            : 'Draft — nothing is public until you publish.'}
          {data.subscriber_count > 0 && ` · ${data.subscriber_count} subscriber(s)`}
        </p>
      </div>

      {/* Keyed on the page's updated_at so a save elsewhere reseeds the forms,
          while typing is not clobbered on every background refetch. */}
      <ComponentPicker
        key={`components-${page.updated_at}`}
        pageId={id}
        canManage={canManage}
        monitors={monitors}
        initial={data.components.map((component) => ({
          monitor_id: component.monitor_id,
          display_name: component.display_name,
        }))}
      />

      {canManage && (
        <PageDetailsForm key={`details-${page.updated_at}`} page={page} pageId={id} />
      )}
    </div>
  )
}

function ComponentPicker({
  pageId,
  canManage,
  monitors,
  initial,
}: {
  pageId: number
  canManage: boolean
  monitors: Array<{ id: number; url: string; name: string | null }>
  initial: Selection[]
}) {
  const [selection, setSelection] = useState<Selection[]>(initial)
  const setComponents = useSetComponents()

  const toggleMonitor = (monitorId: number, fallbackName: string) => {
    setSelection((current) =>
      current.some((item) => item.monitor_id === monitorId)
        ? current.filter((item) => item.monitor_id !== monitorId)
        : [...current, { monitor_id: monitorId, display_name: fallbackName }]
    )
  }

  return (
    <section className="space-y-4">
      <h2 className={labelClass}>Components</h2>
      <p className={hintClass}>
        Pick which monitors appear, and what to call them. Visitors see the name you give
        here — never the monitor's URL.
      </p>

      {monitors.length === 0 ? (
        <p className={hintClass}>No monitors to show yet.</p>
      ) : (
        <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {monitors.map((monitor) => {
            const selected = selection.find((item) => item.monitor_id === monitor.id)
            const fallback = monitor.name ?? monitor.url

            return (
              <div key={monitor.id} className="flex items-center gap-3 p-3">
                <input
                  type="checkbox"
                  disabled={!canManage}
                  checked={Boolean(selected)}
                  onChange={() => toggleMonitor(monitor.id, fallback)}
                  className="h-4 w-4 shrink-0 accent-black dark:accent-white"
                  aria-label={`Show ${fallback} on this page`}
                />

                <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-500">
                  {monitor.url}
                </span>

                <Input
                  value={selected?.display_name ?? ''}
                  disabled={!canManage || !selected}
                  placeholder={selected ? fallback : 'Not shown'}
                  onChange={(event) =>
                    setSelection((current) =>
                      current.map((item) =>
                        item.monitor_id === monitor.id
                          ? { ...item, display_name: event.target.value }
                          : item
                      )
                    )
                  }
                  className="h-8 w-48 shrink-0 text-[13px]"
                />
              </div>
            )
          })}
        </div>
      )}

      {canManage && (
        <button
          onClick={() =>
            setComponents.mutate(
              { id: pageId, components: selection },
              {
                onSuccess: () => toast.success('Components updated'),
                onError: (error) => toast.error(getApiErrorMessage(error, 'Could not save')),
              }
            )
          }
          disabled={
            setComponents.isPending || selection.some((item) => !item.display_name.trim())
          }
          className="h-9 rounded-md bg-neutral-900 px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {setComponents.isPending ? 'Saving…' : 'Save components'}
        </button>
      )}
    </section>
  )
}

function PageDetailsForm({ page, pageId }: { page: StatusPage; pageId: number }) {
  const navigate = useNavigate()
  const updatePage = useUpdateStatusPage()
  const deletePage = useDeleteStatusPage()

  const [name, setName] = useState(page.name)
  const [slug, setSlug] = useState(page.slug)
  const [headline, setHeadline] = useState(page.headline ?? '')
  const [about, setAbout] = useState(page.about ?? '')
  const [supportUrl, setSupportUrl] = useState(page.support_url ?? '')
  const [showUptime, setShowUptime] = useState(page.show_uptime)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()

        updatePage.mutate(
          {
            id: pageId,
            payload: {
              name: name.trim(),
              slug: slug.trim(),
              headline: headline.trim() || null,
              about: about.trim() || null,
              support_url: supportUrl.trim() || null,
              show_uptime: showUptime,
            },
          },
          {
            onSuccess: () => toast.success('Status page saved'),
            onError: (error) => toast.error(getApiErrorMessage(error, 'Could not save')),
          }
        )
      }}
      className="space-y-5"
    >
      <h2 className={labelClass}>Page details</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="sp-name" className={labelClass}>
            Name
          </label>
          <Input id="sp-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label htmlFor="sp-slug" className={labelClass}>
            Address
          </label>
          <Input
            id="sp-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="font-mono text-[13px]"
          />
          <p className={hintClass}>Changing this breaks any link already shared.</p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="sp-headline" className={labelClass}>
          Headline
        </label>
        <Input
          id="sp-headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Live status of the Acme platform"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="sp-about" className={labelClass}>
          About
        </label>
        <textarea
          id="sp-about"
          rows={4}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Anything visitors should know — maintenance windows, escalation paths."
          className="w-full rounded-md border border-neutral-200 bg-white p-3 text-[13px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black dark:border-neutral-800 dark:bg-[#111] dark:text-neutral-100 dark:focus-visible:ring-white"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="sp-support" className={labelClass}>
          Support link
        </label>
        <Input
          id="sp-support"
          value={supportUrl}
          onChange={(e) => setSupportUrl(e.target.value)}
          placeholder="https://acme.com/support"
        />
      </div>

      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={showUptime}
          onChange={(e) => setShowUptime(e.target.checked)}
          className="h-4 w-4 accent-black dark:accent-white"
        />
        <span className="text-[13px] text-neutral-700 dark:text-neutral-300">
          Show 90 days of uptime history
        </span>
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={updatePage.isPending}
          className="h-10 rounded-md bg-black px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {updatePage.isPending ? 'Saving…' : 'Save details'}
        </button>

        <button
          type="button"
          onClick={() => {
            if (!confirm(`Delete "${page.name}"? Any shared link stops working.`)) return

            deletePage.mutate(pageId, {
              onSuccess: () => {
                toast.success('Status page deleted')
                navigate({ to: '/status-pages' })
              },
              onError: (error) => toast.error(getApiErrorMessage(error, 'Could not delete')),
            })
          }}
          className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-neutral-800 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </form>
  )
}
