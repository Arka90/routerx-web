import { useState } from 'react'
import { toast } from 'sonner'
import { MessageSquarePlus } from 'lucide-react'
import { useAddIncidentUpdate, useIncidentUpdates } from '@/hooks/status.queries'
import { useCanManage } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckboxField } from '@/components/ui/checkbox'
import { Segmented } from '@/components/ui/segmented'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import type { IncidentUpdateStatus } from '@/types/status.types'

const STATUSES: Array<{ value: IncidentUpdateStatus; label: string }> = [
  { value: 'investigating', label: 'Investigating' },
  { value: 'identified', label: 'Identified' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'resolved', label: 'Resolved' },
]

const STATUS_VARIANT: Record<IncidentUpdateStatus, BadgeVariant> = {
  investigating: 'degraded',
  identified: 'brand',
  monitoring: 'maintenance',
  resolved: 'up',
}

const STATUS_DOT: Record<IncidentUpdateStatus, string> = {
  investigating: 'bg-degraded',
  identified: 'bg-brand',
  monitoring: 'bg-maintenance',
  resolved: 'bg-up',
}

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
    <div className="mt-4 border-t border-border pt-4">
      {isLoading ? (
        <div className="mb-4 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
      ) : updates.length > 0 ? (
        <ol className="mb-5 space-y-4 border-l border-border pl-5">
          {updates.map((update) => (
            <li key={update.id} className="relative">
              <span
                aria-hidden
                className={cn(
                  'absolute top-1 -left-[25px] size-2.5 rounded-full ring-2 ring-card',
                  STATUS_DOT[update.status]
                )}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANT[update.status]} size="sm">
                  {update.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(update.created_at)}
                </span>
                {!update.is_public && (
                  <Badge variant="neutral" size="sm">
                    internal
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-line text-foreground">
                {update.body}
              </p>
              {update.author_email && (
                <p className="mt-0.5 text-[11px] text-subtle-foreground">{update.author_email}</p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mb-4 text-[13px] text-muted-foreground">No updates posted.</p>
      )}

      {canManage && (
        <form onSubmit={submit} className="space-y-3">
          <Segmented
            aria-label="Update status"
            size="sm"
            value={status}
            onChange={setStatus}
            options={STATUSES}
          />

          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={2}
            placeholder="What's happening, in plain language?"
            aria-label="Update text"
            className="min-h-0 text-[13px]"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <CheckboxField
              id={`incident-${incidentId}-public`}
              label={isPublic ? 'Visible on your status pages' : 'Internal note only'}
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked === true)}
              className="items-center"
            />

            <Button
              type="submit"
              size="sm"
              loading={addUpdate.isPending}
              disabled={!body.trim()}
            >
              <MessageSquarePlus />
              Post update
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
