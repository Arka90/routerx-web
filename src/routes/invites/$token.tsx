import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { orgApi } from '@/api/org-service'
import { useAuthStore } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'

export const Route = createFileRoute('/invites/$token')({
  component: AcceptInvitePage,
})

function AcceptInvitePage() {
  const { token } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { sessionToken, email, setActiveOrg, setEmail } = useAuthStore((state) => state.auth)

  // Readable while signed out, so the page can say which workspace and which
  // address the invitation is for before asking anyone to sign in.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['invite', token],
    queryFn: () => orgApi.peekInvite(token),
    retry: false,
  })

  const accept = useMutation({
    mutationFn: () => orgApi.acceptInvite(token),
    onSuccess: (result) => {
      toast.success(`You've joined ${result.organization.name}`)
      setActiveOrg(result.organization.id)
      queryClient.clear()
      navigate({ to: '/dashboard' })
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Could not accept this invitation')),
  })

  const invite = data?.invite

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-[#0A0A0A]">
        <div className="mx-auto mb-6 flex h-10 w-10 items-center justify-center bg-black text-xs font-bold uppercase text-white dark:bg-white dark:text-black">
          RX
        </div>

        {isLoading ? (
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-neutral-400" />
        ) : isError || !invite ? (
          <>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              This invitation isn't valid
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              It may have been revoked, already used, or simply expired. Ask whoever invited
              you to send a new one.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Join {invite.organization_name}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              You've been invited as <strong>{invite.role}</strong>, at{' '}
              <strong>{invite.email}</strong>.
            </p>

            {!sessionToken ? (
              <>
                <p className="mt-6 text-[13px] text-neutral-500">
                  Sign in as {invite.email} to accept.
                </p>
                <button
                  onClick={() => {
                    // Prefill the login form so the right account is used —
                    // the server refuses an invite accepted by anyone else.
                    setEmail(invite.email)
                    navigate({ to: '/auth/login' })
                  }}
                  className="mt-4 h-10 w-full rounded-md bg-black text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
                >
                  Sign in to accept
                </button>
              </>
            ) : email && email.toLowerCase() !== invite.email.toLowerCase() ? (
              <p className="mt-6 rounded-md bg-amber-50 px-3 py-3 text-[13px] text-amber-700 dark:bg-amber-900/10 dark:text-amber-500">
                You're signed in as {email}. This invitation was sent to {invite.email} — sign
                in as that address to accept it.
              </p>
            ) : (
              <button
                onClick={() => accept.mutate()}
                disabled={accept.isPending}
                className="mt-6 h-10 w-full rounded-md bg-black text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
              >
                {accept.isPending ? 'Joining…' : 'Accept invitation'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
