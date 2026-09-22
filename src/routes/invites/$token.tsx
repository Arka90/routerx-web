import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, MailX, UserPlus } from 'lucide-react'
import { orgApi } from '@/api/org-service'
import { useAuthStore } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/ui/logo'

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
  const wrongAccount = Boolean(
    sessionToken && email && invite && email.toLowerCase() !== invite.email.toLowerCase()
  )

  return (
    <div className="grid-dots flex min-h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center px-4 sm:px-6">
        <Link to="/">
          <Logo />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="card w-full max-w-md animate-rise p-8 text-center">
          {isLoading ? (
            <Loader2 className="mx-auto size-5 animate-spin text-subtle-foreground" />
          ) : isError || !invite ? (
            <>
              <span className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-down-soft text-down">
                <MailX className="size-5" />
              </span>
              <h1 className="text-lg font-semibold tracking-tight">This invitation isn't valid</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                It may have been revoked, already used, or simply expired. Ask whoever invited
                you to send a new one.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/">Back to RouteRX</Link>
              </Button>
            </>
          ) : (
            <>
              <span className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <UserPlus className="size-5" />
              </span>
              <h1 className="text-lg font-semibold tracking-tight">
                Join {invite.organization_name}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                You've been invited as{' '}
                <Badge variant="brand" size="sm" className="align-middle">
                  {invite.role}
                </Badge>{' '}
                at <span className="font-medium text-foreground">{invite.email}</span>.
              </p>

              {!sessionToken ? (
                <>
                  <p className="mt-6 text-[13px] text-muted-foreground">
                    Sign in as {invite.email} to accept.
                  </p>
                  <Button
                    variant="primary"
                    className="mt-3 w-full"
                    onClick={() => {
                      // Prefill the login form so the right account is used —
                      // the server refuses an invite accepted by anyone else.
                      setEmail(invite.email)
                      navigate({ to: '/auth/login' })
                    }}
                  >
                    Sign in to accept
                  </Button>
                </>
              ) : wrongAccount ? (
                <p className="mt-6 rounded-lg border border-degraded/30 bg-degraded-soft px-3 py-3 text-left text-[13px] leading-relaxed text-degraded">
                  You're signed in as {email}. This invitation was sent to {invite.email} — sign
                  in as that address to accept it.
                </p>
              ) : (
                <Button
                  variant="primary"
                  className="mt-6 w-full"
                  loading={accept.isPending}
                  onClick={() => accept.mutate()}
                >
                  Accept invitation
                </Button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
