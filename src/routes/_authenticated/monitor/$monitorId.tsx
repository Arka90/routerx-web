import { useState, useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useIncidents, useUptime, useSetMaintenance, useDeleteMonitor, useUpdateMonitor, useMonitors, useProbes } from '@/hooks/monitor.queries';
import { toast } from 'sonner';
import { ProbeGraph } from '@/components/ProbeGraph';
import { PremiumField } from "@/components/ui/premium-field";

// Heroicons UI SVG Set
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;

export const Route = createFileRoute('/_authenticated/monitor/$monitorId')({
  component: MonitorPage,
});

function MonitorPage() {
  const { monitorId } = Route.useParams();
  const numericId = parseInt(monitorId, 10);
  const navigate = useNavigate();

  const { data: monitors, isLoading: isMonitorsLoading } = useMonitors();
  const monitor = monitors?.find(m => m.id === numericId);

  const [activeTab, setActiveTab] = useState<'incidents' | 'maintenance' | 'settings' | 'probes'>('probes');
  
  // Maintenance Form State
  const [reason, setReason] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  // Edit Form State
  const [editUrl, setEditUrl] = useState('');
  const [editInterval, setEditInterval] = useState('60');

  const { data: uptimeData, isLoading: isUptimeLoading } = useUptime(numericId);
  const { data: incidentsData, isLoading: isIncidentsLoading } = useIncidents(numericId);
  const { data: probesData, isLoading: isProbesLoading } = useProbes(numericId);
  
  const setMaintenanceMutation = useSetMaintenance();
  const deleteMonitorMutation = useDeleteMonitor();
  const updateMonitorMutation = useUpdateMonitor();

  // Reset form states when modal opens with new monitor
  useEffect(() => {
    if (monitor) {
      setTimeout(() => {
        setEditUrl(monitor.url);
        setEditInterval(monitor.interval_seconds.toString());
      }, 0);
    }
  }, [monitor]);

  if (isMonitorsLoading) {
      return <div className="animate-pulse space-y-4 max-w-4xl mx-auto"><div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded"></div><div className="h-64 bg-neutral-100 dark:bg-[#0A0A0A] border border-neutral-200 dark:border-neutral-800 rounded-xl"></div></div>;
  }

  if (!monitor) {
      return (
          <div className="py-16 text-center text-neutral-500 max-w-4xl mx-auto border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A]">
            <h3 className="text-sm font-medium mb-1 text-neutral-900 dark:text-neutral-100">Monitor Not Found</h3>
            <p className="text-xs mb-4">The monitor you are looking for does not exist or was deleted.</p>
            <Link to="/" className="text-sm font-medium hover:underline">Return to Dashboard</Link>
          </div>
      );
  }

  const handleSetMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting maintenance:', { startsAt, endsAt, reason });
    
    if (!startsAt || !endsAt || !reason) {
      toast.error('Please fill in all maintenance fields');
      return;
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast.error('Invalid date selection');
      return;
    }

    if (endDate <= startDate) {
      toast.error('End time must be after start time');
      return;
    }

    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    setMaintenanceMutation.mutate(
      { 
        id: monitor.id, 
        payload: { starts_at: startIso, ends_at: endIso, reason } 
      },
      {
        onSuccess: () => {
          toast.success('Maintenance scheduled successfully');
          setReason('');
          setStartsAt('');
          setEndsAt('');
          // Invalidate monitors to refresh maintenance status
          setActiveTab('incidents');
        },
        onError: (error: unknown) => {
          console.error('Maintenance API Error:', error);
          const errMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to schedule maintenance';
          toast.error(errMessage);
        }
      }
    );
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this monitor and all its history?')) {
        deleteMonitorMutation.mutate(monitor.id, {
            onSuccess: () => {
                toast.success('Monitor deleted successfully');
                navigate({ to: '/' });
            },
            onError: (error: unknown) => {
                const errMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to delete monitor';
                toast.error(errMessage);
            }
        });
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const intervalNum = parseInt(editInterval, 10);
    if (isNaN(intervalNum) || ![30, 60, 90].includes(intervalNum)) {
      toast.error('Interval must be 30, 60, or 90 seconds');
      return;
    }

    updateMonitorMutation.mutate({
        id: monitor.id,
        payload: { url: editUrl, interval_seconds: intervalNum }
    }, {
        onSuccess: () => {
            toast.success('Monitor updated successfully');
            setActiveTab('incidents');
        },
        onError: (error: unknown) => {
            const errMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update monitor';
            toast.error(errMessage);
        }
    });
  }

  const formattedUptime = uptimeData 
        ? (uptimeData.uptime_percentage === 100 ? '100' : uptimeData.uptime_percentage.toFixed(2))
        : '...';

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500">
        <div className="flex-1 space-y-8 p-8 max-w-[1600px] w-full mx-auto">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors uppercase tracking-widest">
                            <ChevronLeftIcon /> Dashboard
                        </Link>
                        <span className="text-neutral-300 dark:text-neutral-700">/</span>
                        <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-widest">{monitor.url}</span>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-4">
                        {monitor.url}
                        {monitor.in_maintenance ? (
                            <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30 px-2.5 py-1 rounded-sm">Maintenance</span>
                        ) : monitor.confirmed_status === 'DOWN' ? (
                            <span className="text-[11px] uppercase tracking-wider font-semibold text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30 px-2.5 py-1 rounded-sm">Outage</span>
                        ) : (
                            <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30 px-2.5 py-1 rounded-sm">Operational</span>
                        )}
                    </h1>
                </div>

                {/* Compact Actions Area */}
                <div className="flex bg-neutral-100 dark:bg-neutral-900/50 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
                    <button 
                        onClick={() => setActiveTab('probes')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold uppercase tracking-widest transition-all ${activeTab === 'probes' ? 'bg-white shadow-md text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                    >
                        Probes
                    </button>
                    <button 
                        onClick={() => setActiveTab('incidents')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold uppercase tracking-widest transition-all ${activeTab === 'incidents' ? 'bg-white shadow-md text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                    >
                        Incidents
                    </button>
                    <button 
                        onClick={() => setActiveTab('maintenance')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold uppercase tracking-widest transition-all ${activeTab === 'maintenance' ? 'bg-white shadow-md text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                    >
                        <ClockIcon /> Schedule
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white shadow-md text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                    >
                        <SettingsIcon /> Settings
                    </button>
                    <button 
                        onClick={handleDelete}
                        disabled={deleteMonitorMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20 transition-all ml-1 disabled:opacity-50"
                        title="Delete Monitor"
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-neutral-50 dark:bg-[#111] p-6 rounded-none border-l-2 border-neutral-200/50 dark:border-neutral-800/50 border-y border-r border-neutral-100 dark:border-neutral-900 flex flex-col justify-center">
                    <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-widest mb-3">30-Day Uptime</p>
                    <p className="text-4xl font-light tracking-tight text-neutral-900 dark:text-neutral-100">
                        {isUptimeLoading ? '...' : `${formattedUptime}%`}
                    </p>
                </div>
                <div className="bg-neutral-50 dark:bg-[#111] p-6 rounded-none border-l-2 border-neutral-200/50 dark:border-neutral-800/50 border-y border-r border-neutral-100 dark:border-neutral-900 flex flex-col justify-center">
                    <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-widest mb-3">Total Downtime</p>
                    <p className="text-4xl font-light tracking-tight text-neutral-900 dark:text-neutral-100">
                        {isUptimeLoading ? '...' : `${uptimeData?.total_downtime_seconds ?? 0}s`}
                    </p>
                </div>
                <div className="bg-neutral-50 dark:bg-[#111] p-6 rounded-none border-l-4 border-emerald-500/50 dark:border-emerald-500/30 border-y border-r border-neutral-100 dark:border-neutral-900 flex flex-col justify-center">
                    <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-widest mb-3">Success Streak</p>
                    <p className="text-4xl font-light tracking-tight text-emerald-600 dark:text-emerald-500">
                        {monitor.consecutive_successes}
                    </p>
                </div>
            </div>

            {/* Tab Content */}
            <div className="mt-8 min-h-[500px]">
                {activeTab === 'incidents' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium tracking-tight text-neutral-900 dark:text-neutral-100">Incident Event History</h3>
                        {isIncidentsLoading ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-24 bg-neutral-100 dark:bg-neutral-900 rounded-none border border-neutral-200 dark:border-neutral-800"></div>
                                <div className="h-24 bg-neutral-100 dark:bg-neutral-900 rounded-none border border-neutral-200 dark:border-neutral-800"></div>
                            </div>
                        ) : incidentsData?.incidents && incidentsData.incidents.length > 0 ? (
                            <div className="space-y-4">
                                {incidentsData.incidents.map((incident) => (
                                    <div key={incident.id} className="border border-neutral-200 dark:border-neutral-800 rounded-none p-6 bg-white dark:bg-[#0A0A0A] hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-2.5 h-2.5 rounded-full ${incident.resolved_at ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                                                <span className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide text-sm">
                                                    {incident.resolved_at ? 'Incident Resolved' : 'Active Outage'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-neutral-500 bg-neutral-100 dark:bg-[#111] px-3 py-1 rounded-none text-[12px] font-medium tracking-widest uppercase">
                                                    Duration: {incident.duration_seconds !== null ? `${incident.duration_seconds}s` : 'Ongoing'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[14px]">
                                            <div className="bg-neutral-50 dark:bg-[#111] p-4 border-l-2 border-neutral-200 dark:border-neutral-800">
                                                <p className="text-neutral-500 mb-1 text-xs uppercase tracking-widest font-semibold">Started At</p>
                                                <p className="text-neutral-900 dark:text-neutral-300">{new Date(incident.started_at).toLocaleString()}</p>
                                            </div>
                                            {incident.resolved_at && (
                                                <div className="bg-neutral-50 dark:bg-[#111] p-4 border-l-2 border-neutral-200 dark:border-neutral-800">
                                                    <p className="text-neutral-500 mb-1 text-xs uppercase tracking-widest font-semibold">Resolved At</p>
                                                    <p className="text-neutral-900 dark:text-neutral-300">{new Date(incident.resolved_at).toLocaleString()}</p>
                                                </div>
                                            )}
                                            {incident.root_cause && (
                                                <div className="col-span-1 md:col-span-2 bg-red-50 dark:bg-red-900/10 p-4 border-l-2 border-red-500/50">
                                                    <p className="text-red-800/60 dark:text-red-400/60 mb-1 text-xs uppercase tracking-widest font-semibold">Root Cause Analysis</p>
                                                    <p className="text-red-900 dark:text-red-400 font-mono text-xs">{incident.root_cause}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#111]">
                                <p className="text-base font-medium mb-2 text-neutral-900 dark:text-neutral-200">No Incident History</p>
                                <p className="text-sm">No downtime has been recorded for this endpoint yet.</p>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'maintenance' && (
                    <div className="space-y-8 max-w-2xl">
                        <div>
                            <h3 className="text-xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">Schedule Maintenance</h3>
                            <p className="text-sm text-neutral-500">
                                Freeze automated checks and pause alerts during deployment windows to avoid false outages.
                            </p>
                        </div>
                    
                        <form onSubmit={handleSetMaintenance} className="grid grid-cols-1 gap-8">
                            <PremiumField
                                id="reason"
                                label="Maintenance Reason"
                                helperText="Clearly state the purpose of this maintenance for history logs."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Database migration v2"
                                icon={<ClockIcon />}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <PremiumField
                                    id="starts_at"
                                    type="datetime-local"
                                    label="Starts At"
                                    value={startsAt}
                                    onChange={(e) => setStartsAt(e.target.value)}
                                    helperText="When should we pause monitoring?"
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                />
                                <PremiumField
                                    id="ends_at"
                                    type="datetime-local"
                                    label="Ends At"
                                    value={endsAt}
                                    onChange={(e) => setEndsAt(e.target.value)}
                                    helperText="Monitoring will resume automatically."
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full h-14 mt-4 rounded-xl bg-neutral-900 px-4 text-[13px] font-bold uppercase tracking-[0.2em] text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px]"
                                disabled={setMaintenanceMutation.isPending}
                            >
                                {setMaintenanceMutation.isPending ? 'Scheduling...' : 'Confirm Window'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-8 max-w-2xl">
                         <div>
                            <h3 className="text-xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">Monitor Settings</h3>
                            <p className="text-sm text-neutral-500">
                                Update tracking configurations and interval timings for this endpoint.
                            </p>
                        </div>

                        <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-8">
                            <PremiumField
                                id="edit_url"
                                label="Endpoint URL"
                                helperText="The domain or IP address to monitor for availability."
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                icon={<span>🔗</span>}
                            />

                            <div className="space-y-2.5">
                                <label htmlFor="edit_interval" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 px-1">
                                    Check Interval
                                </label>
                                <div className="relative flex items-center transition-all duration-300 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-black/50 backdrop-blur-md hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm focus-within:ring-2 focus-within:ring-neutral-900/5 dark:focus-within:ring-white/5 focus-within:border-neutral-900 dark:focus-within:border-white focus-within:shadow-xl focus-within:translate-y-[-1px]">
                                    <select
                                        id="edit_interval"
                                        value={editInterval}
                                        onChange={(e) => setEditInterval(e.target.value)}
                                        className="flex h-14 w-full bg-transparent px-4 py-4 text-sm outline-none transition-all text-neutral-900 dark:text-neutral-100 cursor-pointer appearance-none"
                                    >
                                        <option value="30">Every 30 seconds</option>
                                        <option value="60">Every 1 minute</option>
                                        <option value="90">Every 1.5 minutes</option>
                                    </select>
                                    <div className="absolute right-4 pointer-events-none text-neutral-400">
                                        ▼
                                    </div>
                                </div>
                                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 px-1">
                                    Shorter intervals provide more granular uptime data.
                                </p>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full h-14 mt-4 rounded-xl bg-neutral-900 px-4 text-[13px] font-bold uppercase tracking-[0.2em] text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px]"
                                disabled={updateMonitorMutation.isPending}
                            >
                                {updateMonitorMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'probes' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium tracking-tight text-neutral-900 dark:text-neutral-100">Live Probe Performance</h3>
                                <p className="text-sm text-neutral-500">Global response time metrics refreshed every 10 seconds.</p>
                            </div>
                        </div>
                        {isProbesLoading ? (
                            <div className="w-full h-[500px] animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-none border border-neutral-200 dark:border-neutral-800"></div>
                        ) : (
                            <ProbeGraph data={probesData || []} />
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
