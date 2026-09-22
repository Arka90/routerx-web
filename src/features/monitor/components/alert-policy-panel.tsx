import { useState } from 'react'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import { useDeliveries, useUpdatePolicy } from '@/hooks/monitor.queries'
import { useChannels } from '@/hooks/org.queries'
import { useRegions } from '@/hooks/status.queries'
import { getApiErrorMessage } from '@/api/errors'
import { useCanManage } from '@/stores/authStore'
import { Input } from '@/components/ui/input'
import type { MonitorDetail } from '@/types/monitor.types'

const selectClass =
  'flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black dark:border-neutral-800 dark:bg-[#111] dark:text-neutral-100 dark:focus-visible:ring-white'

const labelClass = 'text-sm font-medium text-neutral-900 dark:text-neutral-100'
const hintClass = 'text-[12px] text-neutral-500 dark:text-neutral-400'

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

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div>
          <h3 className="text-lg font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
            Alert policy
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            How many failed checks it takes to page someone, and who hears about it.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="failure" className={labelClass}>
              Failures before alerting
            </label>
            <Input
              id="failure"
              type="number"
              min={1}
              max={10}
              value={failureThreshold}
              onChange={(event) => setFailureThreshold(event.target.value)}
              disabled={!canManage}
            />
            <p className={hintClass}>Higher values ride out a single blip.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="recovery" className={labelClass}>
              Successes before recovering
            </label>
            <Input
              id="recovery"
              type="number"
              min={1}
              max={10}
              value={recoveryThreshold}
              onChange={(event) => setRecoveryThreshold(event.target.value)}
              disabled={!canManage}
            />
            <p className={hintClass}>Stops a flapping service spamming you.</p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={alertOnSlow}
              onChange={(event) => setAlertOnSlow(event.target.checked)}
              disabled={!canManage}
              className="h-4 w-4 accent-black dark:accent-white"
            />
            <span className={labelClass}>Alert when the site is slow but alive</span>
          </label>

          <p className={hintClass}>
            A monitor that keeps responding above the threshold is marked degraded and opens
            an incident.
          </p>

          {alertOnSlow && (
            <div className="space-y-2 pt-1">
              <label htmlFor="slow" className={hintClass}>
                Slow threshold (ms)
              </label>
              <Input
                id="slow"
                type="number"
                min={100}
                max={60000}
                step={100}
                value={slowThreshold}
                onChange={(event) => setSlowThreshold(event.target.value)}
                disabled={!canManage}
              />
            </div>
          )}
        </div>

        {regionCount > 1 && (
          <div className="space-y-2">
            <label htmlFor="confirmations" className={labelClass}>
              Regions that must agree
            </label>
            <select
              id="confirmations"
              value={confirmations}
              onChange={(event) => setConfirmations(event.target.value)}
              disabled={!canManage}
              className={selectClass}
            >
              {Array.from({ length: regionCount }).map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1} of {regionCount}
                </option>
              ))}
            </select>
            <p className={hintClass}>
              One vantage point can't tell a site being down from the path to it being
              down. Requiring two means a routing problem doesn't page anyone — the
              failing region is still shown on the monitor. Recovery always needs every
              region to be healthy.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="renotify" className={labelClass}>
            Remind me every
          </label>
          <Input
            id="renotify"
            type="number"
            min={5}
            max={1440}
            placeholder="Never"
            value={renotify}
            onChange={(event) => setRenotify(event.target.value)}
            disabled={!canManage}
          />
          <p className={hintClass}>
            Minutes between reminders while an incident is still open. Leave empty to be told
            once. Reminders stop as soon as someone acknowledges.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="mute" className={labelClass}>
            Mute
          </label>
          <select
            id="mute"
            value={muteHours}
            onChange={(event) => setMuteHours(event.target.value)}
            disabled={!canManage}
            className={selectClass}
          >
            {MUTE_OPTIONS.map((option) => (
              <option key={option.hours} value={option.hours}>
                {option.label}
              </option>
            ))}
          </select>
          <p className={hintClass}>
            {currentlyMuted
              ? `Muted until ${mutedUntil!.toLocaleString()}. Incidents are still recorded.`
              : 'Muting stops notifications. Incidents are still recorded either way.'}
          </p>
        </div>

        {canManage && (
          <button
            type="submit"
            disabled={updatePolicy.isPending}
            className="h-10 rounded-md bg-black px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {updatePolicy.isPending ? 'Saving…' : 'Save policy'}
          </button>
        )}
      </form>

      <div className="space-y-8">
        <div className="space-y-3">
          <h4 className={labelClass}>Notify these channels</h4>

          {channels.length === 0 ? (
            <p className={hintClass}>
              No channels yet.{' '}
              <Link to="/channels" className="underline">
                Add one
              </Link>{' '}
              to get Slack or webhook alerts.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {channels.map((channel) => (
                  <label key={channel.id} className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      disabled={!canManage}
                      checked={selectedChannels.includes(channel.id)}
                      onChange={(event) =>
                        setSelectedChannels(
                          event.target.checked
                            ? [...selectedChannels, channel.id]
                            : selectedChannels.filter((id) => id !== channel.id)
                        )
                      }
                      className="h-4 w-4 accent-black dark:accent-white"
                    />
                    <span className="text-[13px] text-neutral-700 dark:text-neutral-300">
                      {channel.name}
                      <span className="ml-1.5 text-[11px] uppercase text-neutral-400">
                        {channel.type}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <p className={hintClass}>
                {selectedChannels.length === 0
                  ? 'With none selected, every enabled channel in the workspace is used.'
                  : 'Only the selected channels are notified for this monitor.'}
              </p>
            </>
          )}
        </div>

        <div className="space-y-3">
          <h4 className={labelClass}>Recent deliveries</h4>

          {!deliveryData?.deliveries.length ? (
            <p className={hintClass}>Nothing sent yet.</p>
          ) : (
            <ul className="space-y-2">
              {deliveryData.deliveries.slice(0, 8).map((delivery) => (
                <li
                  key={delivery.id}
                  className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-2 text-[12px] dark:border-neutral-900"
                >
                  <span className="min-w-0">
                    <span className="block text-neutral-700 dark:text-neutral-300">
                      {delivery.event} → {delivery.channel_name ?? delivery.channel_type}
                    </span>
                    {delivery.error && (
                      <span className="block truncate text-red-500" title={delivery.error}>
                        {delivery.error}
                      </span>
                    )}
                  </span>
                  <span
                    className={
                      delivery.status === 'sent'
                        ? 'shrink-0 text-emerald-600'
                        : 'shrink-0 text-red-500'
                    }
                  >
                    {delivery.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
