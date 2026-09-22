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
import { Input } from '@/components/ui/input'
import type { OrgRole } from '@/types/org.types'

export const Route = createFileRoute('/_authenticated/team')({
  component: TeamPage,
})

const ROLE_HELP: Record<OrgRole, string> = {
  owner: 'Full control, including deleting the workspace.',
  admin: 'Manage monitors, channels and teammates.',
  member: 'Read-only, but can acknowledge incidents.',
}

const selectClass =
  'h-8 rounded-md border border-neutral-200 bg-white px-2 text-[13px] text-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black dark:border-neutral-800 dark:bg-[#111] dark:text-neutral-100'

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
    <div className="animate-in fade-in max-w-4xl space-y-10 p-8 duration-500">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Team
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Who can see and change monitoring for this workspace.
        </p>
      </div>

      {canManage && (
        <section className="space-y-3 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Invite a teammate
          </h2>

          <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@example.com"
              className="flex-1"
            />
            <select
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as OrgRole)}
              className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-[#111] dark:text-neutral-100"
            >
              {assignableRoles.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={createInvite.isPending || !email.trim()}
              className="h-10 rounded-md bg-black px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {createInvite.isPending ? 'Sending…' : 'Invite'}
            </button>
          </form>

          <p className="text-[12px] text-neutral-500">{ROLE_HELP[inviteRole]}</p>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Members
        </h2>

        {isLoading ? (
          <div className="h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900" />
        ) : (
          <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {member.email}
                    {member.user_id === currentUserId && (
                      <span className="ml-2 text-[11px] font-normal text-neutral-400">you</span>
                    )}
                  </p>
                  <p className="text-[12px] text-neutral-500">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {canManage ? (
                    <select
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
                      className={selectClass}
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
                    </select>
                  ) : (
                    <span className="text-[12px] uppercase tracking-wider text-neutral-400">
                      {member.role}
                    </span>
                  )}

                  {canManage && (
                    <button
                      aria-label={`Remove ${member.email}`}
                      onClick={() => {
                        const self = member.user_id === currentUserId
                        const message = self
                          ? 'Leave this workspace?'
                          : `Remove ${member.email} from this workspace?`

                        if (!confirm(message)) return

                        removeMember.mutate(member.user_id, {
                          onSuccess: () => {
                            toast.success(self ? 'You left the workspace' : 'Member removed')
                            if (self) window.location.href = '/dashboard'
                          },
                          onError: (error) =>
                            toast.error(getApiErrorMessage(error, 'Could not remove')),
                        })
                      }}
                      className="rounded-md border border-neutral-200 p-1.5 text-neutral-400 transition-colors hover:text-red-600 dark:border-neutral-800"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {canManage && invites.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Pending invitations
          </h2>

          <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm text-neutral-900 dark:text-neutral-100">
                    {invite.email}
                  </p>
                  <p className="text-[12px] text-neutral-500">
                    {invite.role} · expires {new Date(invite.expires_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() =>
                    revokeInvite.mutate(invite.id, {
                      onSuccess: () => toast.success('Invitation revoked'),
                      onError: (error) =>
                        toast.error(getApiErrorMessage(error, 'Could not revoke')),
                    })
                  }
                  className="shrink-0 rounded-md border border-neutral-200 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
