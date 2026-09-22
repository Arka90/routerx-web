import { useMemo, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Activity,
  Bell,
  CalendarClock,
  ChevronLeft,
  Clock,
  ExternalLink,
  Settings,
  Trash2,
} from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Page, PageHeader, SectionHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { StatusBadge, StatusDot, type StatusTone } from '@/components/ui/status'
import { Tabs, TabsBar, TabsBarTrigger, TabsContent } from '@/components/ui/tabs'
import { MonitorForm, type MonitorFormValues } from '@/features/dashboard/components/monitor-form'
import { AlertPolicyPanel } from '@/features/monitor/components/alert-policy-panel'
import { IncidentList } from '@/features/monitor/components/incident-list'
import { RegionStatus } from '@/features/monitor/components/region-status'
import { useRegions } from '@/hooks/status.queries'
import {
  daysUntil,
  formatDate,
  formatDateTime,
  formatDuration,
  formatInterval,
  formatRelative,
  formatUptimePercentage,
  uptimeWindowLabel,
} from '@/lib/format'
import { humanizeRootCause, presentStatus } from '@/lib/status'
import type { Probe } from '@/types/monitor.types'

export const Route = createFileRoute('/_authenticated/monitor/$monitorId')({
  component: MonitorPage,
})

/** How many of the newest probes the overview table lists. */
const RECENT_CHECKS = 12

function probeTone(status: string): StatusTone {
  if (status === 'UP') return 'up'
  if (status === 'DEGRADED') return 'degraded'
  return 'down'
}

function MonitorPage() {
  const { monitorId } = Route.useParams()
  const numericId = Number.parseInt(monitorId, 10)
  const navigate = useNavigate()
  const canManage = useCanManage()
  const { confirm, dialog } = useConfirm()

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
  const { data: regionData } = useRegions()

  const setMaintenance = useSetMaintenance()
  const deleteMaintenance = useDeleteMaintenance()
  const deleteMonitor = useDeleteMonitor()
  const updateMonitor = useUpdateMonitor()

  // Newest first for the table; the graph sorts the other way itself.
  const recentProbes = useMemo<Probe[]>(
    () =>
      [...(probesData ?? [])]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, RECENT_CHECKS),
    [probesData]
  )

  if (isLoading) {
    return (
      <Page width="wide">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[104px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-full max-w-lg" />
        <Skeleton className="h-[440px] rounded-xl" />
      </Page>
    )
  }

  if (isError || !monitor) {
    return (
      <Page width="wide">
        <EmptyState
          icon={<Activity />}
          title="Monitor not found"
          description="It may have been deleted, or it belongs to another workspace."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">
                <ChevronLeft />
                Back to monitors
              </Link>
            </Button>
          }
        />
      </Page>
    )
  }

  const status = presentStatus(monitor)
  const latestProbe = recentProbes[0]
  const regionStates = monitor.region_states ?? []
  const regions = regionData?.regions ?? []

  // Certificate card: red inside a week, amber inside a month.
  const tlsDays = daysUntil(monitor.tls_expiry_at)
  const tlsTone: 'default' | 'down' | 'degraded' =
    tlsDays === null ? 'default' : tlsDays < 7 ? 'down' : tlsDays < 30 ? 'degraded' : 'default'

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

  const handleCancelMaintenance = () =>
    confirm({
      title: 'Cancel this maintenance window?',
      description: 'Checks and alerts for this monitor resume straight away.',
      confirmLabel: 'Cancel window',
      cancelLabel: 'Keep it',
      destructive: true,
      onConfirm: () =>
        deleteMaintenance.mutate(monitor.id, {
          onSuccess: () => toast.success('Maintenance cancelled'),
          onError: (error) => toast.error(getApiErrorMessage(error, 'Could not cancel')),
        }),
    })

  const handleDelete = () =>
    confirm({
      title: 'Delete this monitor and all of its history?',
      description: `${monitor.name ?? monitor.url} will stop being checked, and every incident and recorded probe goes with it. This cannot be undone.`,
      confirmLabel: 'Delete monitor',
      destructive: true,
      onConfirm: () =>
        deleteMonitor.mutate(monitor.id, {
          onSuccess: () => {
            toast.success('Monitor deleted')
            navigate({ to: '/dashboard' })
          },
          onError: (error) =>
            toast.error(getApiErrorMessage(error, 'Could not delete that monitor')),
        }),
    })

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
    <Page width="wide">
      <div className="space-y-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 rounded-md text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Monitors
        </Link>

        <PageHeader
          title={
            <span className="flex flex-wrap items-center gap-3">
              <span className="break-all">{monitor.name ?? monitor.url}</span>
              <StatusBadge tone={status.tone} label={status.label} live={status.live} />
            </span>
          }
          description={
            <span className="font-mono text-[13px] break-all">
              <span className="mr-1.5 text-subtle-foreground">{monitor.method}</span>
              {monitor.url}
            </span>
          }
          actions={
            <>
              <Button asChild variant="outline" size="sm">
                <a href={monitor.url} target="_blank" rel="noreferrer">
                  <ExternalLink />
                  Open URL
                </a>
              </Button>

              {canManage && (
                <Button
                  variant="destructive"
                  size="icon-sm"
                  aria-label="Delete monitor"
                  title="Delete monitor"
                  onClick={handleDelete}
                  loading={deleteMonitor.isPending}
                >
                  {!deleteMonitor.isPending && <Trash2 />}
                </Button>
              )}
            </>
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={uptimeWindowLabel(uptimeData)}
          value={`${formatUptimePercentage(uptimeData)}%`}
          loading={isUptimeLoading}
        />
        <StatCard
          label="Total downtime"
          value={formatDuration(uptimeData?.total_downtime_seconds)}
          hint="Across the same window"
          loading={isUptimeLoading}
        />
        <StatCard
          label="Success streak"
          value={monitor.consecutive_successes}
          tone="up"
          hint="Consecutive passing checks"
        />
        <StatCard
          label="Certificate"
          tone={tlsTone}
          value={
            tlsDays === null ? (
              <span className="text-base font-medium text-muted-foreground">No TLS data</span>
            ) : tlsDays < 0 ? (
              'Expired'
            ) : (
              `${tlsDays}d`
            )
          }
          hint={
            monitor.tls_expiry_at
              ? `Expires ${formatDate(monitor.tls_expiry_at)}`
              : 'Not HTTPS, or no successful check yet'
          }
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsBar aria-label="Monitor sections">
          <TabsBarTrigger value="overview">
            <Activity />
            Overview
          </TabsBarTrigger>
          <TabsBarTrigger value="incidents">
            <Clock />
            Incidents
            {incidentsData?.total ? (
              <Badge
                size="sm"
                variant={incidentsData.open_incident ? 'down' : 'neutral'}
                className="tabular"
              >
                {incidentsData.total}
              </Badge>
            ) : null}
          </TabsBarTrigger>
          <TabsBarTrigger value="alerts">
            <Bell />
            Alerts
          </TabsBarTrigger>
          <TabsBarTrigger value="maintenance">
            <CalendarClock />
            Maintenance
          </TabsBarTrigger>
          <TabsBarTrigger value="settings">
            <Settings />
            Settings
          </TabsBarTrigger>
        </TabsBar>

        <TabsContent value="overview" className="space-y-6">
          {isProbesLoading ? (
            <Skeleton className="h-[460px] w-full rounded-xl" />
          ) : (
            <ProbeGraph data={probesData ?? []} />
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    Recent checks
                  </h3>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    Last {RECENT_CHECKS} probes, newest first
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  Latest check{' '}
                  <span
                    className="font-medium text-foreground"
                    title={latestProbe ? new Date(latestProbe.timestamp).toLocaleString() : undefined}
                  >
                    {latestProbe ? formatRelative(latestProbe.timestamp) : '—'}
                  </span>
                </span>
              </div>

              {isProbesLoading ? (
                <div className="space-y-2 p-5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-6 w-full" />
                  ))}
                </div>
              ) : recentProbes.length === 0 ? (
                <p className="px-5 py-8 text-center text-[13px] text-muted-foreground">
                  No checks recorded yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="text-left">
                        <th scope="col" className="eyebrow px-5 py-2.5 font-semibold">
                          Time
                        </th>
                        <th scope="col" className="eyebrow px-3 py-2.5 font-semibold">
                          Status
                        </th>
                        <th scope="col" className="eyebrow px-3 py-2.5 font-semibold">
                          HTTP
                        </th>
                        <th scope="col" className="eyebrow px-3 py-2.5 text-right font-semibold">
                          Total ms
                        </th>
                        <th scope="col" className="eyebrow px-5 py-2.5 font-semibold">
                          Root cause
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentProbes.map((probe) => {
                        const tone = probeTone(probe.status)

                        return (
                          <tr key={probe.id} className="transition-colors hover:bg-accent/50">
                            <td className="px-5 py-2.5 whitespace-nowrap text-foreground">
                              {formatDateTime(probe.timestamp)}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="inline-flex items-center gap-2">
                                <StatusDot tone={tone} />
                                <span className="capitalize text-foreground">
                                  {probe.status.toLowerCase()}
                                </span>
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-[12px] text-muted-foreground">
                              {probe.http_status_code ?? '—'}
                            </td>
                            <td className="tabular px-3 py-2.5 text-right font-mono text-[12px] text-foreground">
                              {probe.responseTime}
                            </td>
                            <td className="max-w-[220px] truncate px-5 py-2.5 text-muted-foreground">
                              {humanizeRootCause(probe.root_cause) ?? '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* RegionStatus renders nothing for a single vantage point, so
                say where the checks come from instead of leaving a gap. */}
            {regionStates.length > 1 ? (
              <RegionStatus
                states={regionStates}
                regions={regions}
                confirmations={monitor.policy.confirmations}
              />
            ) : (
              <section className="card space-y-4 p-5">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Checked from one region
                </h3>
                <dl className="grid grid-cols-2 gap-3 text-[13px]">
                  <div>
                    <dt className="eyebrow">Region</dt>
                    <dd className="mt-1 text-foreground">
                      {regionStates[0]
                        ? (regions.find((region) => region.code === regionStates[0].region)
                            ?.name ?? regionStates[0].region)
                        : 'Default'}
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Interval</dt>
                    <dd className="mt-1 text-foreground">
                      {formatInterval(monitor.interval_seconds)}
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Timeout</dt>
                    <dd className="tabular mt-1 font-mono text-[12px] text-foreground">
                      {monitor.timeout_ms} ms
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Last checked</dt>
                    <dd className="mt-1 text-foreground">
                      {formatRelative(regionStates[0]?.last_checked_at ?? latestProbe?.timestamp)}
                    </dd>
                  </div>
                </dl>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Add regions in Settings to compare vantage points and require agreement
                  before an incident opens.
                </p>
              </section>
            )}
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <SectionHeader
            title="Incident history"
            description={
              incidentsData
                ? `${incidentsData.total} recorded${incidentsData.open_incident ? ' · one open now' : ''}`
                : undefined
            }
          />

          {isIncidentsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
          ) : (
            <IncidentList incidents={incidentsData?.incidents ?? []} />
          )}
        </TabsContent>

        <TabsContent value="alerts">
          <AlertPolicyPanel monitor={monitor} />
        </TabsContent>

        <TabsContent value="maintenance" className="max-w-2xl space-y-6">
          <SectionHeader
            title="Schedule maintenance"
            description="Suppress checks and alerts during a deployment window, so a planned restart doesn't read as an outage."
          />

          {isMaintenanceLoading ? (
            <Skeleton className="h-36 w-full rounded-xl" />
          ) : monitor.in_maintenance && maintenanceData?.maintenance ? (
            <div className="card border-maintenance/30 bg-maintenance-soft p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <StatusDot tone="maintenance" live className="mt-1.5" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">
                      Maintenance window active
                    </h3>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      {maintenanceData.maintenance.reason}
                    </p>
                  </div>
                </div>

                {canManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelMaintenance}
                    loading={deleteMaintenance.isPending}
                  >
                    Cancel window
                  </Button>
                )}
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                {(
                  [
                    ['Starts', maintenanceData.maintenance.starts_at],
                    ['Ends', maintenanceData.maintenance.ends_at],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-maintenance/20 bg-card/70 px-3 py-2.5"
                  >
                    <dt className="eyebrow">{label}</dt>
                    <dd
                      className="mt-1 font-medium text-foreground"
                      title={new Date(value).toLocaleString()}
                    >
                      {formatDateTime(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : canManage ? (
            <form onSubmit={handleSetMaintenance} className="card space-y-5 p-5">
              <Field
                id="reason"
                label="Reason"
                hint="Recorded against the window for later reference."
              >
                <Input
                  id="reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="e.g. Database migration v2"
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="starts_at" label="Starts at" hint="When checks should pause.">
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(event) => setStartsAt(event.target.value)}
                    onClick={(event) => event.currentTarget.showPicker?.()}
                  />
                </Field>
                <Field id="ends_at" label="Ends at" hint="Checks resume automatically.">
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(event) => setEndsAt(event.target.value)}
                    onClick={(event) => event.currentTarget.showPicker?.()}
                  />
                </Field>
              </div>

              <div className="pt-1">
                <Button type="submit" variant="primary" loading={setMaintenance.isPending}>
                  <CalendarClock />
                  Confirm window
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              No maintenance is scheduled. Ask an admin to schedule one.
            </p>
          )}
        </TabsContent>

        <TabsContent value="settings" className="max-w-2xl space-y-6">
          <SectionHeader
            title="Monitor settings"
            description="What we request, and what counts as healthy."
          />

          {canManage ? (
            <>
              <div className="card p-5">
                <MonitorForm
                  key={monitor.updated_at}
                  initial={monitor}
                  submitLabel="Save changes"
                  pending={updateMonitor.isPending}
                  onSubmit={handleUpdate}
                  error={settingsError}
                />
              </div>

              <div className="card border-down/30 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                      Danger zone
                    </h3>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      Deleting removes the monitor, its incidents and every recorded check.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    loading={deleteMonitor.isPending}
                  >
                    <Trash2 />
                    Delete monitor
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              You have read-only access to this workspace.
            </p>
          )}
        </TabsContent>
      </Tabs>

      {dialog}
    </Page>
  )
}
