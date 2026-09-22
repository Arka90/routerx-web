import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Bell,
  Hash,
  Mail,
  MessageCircle,
  Send,
  Trash2,
  Webhook,
  type LucideIcon,
} from 'lucide-react'
import {
  useChannels,
  useDeleteChannel,
  useTestChannel,
  useUpdateChannel,
} from '@/hooks/org.queries'
import { useCanManage } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'
import { ChannelDialog } from '@/features/channels/components/channel-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Page, PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import type { ChannelType } from '@/types/org.types'

export const Route = createFileRoute('/_authenticated/channels')({
  component: ChannelsPage,
})

const TYPE_ICON: Record<ChannelType, LucideIcon> = {
  email: Mail,
  slack: Hash,
  discord: MessageCircle,
  webhook: Webhook,
}

function describe(config: Record<string, unknown>): string {
  if (typeof config.webhook_url === 'string') {
    try {
      const url = new URL(config.webhook_url)
      // Webhook URLs are credentials — the path is the secret part.
      return `${url.hostname}/…`
    } catch {
      return 'Webhook'
    }
  }

  if (typeof config.url === 'string') {
    try {
      return new URL(config.url).hostname
    } catch {
      return 'Webhook'
    }
  }

  const recipients = config.recipients
  if (Array.isArray(recipients)) {
    return recipients.length > 0 ? recipients.join(', ') : 'Everyone in the workspace'
  }

  return '—'
}

function ChannelsPage() {
  const { data, isLoading } = useChannels()
  const canManage = useCanManage()

  const updateChannel = useUpdateChannel()
  const deleteChannel = useDeleteChannel()
  const testChannel = useTestChannel()
  const { confirm, dialog } = useConfirm()

  const channels = data?.channels ?? []

  return (
    <Page>
      <PageHeader
        title="Alert channels"
        description="Where outages are announced. A monitor with no channels of its own notifies every enabled channel here."
        actions={canManage ? <ChannelDialog /> : undefined}
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : channels.length === 0 ? (
        <EmptyState
          icon={<Bell />}
          title="No channels configured"
          description="Without one, outages are recorded but nobody is told."
          action={canManage ? <ChannelDialog /> : undefined}
        />
      ) : (
        <div className="card divide-y divide-border">
          {channels.map((channel) => {
            const Icon = TYPE_ICON[channel.type] ?? Webhook
            const testing = testChannel.isPending && testChannel.variables === channel.id
            const toggling =
              updateChannel.isPending && updateChannel.variables?.id === channel.id

            return (
              <div
                key={channel.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {channel.name}
                      </span>
                      <Badge size="sm">{channel.type}</Badge>
                      {!channel.enabled && (
                        <Badge variant="paused" size="sm">
                          Disabled
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                      {describe(channel.config)}
                    </p>
                  </div>
                </div>

                {canManage && (
                  <div className="flex shrink-0 items-center gap-2 sm:pl-3">
                    <Button
                      variant="outline"
                      size="sm"
                      loading={testing}
                      onClick={() =>
                        testChannel.mutate(channel.id, {
                          onSuccess: () => toast.success('Test alert sent'),
                          onError: (error) =>
                            toast.error(getApiErrorMessage(error, 'Delivery failed'), {
                              duration: 6000,
                            }),
                        })
                      }
                    >
                      {!testing && <Send />}
                      Send test
                    </Button>

                    <Switch
                      checked={channel.enabled}
                      disabled={toggling}
                      aria-label={`${channel.enabled ? 'Disable' : 'Enable'} ${channel.name}`}
                      onCheckedChange={() =>
                        updateChannel.mutate({
                          id: channel.id,
                          payload: { enabled: !channel.enabled },
                        })
                      }
                    />

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${channel.name}`}
                      className="hover:bg-down-soft hover:text-down"
                      onClick={() =>
                        confirm({
                          title: `Delete the channel "${channel.name}"?`,
                          description:
                            'Alerts stop going to this destination immediately. This cannot be undone.',
                          confirmLabel: 'Delete channel',
                          destructive: true,
                          onConfirm: () =>
                            deleteChannel.mutate(channel.id, {
                              onSuccess: () => toast.success('Channel deleted'),
                              onError: (error) =>
                                toast.error(getApiErrorMessage(error, 'Could not delete')),
                            }),
                        })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {dialog}
    </Page>
  )
}
