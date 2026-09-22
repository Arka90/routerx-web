import { useState } from 'react'
import { toast } from 'sonner'
import { MessageSquarePlus } from 'lucide-react'
import { useAddIncidentUpdate, useIncidentUpdates } from '@/hooks/status.queries'
import { useCanManage } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'
import { cn } from '@/lib/utils'
import type { IncidentUpdateStatus } from '@/types/status.types'

const STATUSES: Array<{ value: IncidentUpdateStatus; label: string }> = [
  { value: 'investigating', label: 'Investigating' },
  { value: 'identified', label: 'Identified' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'resolved', label: 'Resolved' },
]

/**
 * The narrative on an incident.
 *
 * Public updates appear on any status page carrying this monitor, which is
 * why the toggle is prominent rather than buried — posting an internal note
 * to customers is not a mistake you can take back.
 */
export function IncidentUpdates({ incidentId }: { incidentId: number }) {
  const canManage = useCanManage()
  const { data, isLoading } = useIncidentUpdates(incidentId)
  const addUpdate = useAddIncidentUpdate()

  const [status, setStatus] = useState<IncidentUpdateStatus>('investigating')
  const [body, setBody] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const updates = data?.updates ?? []

  const submit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!body.trim()) return

    addUpdate.mutate(
      { incidentId, status, body: body.trim(), is_public: isPublic },
      {
        onSuccess: () => {
          toast.success(isPublic ? 'Update posted' : 'Internal note saved')
          setBody('')
        },
        onError: (error) =>
          toast.error(getApiErrorMessage(error, 'Could not post that update')),
      }
    )
  }

  return (
    <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-900">
      {isLoading ? (
        <div className="h-4 w-32 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
      ) : updates.length > 0 ? (
        <ol className="mb-4 space-y-3 border-l border-neutral-200 pl-4 dark:border-neutral-800">
          {updates.map((update) => (
            <li key={update.id}>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                <span>{update.status}</span>
                <span>·</span>
                <span>{new Date(update.created_at).toLocaleString()}</span>
                {!update.is_public && (
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 normal-case tracking-normal text-neutral-500 dark:bg-neutral-900">
                    internal
                  </span>
                )}
              </div>
              <p className="mt-0.5 whitespace-pre-line text-[13px] text-neutral-700 dark:text-neutral-300">
                {update.body}
              </p>
              {update.author_email && (
                <p className="mt-0.5 text-[11px] text-neutral-400">{update.author_email}</p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mb-4 text-[13px] text-neutral-500">No updates posted.</p>
      )}

      {canManage && (
        <form onSubmit={submit} className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {STATUSES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors',
                  status === option.value
                    ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={2}
            placeholder="What's happening, in plain language?"
            className="w-full rounded-md border border-neutral-200 bg-white p-2.5 text-[13px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black dark:border-neutral-800 dark:bg-[#111] dark:text-neutral-100 dark:focus-visible:ring-white"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
                className="h-4 w-4 accent-black dark:accent-white"
              />
              <span className="text-[12px] text-neutral-600 dark:text-neutral-400">
                {isPublic ? 'Visible on your status pages' : 'Internal note only'}
              </span>
            </label>

            <button
              type="submit"
              disabled={addUpdate.isPending || !body.trim()}
              className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              {addUpdate.isPending ? 'Posting…' : 'Post update'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
