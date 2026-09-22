import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Activity, Bell, ChevronLeft, Clock, Settings, Trash2 } from 'lucide-react'
import {
  useDeleteMaintenance,
  useDeleteMonitor,
  useGetMaintenance,
  useIncidents,
  useMonitor,
  useProbes,
  useSetMaintenance,
  useUpdateMonitor,
  useUptime,
} from '@/hooks/monitor.queries'
import { useCanManage } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'
import { ProbeGraph } from '@/components/ProbeGraph'
import { PremiumField } from '@/components/ui/premium-field'
import { MonitorForm, type MonitorFormValues } from '@/features/dashboard/components/monitor-form'
import { AlertPolicyPanel } from '@/features/monitor/components/alert-policy-panel'
import { IncidentList } from '@/features/monitor/components/incident-list'
import { formatDuration, formatUptimePercentage, uptimeWindowLabel } from '@/lib/format'
import { presentStatus } from '@/lib/status'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/monitor/$monitorId')({
  component: MonitorPage,
})

type Tab = 'probes' | 'incidents' | 'alerts' | 'maintenance' | 'settings'

const TABS: Array<{ id: Tab; label: string; icon: typeof Activity }> = [
  { id: 'probes', label: 'Probes', icon: Activity },
  { id: 'incidents', label: 'Incidents', icon: Clock },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'maintenance', label: 'Schedule', icon: Clock },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function MonitorPage() {
  const { monitorId } = Route.useParams()
  const numericId = Number.parseInt(monitorId, 10)
  const navigate = useNavigate()
  const canManage = useCanManage()

  const [activeTab, setActiveTab] = useState<Tab>('probes')
  const [reason, setReason] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [settingsError, setSettingsError] = useState<string | null>(null)

  const { data: monitor, isLoading, isError } = useMonitor(numericId)
  const { data: uptimeData, isLoading: isUptimeLoading } = useUptime(numericId)
  const { data: incidentsData, isLoading: isIncidentsLoading } = useIncidents(numericId)
  const { data: probesData, isLoading: isProbesLoading } = useProbes(numericId)
  const { data: maintenanceData, isLoading: isMaintenanceLoading } =
    useGetMaintenance(numericId)

  const setMaintenance = useSetMaintenance()
  const deleteMaintenance = useDeleteMaintenance()
  const deleteMonitor = useDeleteMonitor()
  const updateMonitor = useUpdateMonitor()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-4 p-8">
        <div className="h-8 w-48 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-64 rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-[#0A0A0A]" />
      </div>
    )
  }

  if (isError || !monitor) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center text-neutral-500 dark:border-neutral-800 dark:bg-[#0A0A0A]">
        <h3 className="mb-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Monitor not found
        </h3>
        <p className="mb-4 text-xs">
          It may have been deleted, or it belongs to another workspace.
        </p>
        <Link to="/dashboard" className="text-sm font-medium hover:underline">
          Return to dashboard
        </Link>
      </div>
    )
  }

  const status = presentStatus(monitor)

  const handleSetMaintenance = (event: React.FormEvent) => {
    event.preventDefault()

    if (!startsAt || !endsAt || !reason.trim()) {
      toast.error('Fill in every maintenance field')
      return
    }

    const start = new Date(startsAt)
    const end = new Date(endsAt)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error('Invalid date selection')
      return
    }

    if (end <= start) {
      toast.error('The end time must be after the start time')
      return
    }

    setMaintenance.mutate(
      {
        id: monitor.id,
        payload: {
          starts_at: start.toISOString(),
          ends_at: end.toISOString(),
          reason: reason.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success('Maintenance scheduled')
          setReason('')
          setStartsAt('')
          setEndsAt('')
        },
        onError: (error) =>
          toast.error(getApiErrorMessage(error, 'Could not schedule maintenance')),
      }
    )
  }

  const handleDelete = () => {
    if (!confirm('Delete this monitor and all of its history?')) return

    deleteMonitor.mutate(monitor.id, {
      onSuccess: () => {
        toast.success('Monitor deleted')
        navigate({ to: '/dashboard' })
      },
      onError: (error) =>
        toast.error(getApiErrorMessage(error, 'Could not delete that monitor')),
    })
  }

  const handleUpdate = (values: MonitorFormValues) => {
    setSettingsError(null)

    updateMonitor.mutate(
      { id: monitor.id, payload: values },
      {
        onSuccess: () => toast.success('Monitor updated'),
        onError: (error) =>
          setSettingsError(getApiErrorMessage(error, 'Could not update that monitor')),
      }
    )
  }

  return (
    <div className="animate-in fade-in flex h-full w-full flex-col duration-500">
      <div className="mx-auto w-full max-w-[1600px] flex-1 space-y-8 p-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <Link
              to="/dashboard"
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <ChevronLeft className="h-4 w-4" /> Dashboard
            </Link>

            <h1 className="flex flex-wrap items-center gap-4 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              <span className="break-all">{monitor.name ?? monitor.url}</span>
              <span
                className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${status.badge} ${status.text}`}
              >
                {status.label}
              </span>
            </h1>

            {monitor.name && (
              <p className="mt-1 break-all text-sm text-neutral-500">
                <span className="mr-1.5 font-mono text-[11px] uppercase">{monitor.method}</span>
                {monitor.url}
              </p>
            )}
          </div>

          {canManage && (
            <button
              onClick={handleDelete}
              disabled={deleteMonitor.isPending}
              className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50 dark:text-red-500 dark:hover:bg-red-900/20"
              title="Delete monitor"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <StatCard
            label={uptimeWindowLabel(uptimeData)}
            value={isUptimeLoading ? '…' : `${formatUptimePercentage(uptimeData)}%`}
          />
          <StatCard
            label="Total downtime"
            value={isUptimeLoading ? '…' : formatDuration(uptimeData?.total_downtime_seconds)}
          />
          <StatCard
            label="Success streak"
            value={String(monitor.consecutive_successes)}
            accent="border-l-emerald-500/50 dark:border-l-emerald-500/30"
            valueClass="text-emerald-600 dark:text-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-900/50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-bold uppercase tracking-widest transition-all',
                activeTab === tab.id
                  ? 'bg-white text-neutral-900 shadow-md dark:bg-neutral-800 dark:text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[500px]">
          {activeTab === 'probes' && (
            <section className="space-y-6">
              <div>
                <h3 className="text-lg font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
                  Response timing
                </h3>
                <p className="text-sm text-neutral-500">
                  Per-layer breakdown, refreshed every 10 seconds.
                </p>
              </div>

              {isProbesLoading ? (
                <div className="h-[500px] w-full animate-pulse border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
              ) : (
                <ProbeGraph data={probesData ?? []} />
              )}
            </section>
          )}

          {activeTab === 'incidents' && (
            <section className="space-y-6">
              <h3 className="text-lg font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
                Incident history
              </h3>

              {isIncidentsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-24 border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
                  <div className="h-24 border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
                </div>
              ) : (
                <IncidentList incidents={incidentsData?.incidents ?? []} />
              )}
            </section>
          )}

          {activeTab === 'alerts' && <AlertPolicyPanel monitor={monitor} />}

          {activeTab === 'maintenance' && (
            <section className="max-w-2xl space-y-8">
              <div>
                <h3 className="mb-2 text-xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
                  Schedule maintenance
                </h3>
                <p className="text-sm text-neutral-500">
                  Suppress checks and alerts during a deployment window, so a planned restart
                  doesn't read as an outage.
                </p>
              </div>

              {isMaintenanceLoading ? (
                <div className="h-32 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900" />
              ) : monitor.in_maintenance && maintenanceData?.maintenance ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/10">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="mb-1 font-semibold text-amber-900 dark:text-amber-500">
                        Maintenance window active
                      </h4>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-600">
                        {maintenanceData.maintenance.reason}
                      </p>
                    </div>

                    {canManage && (
                      <button
                        onClick={() => {
                          if (!confirm('Cancel this maintenance window?')) return

                          deleteMaintenance.mutate(monitor.id, {
                            onSuccess: () => toast.success('Maintenance cancelled'),
                            onError: (error) =>
                              toast.error(getApiErrorMessage(error, 'Could not cancel')),
                          })
                        }}
                        disabled={deleteMaintenance.isPending}
                        className="shrink-0 rounded-lg border border-amber-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-[#111] dark:text-amber-500 dark:hover:bg-amber-900/40"
                      >
                        {deleteMaintenance.isPending ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    {(
                      [
                        ['Starts', maintenanceData.maintenance.starts_at],
                        ['Ends', maintenanceData.maintenance.ends_at],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-amber-100 bg-white/50 p-3 dark:border-amber-900/30 dark:bg-black/20"
                      >
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-600/70 dark:text-amber-500/70">
                          {label}
                        </p>
                        <p className="font-medium text-amber-900 dark:text-amber-400">
                          {new Date(value).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : canManage ? (
                <form onSubmit={handleSetMaintenance} className="grid grid-cols-1 gap-8">
                  <PremiumField
                    id="reason"
                    label="Reason"
                    helperText="Recorded against the window for later reference."
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="e.g. Database migration v2"
                  />

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <PremiumField
                      id="starts_at"
                      type="datetime-local"
                      label="Starts at"
                      value={startsAt}
                      onChange={(event) => setStartsAt(event.target.value)}
                      helperText="When checks should pause."
                      onClick={(event) => event.currentTarget.showPicker?.()}
                    />
                    <PremiumField
                      id="ends_at"
                      type="datetime-local"
                      label="Ends at"
                      value={endsAt}
                      onChange={(event) => setEndsAt(event.target.value)}
                      helperText="Checks resume automatically."
                      onClick={(event) => event.currentTarget.showPicker?.()}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={setMaintenance.isPending}
                    className="mt-2 h-12 rounded-xl bg-neutral-900 px-4 text-[13px] font-bold uppercase tracking-[0.2em] text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
                  >
                    {setMaintenance.isPending ? 'Scheduling…' : 'Confirm window'}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-neutral-500">
                  No maintenance is scheduled. Ask an admin to schedule one.
                </p>
              )}
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="max-w-2xl space-y-8">
              <div>
                <h3 className="mb-2 text-xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
                  Monitor settings
                </h3>
                <p className="text-sm text-neutral-500">
                  What we request, and what counts as healthy.
                </p>
              </div>

              {canManage ? (
                <MonitorForm
                  key={monitor.updated_at}
                  initial={monitor}
                  submitLabel="Save changes"
                  pending={updateMonitor.isPending}
                  onSubmit={handleUpdate}
                  error={settingsError}
                />
              ) : (
                <p className="text-sm text-neutral-500">
                  You have read-only access to this workspace.
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent = 'border-l-neutral-200/50 dark:border-l-neutral-800/50',
  valueClass = 'text-neutral-900 dark:text-neutral-100',
}: {
  label: string
  value: string
  accent?: string
  valueClass?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col justify-center border-y border-r border-l-2 border-neutral-100 bg-neutral-50 p-6 dark:border-neutral-900 dark:bg-[#111]',
        accent
      )}
    >
      <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-neutral-500">
        {label}
      </p>
      <p className={cn('text-4xl font-light tracking-tight', valueClass)}>{value}</p>
    </div>
  )
}
