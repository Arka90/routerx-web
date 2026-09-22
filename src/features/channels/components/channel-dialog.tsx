import { useState } from 'react'
import { toast } from 'sonner'
import { Hash, Mail, MessageCircle, Plus, Webhook, type LucideIcon } from 'lucide-react'
import { useCreateChannel } from '@/hooks/org.queries'
import { getApiErrorMessage } from '@/api/errors'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FormError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { ChannelType } from '@/types/org.types'

const TYPES: Array<{
  value: ChannelType
  label: string
  hint: string
  placeholder: string
  icon: LucideIcon
}> = [
  {
    value: 'email',
    label: 'Email',
    hint: 'Leave the recipients empty to notify everyone in the workspace.',
    placeholder: 'ops@example.com, oncall@example.com',
    icon: Mail,
  },
  {
    value: 'slack',
    label: 'Slack',
    hint: 'Create an Incoming Webhook in Slack and paste its URL.',
    placeholder: 'https://hooks.slack.com/services/…',
    icon: Hash,
  },
  {
    value: 'discord',
    label: 'Discord',
    hint: 'Channel settings → Integrations → Webhooks.',
    placeholder: 'https://discord.com/api/webhooks/…',
    icon: MessageCircle,
  },
  {
    value: 'webhook',
    label: 'Webhook',
    hint: 'We POST JSON. With a secret, requests carry an X-RouteRX-Signature header.',
    placeholder: 'https://example.com/hooks/routerx',
    icon: Webhook,
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
        <Button variant="primary">
          <Plus />
          Add channel
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add a notification channel</DialogTitle>
          <DialogDescription>Where alerts for this workspace are sent.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            role="radiogroup"
            aria-label="Channel type"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {TYPES.map((option) => {
              const active = type === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setType(option.value)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors',
                    '[&_svg]:size-4 [&_svg]:shrink-0',
                    active
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  )}
                >
                  <option.icon aria-hidden />
                  {option.label}
                </button>
              )
            })}
          </div>

          <Field id="channel-name" label="Name">
            <Input
              id="channel-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={`${selected.label} alerts`}
            />
          </Field>

          <Field
            id="channel-target"
            label={type === 'email' ? 'Recipients' : 'Webhook URL'}
            hint={selected.hint}
          >
            <Input
              id="channel-target"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder={selected.placeholder}
              className="font-mono text-[13px]"
            />
          </Field>

          {type === 'webhook' && (
            <Field id="channel-secret" label="Signing secret" optional>
              <Input
                id="channel-secret"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                placeholder="A shared secret"
                autoComplete="off"
                className="font-mono text-[13px]"
              />
            </Field>
          )}

          <FormError>{error}</FormError>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={createChannel.isPending}
          >
            Add channel
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
