import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Send, Trash2 } from 'lucide-react'
import {
  useChannels,
  useDeleteChannel,
  useTestChannel,
  useUpdateChannel,
} from '@/hooks/org.queries'
import { useCanManage } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'
import { ChannelDialog } from '@/features/channels/components/channel-dialog'

export const Route = createFileRoute('/_authenticated/channels')({
  component: ChannelsPage,
})

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

  const channels = data?.channels ?? []

  return (
    <div className="animate-in fade-in space-y-8 p-8 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Alert channels
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
            Where outages are announced. A monitor with no channels of its own notifies every
            enabled channel here.
          </p>
        </div>

        {canManage && <ChannelDialog />}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-16 rounded-lg bg-neutral-100 dark:bg-neutral-900" />
          <div className="h-16 rounded-lg bg-neutral-100 dark:bg-neutral-900" />
        </div>
      ) : channels.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center dark:border-neutral-800 dark:bg-[#0A0A0A]">
          <h3 className="mb-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            No channels configured
          </h3>
          <p className="text-xs text-neutral-500">
            Without one, outages are recorded but nobody is told.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {channel.name}
                  </span>
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:bg-neutral-900">
                    {channel.type}
                  </span>
                  {!channel.enabled && (
                    <span className="text-[11px] font-medium text-neutral-400">Disabled</span>
                  )}
                </div>
                <p className="mt-0.5 truncate font-mono text-[12px] text-neutral-500">
                  {describe(channel.config)}
                </p>
              </div>

              {canManage && (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() =>
                      testChannel.mutate(channel.id, {
                        onSuccess: () => toast.success('Test alert sent'),
                        onError: (error) =>
                          toast.error(getApiErrorMessage(error, 'Delivery failed'), {
                            duration: 6000,
                          }),
                      })
                    }
                    disabled={testChannel.isPending}
                    className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                  >
                    <Send className="h-3 w-3" />
                    Test
                  </button>

                  <button
                    onClick={() =>
                      updateChannel.mutate({
                        id: channel.id,
                        payload: { enabled: !channel.enabled },
                      })
                    }
                    className="rounded-md border border-neutral-200 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                  >
                    {channel.enabled ? 'Disable' : 'Enable'}
                  </button>

                  <button
                    aria-label={`Delete ${channel.name}`}
                    onClick={() => {
                      if (!confirm(`Delete the channel "${channel.name}"?`)) return

                      deleteChannel.mutate(channel.id, {
                        onSuccess: () => toast.success('Channel deleted'),
                        onError: (error) =>
                          toast.error(getApiErrorMessage(error, 'Could not delete')),
                      })
                    }}
                    className="rounded-md border border-neutral-200 p-1.5 text-neutral-400 transition-colors hover:text-red-600 dark:border-neutral-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
