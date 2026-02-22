import { createFileRoute } from '@tanstack/react-router'
import { useMonitors, useIncidents } from '@/hooks/monitor.queries'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/incidents')({
  component: IncidentsPage,
})

function IncidentsPage() {
  const { data: monitors = [], isLoading: isMonitorsLoading } = useMonitors();

  return (
    <div className="space-y-10 animate-in fade-in duration-500 p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Global Incidents
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Monitor and manage ongoing and past incidents across all endpoints.
        </p>
      </div>
      
      {isMonitorsLoading ? (
         <div className="animate-pulse space-y-4">
              <div className="h-32 bg-neutral-100 dark:bg-neutral-900 rounded-none border border-neutral-200 dark:border-neutral-800"></div>
              <div className="h-32 bg-neutral-100 dark:bg-neutral-900 rounded-none border border-neutral-200 dark:border-neutral-800"></div>
          </div>
      ) : monitors.length === 0 ? (
        <div className="flex flex-col h-64 items-center justify-center rounded-none border border-neutral-200 border-dashed bg-neutral-50 dark:border-neutral-800 dark:bg-black p-6 text-center">
            <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No Monitors Configured</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 max-w-sm">Create a monitor from the dashboard to start tracking incidents.</p>
            <Link to="/" className="text-sm font-medium hover:underline text-neutral-900 dark:text-white">Go to Dashboard</Link>
        </div>
      ) : (
        <div className="space-y-6">
           {monitors.map(monitor => (
               <MonitorIncidentsSection key={monitor.id} monitorId={monitor.id} url={monitor.url} />
           ))}
        </div>
      )}
    </div>
  )
}

function MonitorIncidentsSection({ monitorId, url }: { monitorId: number, url: string }) {
    const { data, isLoading } = useIncidents(monitorId);

    if (isLoading) return null; // Or a smaller sub-skeleton
    if (!data?.incidents || data.incidents.length === 0) return null; // Don't show monitors with 0 incidents in global log

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                {url}
            </h3>
            <div className="space-y-3 pl-4 border-l-2 border-neutral-100 dark:border-neutral-800/60">
                {data.incidents.map((incident) => (
                    <div key={incident.id} className="border border-neutral-200 dark:border-neutral-800 rounded-none p-5 bg-white dark:bg-[#0A0A0A] hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${incident.resolved_at ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-widest text-xs">
                                    {incident.resolved_at ? 'Resolved' : 'Active Outage'}
                                </span>
                            </div>
                            <span className="text-neutral-500 bg-neutral-100 dark:bg-[#111] px-2 py-1 rounded-none text-[11px] font-medium tracking-widest uppercase">
                                Duration: {incident.duration_seconds !== null ? `${incident.duration_seconds}s` : 'Ongoing'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                            <div className="bg-neutral-50 dark:bg-[#111] p-3 border-l-2 border-neutral-200 dark:border-neutral-800">
                                <p className="text-neutral-500 mb-1 text-[10px] uppercase tracking-widest font-semibold flex items-center justify-between">
                                    <span>Started</span>
                                    <span>{new Date(incident.started_at).toLocaleDateString()}</span>
                                </p>
                                <p className="text-neutral-900 dark:text-neutral-300">{new Date(incident.started_at).toLocaleTimeString()}</p>
                            </div>
                            {incident.resolved_at && (
                                <div className="bg-neutral-50 dark:bg-[#111] p-3 border-l-2 border-neutral-200 dark:border-neutral-800">
                                    <p className="text-neutral-500 mb-1 text-[10px] uppercase tracking-widest font-semibold flex items-center justify-between">
                                        <span>Resolved</span>
                                        <span>{new Date(incident.resolved_at).toLocaleDateString()}</span>
                                    </p>
                                    <p className="text-neutral-900 dark:text-neutral-300">{new Date(incident.resolved_at).toLocaleTimeString()}</p>
                                </div>
                            )}
                            {incident.root_cause && (
                                <div className="col-span-1 md:col-span-2 bg-red-50 dark:bg-red-900/10 p-3 border-l-2 border-red-500/50">
                                    <p className="text-red-800/60 dark:text-red-400/60 mb-1 text-[10px] uppercase tracking-widest font-semibold">Root Cause</p>
                                    <p className="text-red-900 dark:text-red-400 font-mono text-[11px]">{incident.root_cause}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
