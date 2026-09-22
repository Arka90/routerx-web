import { useState } from 'react'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import { useDeliveries, useUpdatePolicy } from '@/hooks/monitor.queries'
import { useChannels } from '@/hooks/org.queries'
import { useRegions } from '@/hooks/status.queries'
import { getApiErrorMessage } from '@/api/errors'
import { useCanManage } from '@/stores/authStore'
import { formatRelative } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckboxField } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { MonitorDetail } from '@/types/monitor.types'

const MUTE_OPTIONS = [
  { label: 'Not muted', hours: 0 },
  { label: 'Mute for 1 hour', hours: 1 },
  { label: 'Mute for 4 hours', hours: 4 },
  { label: 'Mute for 24 hours', hours: 24 },
]

export function AlertPolicyPanel({ monitor }: { monitor: MonitorDetail }) {
  const canManage = useCanManage()
  const updatePolicy = useUpdatePolicy()
  const { data: channelData } = useChannels()
  const { data: regionData } = useRegions()
  const { data: deliveryData } = useDeliveries(monitor.id)

  const [failureThreshold, setFailureThreshold] = useState(
    String(monitor.policy.failure_threshold)
  )
  const [recoveryThreshold, setRecoveryThreshold] = useState(
    String(monitor.policy.recovery_threshold)
  )
  const [alertOnSlow, setAlertOnSlow] = useState(monitor.policy.alert_on_slow)
  const [slowThreshold, setSlowThreshold] = useState(
    String(monitor.policy.slow_threshold_ms)
  )
  const [renotify, setRenotify] = useState(
    monitor.policy.renotify_minutes === null ? '' : String(monitor.policy.renotify_minutes)
  )
  const [muteHours, setMuteHours] = useState('0')
  const [selectedChannels, setSelectedChannels] = useState<number[]>(monitor.channel_ids)
  const [confirmations, setConfirmations] = useState(String(monitor.policy.confirmations))

  // How many vantage points this monitor is actually checked from — an empty
  // list on the monitor means every enabled region.
  const regionCount =
    monitor.regions.length > 0
      ? monitor.regions.length
      : (regionData?.regions.length ?? 1)

  const channels = channelData?.channels ?? []
  const mutedUntil = monitor.policy.muted_until ? new Date(monitor.policy.muted_until) : null
  const currentlyMuted = mutedUntil !== null && mutedUntil > new Date()

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()

    const hours = Number(muteHours)

    updatePolicy.mutate(
      {
        id: monitor.id,
        payload: {
          failure_threshold: Number(failureThreshold),
          recovery_threshold: Number(recoveryThreshold),
          alert_on_slow: alertOnSlow,
          slow_threshold_ms: Number(slowThreshold),
          renotify_minutes: renotify.trim() === '' ? null : Number(renotify),
          confirmations: Number(confirmations),
          muted_until:
            hours > 0 ? new Date(Date.now() + hours * 3600 * 1000).toISOString() : null,
          channel_ids: selectedChannels,
        },
      },
      {
        onSuccess: () => {
          toast.success('Alert policy saved')
          setMuteHours('0')
        },
        onError: (error) =>
          toast.error(getApiErrorMessage(error, 'Could not save the alert policy')),
      }
    )
  }

  const deliveries = deliveryData?.deliveries ?? []

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form onSubmit={handleSave} className="card space-y-5 p-5">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">Alert policy</h3>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            How many failed checks it takes to page someone, and who hears about it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="failure"
            label="Failures before alerting"
            hint="Higher values ride out a single blip."
          >
            <Input
              id="failure"
              type="number"
              min={1}
              max={10}
              value={failureThreshold}
              onChange={(event) => setFailureThreshold(event.target.value)}
              disabled={!canManage}
              className="tabular"
            />
          </Field>

          <Field
            id="recovery"
            label="Successes before recovering"
            hint="Stops a flapping service spamming you."
          >
            <Input
              id="recovery"
              type="number"
              min={1}
              max={10}
              value={recoveryThreshold}
              onChange={(event) => setRecoveryThreshold(event.target.value)}
              disabled={!canManage}
              className="tabular"
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-surface-2/60 p-4">
          <CheckboxField
            id="alert_on_slow"
            label="Alert when the site is slow but alive"
            hint="A monitor that keeps responding above the threshold is marked degraded and opens an incident."
            checked={alertOnSlow}
            onCheckedChange={(checked) => setAlertOnSlow(checked === true)}
            disabled={!canManage}
          />

          {alertOnSlow && (
            <Field id="slow" label="Slow threshold (ms)">
              <Input
                id="slow"
                type="number"
                min={100}
                max={60000}
                step={100}
                value={slowThreshold}
                onChange={(event) => setSlowThreshold(event.target.value)}
                disabled={!canManage}
                className="tabular"
              />
            </Field>
          )}
        </div>

        {regionCount > 1 && (
          <Field
            id="confirmations"
            label="Regions that must agree"
            hint="One vantage point can't tell a site being down from the path to it being down. Requiring two means a routing problem doesn't page anyone — the failing region is still shown on the monitor. Recovery always needs every region to be healthy."
          >
            <Select
              id="confirmations"
              value={confirmations}
              onChange={(event) => setConfirmations(event.target.value)}
              disabled={!canManage}
            >
              {Array.from({ length: regionCount }).map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1} of {regionCount}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field
          id="renotify"
          label="Remind me every"
          hint="Minutes between reminders while an incident is still open. Leave empty to be told once. Reminders stop as soon as someone acknowledges."
        >
          <Input
            id="renotify"
            type="number"
            min={5}
            max={1440}
            placeholder="Never"
            value={renotify}
            onChange={(event) => setRenotify(event.target.value)}
            disabled={!canManage}
            className="tabular"
          />
        </Field>

        <Field
          id="mute"
          label="Mute"
          hint={
            currentlyMuted
              ? `Muted until ${mutedUntil!.toLocaleString()}. Incidents are still recorded.`
              : 'Muting stops notifications. Incidents are still recorded either way.'
          }
        >
          <Select
            id="mute"
            value={muteHours}
            onChange={(event) => setMuteHours(event.target.value)}
            disabled={!canManage}
          >
            {MUTE_OPTIONS.map((option) => (
              <option key={option.hours} value={option.hours}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        {canManage && (
          <div className="pt-1">
            <Button type="submit" variant="primary" loading={updatePolicy.isPending}>
              Save policy
            </Button>
          </div>
        )}
      </form>

      <div className="space-y-6">
        <section className="card space-y-4 p-5">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Notify these channels
          </h3>

          {channels.length === 0 ? (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              No channels yet.{' '}
              <Link to="/channels" className="link">
                Add one
              </Link>{' '}
              to get Slack or webhook alerts.
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {channels.map((channel) => (
                  <CheckboxField
                    key={channel.id}
                    id={`channel-${channel.id}`}
                    label={
                      <span className="flex items-center gap-2">
                        <span className="truncate">{channel.name}</span>
                        <Badge size="sm">{channel.type}</Badge>
                      </span>
                    }
                    disabled={!canManage}
                    checked={selectedChannels.includes(channel.id)}
                    onCheckedChange={(checked) =>
                      setSelectedChannels(
                        checked === true
                          ? [...selectedChannels, channel.id]
                          : selectedChannels.filter((id) => id !== channel.id)
                      )
                    }
                    className="items-center"
                  />
                ))}
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {selectedChannels.length === 0
                  ? 'With none selected, every enabled channel in the workspace is used.'
                  : 'Only the selected channels are notified for this monitor.'}
              </p>
            </>
          )}
        </section>

        <section className="card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Recent deliveries
            </h3>
          </div>

          {deliveries.length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-muted-foreground">Nothing sent yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {deliveries.slice(0, 8).map((delivery) => (
                <li key={delivery.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-foreground">
                      <span className="font-medium">{delivery.event}</span>
                      <span className="mx-1.5 text-subtle-foreground">→</span>
                      {delivery.channel_name ?? delivery.channel_type}
                    </p>
                    {delivery.error && (
                      <p
                        className="mt-0.5 truncate font-mono text-xs text-down"
                        title={delivery.error}
                      >
                        {delivery.error}
                      </p>
                    )}
                    <p className="mt-0.5 text-[11px] text-subtle-foreground">
                      {formatRelative(delivery.created_at)}
                    </p>
                  </div>
                  <Badge variant={delivery.status === 'sent' ? 'up' : 'down'} size="sm">
                    {delivery.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
