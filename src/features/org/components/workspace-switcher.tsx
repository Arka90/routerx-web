import { useState } from 'react'
import { Building2, ChevronsUpDown, Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useCreateOrganization } from '@/hooks/org.queries'
import { getApiErrorMessage } from '@/api/errors'
import {
  DropdownMenu,
  DropdownMenuCheckItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'

export function WorkspaceSwitcher() {
  const { organizations, activeOrgId, setActiveOrg } = useAuthStore((state) => state.auth)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const queryClient = useQueryClient()
  const createOrganization = useCreateOrganization()

  const active = organizations.find((org) => org.id === activeOrgId)

  const switchTo = (orgId: number) => {
    if (orgId === activeOrgId) return

    setActiveOrg(orgId)

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-background px-2.5 py-2 text-left transition-colors hover:border-border-strong hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-3 text-muted-foreground">
              <Building2 className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-foreground">
                {active?.name ?? 'No workspace'}
              </span>
              <span className="block text-[11px] capitalize text-subtle-foreground">
                {active?.role ?? '—'}
              </span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-subtle-foreground" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-[224px]">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {organizations.map((org) => (
            <DropdownMenuCheckItem
              key={org.id}
              checked={org.id === activeOrgId}
              onSelect={() => switchTo(org.id)}
            >
              {org.name}
              <span className="ml-1.5 text-[11px] capitalize text-subtle-foreground">{org.role}</span>
            </DropdownMenuCheckItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setCreating(true)}>
            <Plus />
            New workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Create a workspace</DialogTitle>
            <DialogDescription>
              Workspaces keep monitors, alert channels and teammates separate.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <Field id="workspace-name" label="Name">
              <Input
                id="workspace-name"
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Acme Production"
                maxLength={80}
              />
            </Field>
            <Button
              type="submit"
              className="w-full"
              loading={createOrganization.isPending}
              disabled={!name.trim()}
            >
              Create workspace
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
