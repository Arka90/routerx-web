import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { publicStatusApi } from '@/api/status-service'
import { getApiErrorMessage } from '@/api/errors'
import { Logo } from '@/components/ui/logo'

export const Route = createFileRoute('/status/confirm/$token')({
  component: ConfirmSubscription,
})

function ConfirmSubscription() {
  const { token } = Route.useParams()

  // A query rather than a mutation because arriving at the page *is* the
  // action — there is nothing further to click.
  const { data, isLoading, error } = useQuery({
    queryKey: ['confirm-subscription', token],
    queryFn: () => publicStatusApi.confirm(token),
    retry: false,
  })

  return (
    <Outcome
      loading={isLoading}
      ok={!error}
      title={error ? 'That link has expired' : 'Subscription confirmed'}
      body={
        error
          ? getApiErrorMessage(error, 'It may have already been used.')
          : `We'll email ${data?.email ?? 'you'} when there's an incident.`
      }
    />
  )
}

export function Outcome({
  loading,
  ok,
  title,
  body,
}: {
  loading: boolean
  ok: boolean
  title: string
  body: string
}) {
  return (
    <div className="grid-dots flex min-h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center px-4 sm:px-6">
        <Link to="/">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="card w-full max-w-md animate-rise p-8 text-center">
          {loading ? (
            <Loader2 className="mx-auto size-5 animate-spin text-subtle-foreground" />
          ) : (
            <>
              <span
                className={
                  ok
                    ? 'mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-up-soft text-up'
                    : 'mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-down-soft text-down'
                }
              >
                {ok ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
              </span>
              <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
