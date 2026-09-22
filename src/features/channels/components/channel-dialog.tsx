import { useState } from 'react'
import { toast } from 'sonner'
import { useCreateChannel } from '@/hooks/org.queries'
import { getApiErrorMessage } from '@/api/errors'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { ChannelType } from '@/types/org.types'

const TYPES: Array<{
  value: ChannelType
  label: string
  hint: string
  placeholder: string
}> = [
  {
    value: 'email',
    label: 'Email',
    hint: 'Leave the recipients empty to notify everyone in the workspace.',
    placeholder: 'ops@example.com, oncall@example.com',
  },
  {
    value: 'slack',
    label: 'Slack',
    hint: 'Create an Incoming Webhook in Slack and paste its URL.',
    placeholder: 'https://hooks.slack.com/services/…',
  },
  {
    value: 'discord',
    label: 'Discord',
    hint: 'Channel settings → Integrations → Webhooks.',
    placeholder: 'https://discord.com/api/webhooks/…',
  },
  {
    value: 'webhook',
    label: 'Webhook',
    hint: 'We POST JSON. With a secret, requests carry an X-RouteRX-Signature header.',
    placeholder: 'https://example.com/hooks/routerx',
  },
]

export function ChannelDialog() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<ChannelType>('slack')
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [secret, setSecret] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createChannel = useCreateChannel()
  const selected = TYPES.find((item) => item.value === type)!

  const reset = () => {
    setType('slack')
    setName('')
    setTarget('')
    setSecret('')
    setError(null)
  }

  const buildConfig = (): Record<string, unknown> => {
    if (type === 'email') {
      return {
        recipients: target
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      }
    }

    if (type === 'webhook') {
      return secret.trim() ? { url: target.trim(), secret: secret.trim() } : { url: target.trim() }
    }

    return { webhook_url: target.trim() }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    createChannel.mutate(
      { type, name: name.trim() || selected.label, config: buildConfig() },
      {
        onSuccess: () => {
          toast.success('Channel added')
          setOpen(false)
          reset()
        },
        // The server validates the destination — including refusing a URL
        // that resolves to a private address — so show what it said.
        onError: (mutationError) =>
          setError(getApiErrorMessage(mutationError, 'Could not add that channel')),
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <button className="rounded-md bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-opacity hover:opacity-90 dark:bg-white dark:text-black">
          Add channel
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add a notification channel</DialogTitle>
          <DialogDescription>Where alerts for this workspace are sent.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={`rounded-md border px-2 py-2 text-[12px] font-medium transition-colors ${
                  type === option.value
                    ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label htmlFor="channel-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="channel-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={`${selected.label} alerts`}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="channel-target" className="text-sm font-medium">
              {type === 'email' ? 'Recipients' : 'Webhook URL'}
            </label>
            <Input
              id="channel-target"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder={selected.placeholder}
              className="font-mono text-[13px]"
            />
            <p className="text-[12px] text-neutral-500">{selected.hint}</p>
          </div>

          {type === 'webhook' && (
            <div className="space-y-2">
              <label htmlFor="channel-secret" className="text-sm font-medium">
                Signing secret <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <Input
                id="channel-secret"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                placeholder="A shared secret"
                className="font-mono text-[13px]"
              />
            </div>
          )}

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={createChannel.isPending}
            className="h-10 w-full rounded-md bg-black text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {createChannel.isPending ? 'Adding…' : 'Add channel'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
