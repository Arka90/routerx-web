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
import { hostnameOf } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox, CheckboxField } from '@/components/ui/checkbox'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Page, PageHeader, SectionHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import type { StatusPage } from '@/types/status.types'

export const Route = createFileRoute('/_authenticated/status-page/$pageId')({
  component: StatusPageEditor,
})

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
      <Page width="narrow">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-64" />
      </Page>
    )
  }

  if (isError || !data) {
    return (
      <Page width="narrow">
        <EmptyState
          title="That status page doesn't exist."
          description="It may have been deleted, or the link is wrong."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/status-pages">
                <ChevronLeft />
                Back to status pages
              </Link>
            </Button>
          }
        />
      </Page>
    )
  }

  const page = data.status_page

  return (
    <Page width="narrow">
      <div className="space-y-4">
        <Link
          to="/status-pages"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Status pages
        </Link>

        <PageHeader
          title={page.name}
          description={
            <span className="flex flex-wrap items-center gap-2">
              {page.published ? (
                <span className="min-w-0 truncate">
                  Live at{' '}
                  <a
                    href={page.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="link font-mono text-[13px]"
                  >
                    {page.public_url}
                  </a>
                </span>
              ) : (
                <span>Draft — nothing is public until you publish.</span>
              )}
              {data.subscriber_count > 0 && (
                <Badge size="sm">
                  {data.subscriber_count} subscriber{data.subscriber_count === 1 ? '' : 's'}
                </Badge>
              )}
            </span>
          }
          actions={
            <>
              {page.published && (
                <Button asChild variant="outline" size="sm">
                  <a href={page.public_url} target="_blank" rel="noreferrer">
                    <ExternalLink />
                    View
                  </a>
                </Button>
              )}

              {canManage && (
                <Button
                  variant={page.published ? 'outline' : 'primary'}
                  size="sm"
                  loading={updatePage.isPending}
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
                >
                  {page.published ? 'Unpublish' : 'Publish'}
                </Button>
              )}
            </>
          }
        />
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
    </Page>
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
    <section className="card">
      <div className="px-5 pt-5 pb-4">
        <SectionHeader
          title="Components"
          description="Pick which monitors appear, and what to call them. Visitors see the name you give here — never the monitor's URL."
        />
      </div>

      {monitors.length === 0 ? (
        <p className="border-t border-border px-5 py-4 text-[13px] text-muted-foreground">
          No monitors to show yet.
        </p>
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {monitors.map((monitor) => {
            const selected = selection.find((item) => item.monitor_id === monitor.id)
            const fallback = monitor.name ?? monitor.url

            return (
              <div key={monitor.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <Checkbox
                  id={`component-${monitor.id}`}
                  disabled={!canManage}
                  checked={Boolean(selected)}
                  onCheckedChange={() => toggleMonitor(monitor.id, fallback)}
                  aria-label={`Show ${fallback} on this page`}
                />

                <label
                  htmlFor={`component-${monitor.id}`}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  <span className="block truncate text-sm text-foreground">
                    {monitor.name ?? hostnameOf(monitor.url)}
                  </span>
                  <span className="block truncate font-mono text-xs text-muted-foreground">
                    {monitor.url}
                  </span>
                </label>

                <Input
                  aria-label={`Display name for ${fallback}`}
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
                  className="h-8 basis-full text-[13px] sm:w-48 sm:shrink-0 sm:basis-auto"
                />
              </div>
            )
          })}
        </div>
      )}

      {canManage && (
        <div className="flex items-center border-t border-border px-5 py-4">
          <Button
            loading={setComponents.isPending}
            disabled={selection.some((item) => !item.display_name.trim())}
            onClick={() =>
              setComponents.mutate(
                { id: pageId, components: selection },
                {
                  onSuccess: () => toast.success('Components updated'),
                  onError: (error) => toast.error(getApiErrorMessage(error, 'Could not save')),
                }
              )
            }
          >
            Save components
          </Button>
        </div>
      )}
    </section>
  )
}

function PageDetailsForm({ page, pageId }: { page: StatusPage; pageId: number }) {
  const navigate = useNavigate()
  const updatePage = useUpdateStatusPage()
  const deletePage = useDeleteStatusPage()
  const { confirm, dialog } = useConfirm()

  const [name, setName] = useState(page.name)
  const [slug, setSlug] = useState(page.slug)
  const [headline, setHeadline] = useState(page.headline ?? '')
  const [about, setAbout] = useState(page.about ?? '')
  const [supportUrl, setSupportUrl] = useState(page.support_url ?? '')
  const [showUptime, setShowUptime] = useState(page.show_uptime)

  return (
    <>
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
        className="card space-y-5 p-5"
      >
        <SectionHeader title="Page details" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="sp-name" label="Name">
            <Input id="sp-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <Field
            id="sp-slug"
            label="Address"
            hint="Changing this breaks any link already shared."
          >
            <Input
              id="sp-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="font-mono text-[13px]"
            />
          </Field>
        </div>

        <Field id="sp-headline" label="Headline" optional>
          <Input
            id="sp-headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Live status of the Acme platform"
          />
        </Field>

        <Field id="sp-about" label="About" optional>
          <Textarea
            id="sp-about"
            rows={4}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Anything visitors should know — maintenance windows, escalation paths."
          />
        </Field>

        <Field id="sp-support" label="Support link" optional>
          <Input
            id="sp-support"
            value={supportUrl}
            onChange={(e) => setSupportUrl(e.target.value)}
            placeholder="https://acme.com/support"
          />
        </Field>

        <CheckboxField
          id="sp-uptime"
          label="Show 90 days of uptime history"
          checked={showUptime}
          onCheckedChange={(checked) => setShowUptime(checked === true)}
        />

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <Button type="submit" loading={updatePage.isPending}>
            Save details
          </Button>

          <Button
            type="button"
            variant="destructive"
            loading={deletePage.isPending}
            onClick={() =>
              confirm({
                title: `Delete "${page.name}"?`,
                description: 'Any shared link stops working. This cannot be undone.',
                confirmLabel: 'Delete page',
                destructive: true,
                onConfirm: () =>
                  deletePage.mutate(pageId, {
                    onSuccess: () => {
                      toast.success('Status page deleted')
                      navigate({ to: '/status-pages' })
                    },
                    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not delete')),
                  }),
              })
            }
          >
            {!deletePage.isPending && <Trash2 />}
            Delete
          </Button>
        </div>
      </form>

      {dialog}
    </>
  )
}
