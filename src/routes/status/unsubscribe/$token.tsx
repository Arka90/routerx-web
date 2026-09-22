import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { publicStatusApi } from '@/api/status-service'
import { getApiErrorMessage } from '@/api/errors'
import { Outcome } from '@/routes/status/confirm/$token'

export const Route = createFileRoute('/status/unsubscribe/$token')({
  component: Unsubscribe,
})

function Unsubscribe() {
  const { token } = Route.useParams()

  const { isLoading, error } = useQuery({
    queryKey: ['unsubscribe', token],
    queryFn: () => publicStatusApi.unsubscribe(token),
    retry: false,
  })

  return (
    <Outcome
      loading={isLoading}
      title={error ? 'That link has expired' : 'Unsubscribed'}
      body={
        error
          ? getApiErrorMessage(error, 'It may have already been used.')
          : "You won't receive any more updates from this status page."
      }
    />
  )
}
