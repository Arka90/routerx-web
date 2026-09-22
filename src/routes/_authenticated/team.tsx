import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import {
  useCreateInvite,
  useInvites,
  useMembers,
  useRemoveMember,
  useRevokeInvite,
  useUpdateMemberRole,
} from '@/hooks/org.queries'
import { useActiveRole, useAuthStore, useCanManage } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'
import { formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { Page, PageHeader, SectionHeader } from '@/components/ui/page-header'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { OrgRole } from '@/types/org.types'

export const Route = createFileRoute('/_authenticated/team')({
  component: TeamPage,
})

const ROLE_HELP: Record<OrgRole, string> = {
  owner: 'Full control, including deleting the workspace.',
  admin: 'Manage monitors, channels and teammates.',
  member: 'Read-only, but can acknowledge incidents.',
}

function TeamPage() {
  const canManage = useCanManage()
  const role = useActiveRole()
  const currentUserId = useAuthStore((state) => state.auth.user?.id)

  const [email, setEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<OrgRole>('member')

  const { data: memberData, isLoading } = useMembers()
  const { data: inviteData } = useInvites()

  const createInvite = useCreateInvite()
  const revokeInvite = useRevokeInvite()
  const updateRole = useUpdateMemberRole()
  const removeMember = useRemoveMember()
  const { confirm, dialog } = useConfirm()

  const members = memberData?.members ?? []
  const invites = inviteData?.invites ?? []

  // Only an owner can mint another owner, so don't offer it otherwise.
  const assignableRoles: OrgRole[] = role === 'owner' ? ['owner', 'admin', 'member'] : ['admin', 'member']

  const handleInvite = (event: React.FormEvent) => {
    event.preventDefault()

    if (!email.trim()) return

    createInvite.mutate(
      { email: email.trim(), role: inviteRole },
      {
        onSuccess: () => {
          toast.success(`Invitation sent to ${email.trim()}`)
          setEmail('')
        },
        onError: (error) =>
          toast.error(getApiErrorMessage(error, 'Could not send that invitation')),
      }
    )
  }

  return (
    <Page width="narrow">
      <PageHeader
        title="Team"
        description="Who can see and change monitoring for this workspace."
      />

      {canManage && (
        <section className="card space-y-4 p-5">
          <SectionHeader title="Invite a teammate" />

          <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              aria-label="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@example.com"
              className="flex-1"
            />
            <Select
              aria-label="Role"
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as OrgRole)}
              className="capitalize sm:w-36"
            >
              {assignableRoles.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Button
              type="submit"
              variant="primary"
              loading={createInvite.isPending}
              disabled={!email.trim()}
            >
              Send invite
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">{ROLE_HELP[inviteRole]}</p>
        </section>
      )}

      <section className="space-y-3">
        <SectionHeader
          title="Members"
          description={
            isLoading
              ? undefined
              : `${members.length} ${members.length === 1 ? 'person' : 'people'} in this workspace`
          }
        />

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {members.map((member) => {
              const self = member.user_id === currentUserId

              return (
                <div key={member.user_id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold uppercase text-brand"
                  >
                    {member.email.charAt(0)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {member.email}
                      </span>
                      {self && (
                        <Badge variant="brand" size="sm">
                          you
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDate(member.joined_at)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {canManage ? (
                      <Select
                        aria-label={`Role for ${member.email}`}
                        value={member.role}
                        onChange={(event) =>
                          updateRole.mutate(
                            { userId: member.user_id, role: event.target.value as OrgRole },
                            {
                              onSuccess: () => toast.success('Role updated'),
                              onError: (error) =>
                                toast.error(getApiErrorMessage(error, 'Could not change role')),
                            }
                          )
                        }
                        className="h-8 w-32 text-[13px] capitalize"
                      >
                        {assignableRoles.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                        {/* An owner viewed by an admin is not in assignableRoles. */}
                        {!assignableRoles.includes(member.role) && (
                          <option value={member.role}>{member.role}</option>
                        )}
                      </Select>
                    ) : (
                      <Badge size="sm">{member.role}</Badge>
                    )}

                    {canManage && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={self ? 'Leave this workspace' : `Remove ${member.email}`}
                        className="hover:bg-down-soft hover:text-down"
                        onClick={() => {
                          const message = self
                            ? 'Leave this workspace?'
                            : `Remove ${member.email} from this workspace?`

                          confirm({
                            title: message,
                            description: self
                              ? 'You lose access immediately and need a new invitation to come back.'
                              : 'They lose access immediately and need a new invitation to come back.',
                            confirmLabel: self ? 'Leave workspace' : 'Remove member',
                            destructive: true,
                            onConfirm: () =>
                              removeMember.mutate(member.user_id, {
                                onSuccess: () => {
                                  toast.success(self ? 'You left the workspace' : 'Member removed')
                                  if (self) window.location.href = '/dashboard'
                                },
                                onError: (error) =>
                                  toast.error(getApiErrorMessage(error, 'Could not remove')),
                              }),
                          })
                        }}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {canManage && invites.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Pending invitations"
            description="Sent but not yet accepted. Revoking one makes its link stop working."
          />

          <div className="card divide-y divide-border">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm text-foreground">{invite.email}</span>
                    <Badge size="sm">{invite.role}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expires {formatDate(invite.expires_at)}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  loading={revokeInvite.isPending && revokeInvite.variables === invite.id}
                  onClick={() =>
                    revokeInvite.mutate(invite.id, {
                      onSuccess: () => toast.success('Invitation revoked'),
                      onError: (error) =>
                        toast.error(getApiErrorMessage(error, 'Could not revoke')),
                    })
                  }
                >
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {dialog}
    </Page>
  )
}
