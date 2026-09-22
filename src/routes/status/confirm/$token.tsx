import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { publicStatusApi } from '@/api/status-service'
import { getApiErrorMessage } from '@/api/errors'

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
  title,
  body,
}: {
  loading: boolean
  title: string
  body: string
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-6 font-sans dark:bg-black">
      <div className="w-full max-w-md text-center">
        {loading ? (
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-neutral-400" />
        ) : (
          <>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {title}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">{body}</p>
          </>
        )}
      </div>
    </div>
  )
}
