import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ExternalLink } from 'lucide-react'
import { useCreateStatusPage, useStatusPages } from '@/hooks/status.queries'
import { useCanManage } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/_authenticated/status-pages')({
  component: StatusPagesPage,
})

function StatusPagesPage() {
  const { data, isLoading } = useStatusPages()
  const canManage = useCanManage()

  const pages = data?.status_pages ?? []

  return (
    <div className="animate-in fade-in space-y-8 p-8 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Status pages
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
            A public page your customers can read during an outage, without an account.
          </p>
        </div>

        {canManage && <CreatePageDialog />}
      </div>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900" />
      ) : pages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center dark:border-neutral-800 dark:bg-[#0A0A0A]">
          <h3 className="mb-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            No status pages yet
          </h3>
          <p className="text-xs text-neutral-500">
            A status page is the cheapest way to stop "is it down?" emails during an incident.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    to="/status-page/$pageId"
                    params={{ pageId: String(page.id) }}
                    className="text-sm font-medium text-neutral-900 hover:underline dark:text-neutral-100"
                  >
                    {page.name}
                  </Link>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      page.published
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500'
                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-900'
                    }`}
                  >
                    {page.published ? 'Live' : 'Draft'}
                  </span>
                </div>
                <p className="mt-0.5 truncate font-mono text-[12px] text-neutral-500">
                  /status/{page.slug}
                </p>
              </div>

              {page.published && (
                <a
                  href={page.public_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  <ExternalLink className="h-3 w-3" />
                  View
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreatePageDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createPage = useCreateStatusPage()

  // Suggest an address from the name until the user types their own.
  const suggested = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setError(null)
      }}
    >
      <DialogTrigger asChild>
        <button className="rounded-md bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-opacity hover:opacity-90 dark:bg-white dark:text-black">
          New status page
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Create a status page</DialogTitle>
          <DialogDescription>
            It starts as a draft — nothing is public until you publish it.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 pt-2"
          onSubmit={(event) => {
            event.preventDefault()
            setError(null)

            createPage.mutate(
              { name: name.trim(), slug: suggested },
              {
                onSuccess: () => {
                  toast.success('Status page created')
                  setOpen(false)
                  setName('')
                  setSlug('')
                },
                onError: (mutationError) =>
                  setError(getApiErrorMessage(mutationError, 'Could not create that page')),
              }
            )
          }}
        >
          <div className="space-y-2">
            <label htmlFor="page-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="page-name"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Acme Status"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="page-slug" className="text-sm font-medium">
              Address
            </label>
            <Input
              id="page-slug"
              value={suggested}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="acme-status"
              className="font-mono text-[13px]"
            />
            <p className="text-[12px] text-neutral-500">/status/{suggested || '…'}</p>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={createPage.isPending || !name.trim()}
            className="h-10 w-full rounded-md bg-black text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {createPage.isPending ? 'Creating…' : 'Create page'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
