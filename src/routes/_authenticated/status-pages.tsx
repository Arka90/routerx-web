import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ExternalLink, Globe, Plus } from 'lucide-react'
import { useCreateStatusPage, useStatusPages } from '@/hooks/status.queries'
import { useCanManage } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'
import { formatRelative } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Field, FormError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Page, PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_authenticated/status-pages')({
  component: StatusPagesPage,
})

function StatusPagesPage() {
  const { data, isLoading } = useStatusPages()
  const canManage = useCanManage()

  const pages = data?.status_pages ?? []

  return (
    <Page>
      <PageHeader
        title="Status pages"
        description="A public page your customers can read during an outage, without an account."
        actions={canManage ? <CreatePageDialog /> : undefined}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : pages.length === 0 ? (
        <EmptyState
          icon={<Globe />}
          title="No status pages yet"
          description={
            'A status page is the cheapest way to stop "is it down?" emails during an incident.'
          }
          action={canManage ? <CreatePageDialog /> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pages.map((page) => (
            <div key={page.id} className="card card-hover flex flex-col p-5">
              <Link
                to="/status-page/$pageId"
                params={{ pageId: String(page.id) }}
                className="block min-w-0 flex-1 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {page.name}
                  </span>
                  <Badge variant={page.published ? 'up' : 'paused'} size="sm">
                    {page.published ? 'Live' : 'Draft'}
                  </Badge>
                </div>
                <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                  /status/{page.slug}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Updated {formatRelative(page.updated_at)}
                </p>
              </Link>

              {page.published && (
                <div className="mt-4 border-t border-border pt-4">
                  <Button asChild variant="outline" size="xs">
                    <a href={page.public_url} target="_blank" rel="noreferrer">
                      <ExternalLink />
                      View public page
                    </a>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Page>
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
        <Button variant="primary">
          <Plus />
          New status page
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Create a status page</DialogTitle>
          <DialogDescription>
            It starts as a draft — nothing is public until you publish it.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
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
          <Field id="page-name" label="Name">
            <Input
              id="page-name"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Acme Status"
            />
          </Field>

          <Field
            id="page-slug"
            label="Address"
            hint={<span className="font-mono">/status/{suggested || '…'}</span>}
          >
            <Input
              id="page-slug"
              value={suggested}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="acme-status"
              className="font-mono text-[13px]"
            />
          </Field>

          <FormError>{error}</FormError>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={createPage.isPending}
            disabled={!name.trim()}
          >
            Create page
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
