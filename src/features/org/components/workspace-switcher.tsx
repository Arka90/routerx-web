import { useState } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useCreateOrganization } from '@/hooks/org.queries'
import { getApiErrorMessage } from '@/api/errors'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export function WorkspaceSwitcher() {
  const { organizations, activeOrgId, setActiveOrg } = useAuthStore((state) => state.auth)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const queryClient = useQueryClient()
  const createOrganization = useCreateOrganization()

  const active = organizations.find((org) => org.id === activeOrgId)

  const switchTo = (orgId: number) => {
    if (orgId === activeOrgId) {
      setOpen(false)
      return
    }

    setActiveOrg(orgId)
    setOpen(false)

    // Every cached list is scoped to the previous workspace, so drop all of
    // it rather than briefly showing another workspace's monitors.
    queryClient.clear()
  }

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault()

    if (!name.trim()) return

    createOrganization.mutate(name.trim(), {
      onSuccess: (data) => {
        toast.success(`Created ${data.organization.name}`)
        setCreating(false)
        setName('')
        setActiveOrg(data.organization.id)
        queryClient.clear()
      },
      onError: (error) =>
        toast.error(getApiErrorMessage(error, 'Could not create that workspace')),
    })
  }

  return (
    <>
      <div className="relative px-3 pb-3">
        <button
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-left transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-black dark:hover:bg-neutral-900"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              {active?.name ?? 'No workspace'}
            </span>
            <span className="block text-[11px] uppercase tracking-wider text-neutral-400">
              {active?.role ?? '—'}
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
        </button>

        {open && (
          <>
            {/* Click-away target, so the menu closes without a global listener. */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-3 right-3 z-20 mt-1 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-[#0A0A0A]">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => switchTo(org.id)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  <span className="min-w-0 flex-1 truncate text-neutral-900 dark:text-neutral-100">
                    {org.name}
                  </span>
                  {org.id === activeOrgId && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-neutral-900 dark:text-white" />
                  )}
                </button>
              ))}

              <button
                onClick={() => {
                  setOpen(false)
                  setCreating(true)
                }}
                className={cn(
                  'flex w-full items-center gap-2 border-t border-neutral-200 px-3 py-2 text-left text-[13px] text-neutral-600 transition-colors hover:bg-neutral-50',
                  'dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900'
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                New workspace
              </button>
            </div>
          </>
        )}
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Create a workspace</DialogTitle>
            <DialogDescription>
              Workspaces keep monitors, alert channels and teammates separate.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <Input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Acme Production"
              maxLength={80}
            />
            <button
              type="submit"
              disabled={createOrganization.isPending || !name.trim()}
              className="h-10 w-full rounded-md bg-black text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {createOrganization.isPending ? 'Creating…' : 'Create workspace'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
