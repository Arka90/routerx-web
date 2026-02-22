import { useUptime } from '@/hooks/monitor.queries';
import type { Monitor } from '@/types/monitor.types';
import { Link } from '@tanstack/react-router';

export function MonitorCard({ monitor }: { monitor: Monitor }) {
  const isUp = monitor.confirmed_status === 'UP';
  const isMaintenance = monitor.in_maintenance;
  
  const { data: uptimeData } = useUptime(monitor.id);

  let statusDotElement = <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-pulse"></span>;
  let statusText = 'Unconfirmed';
  let statusTextColor = 'text-neutral-500';

  if (isMaintenance) {
    statusText = 'Maintenance';
    statusDotElement = <span className="w-2 h-2 rounded-full bg-amber-500"></span>;
    statusTextColor = 'text-amber-600 dark:text-amber-500';
  } else if (isUp) {
    statusText = 'Operational';
    statusDotElement = <span className="w-2 h-2 rounded-full bg-emerald-500"></span>;
    statusTextColor = 'text-emerald-700 dark:text-emerald-500';
  } else if (monitor.confirmed_status === 'DOWN') {
    statusText = 'Outage';
    statusDotElement = <span className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-red-500 rounded-l-md"></span>;
    statusTextColor = 'text-red-600 dark:text-red-500';
  }

  // Round uptime to 2 decimal places if it exists
  const formattedUptime = uptimeData 
        ? (uptimeData.uptime_percentage === 100 ? '100' : uptimeData.uptime_percentage.toFixed(2))
        : '...';

  return (
    <Link 
      to="/monitor/$monitorId"
      params={{ monitorId: monitor.id.toString() }}
      className="group relative flex flex-col justify-between bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all cursor-pointer overflow-hidden min-h-[160px]"
    >
      {/* Absolute outage indicator stripe (Vercel-style error state) */}
      {monitor.confirmed_status === 'DOWN' && !isMaintenance && statusDotElement}

      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1 max-w-[80%]">
          <h3 className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100 truncate flex items-center gap-2">
            {monitor.confirmed_status !== 'DOWN' && statusDotElement}
            {new URL(monitor.url).hostname}
          </h3>
          <p className="text-[13px] text-neutral-500 truncate">{monitor.url}</p>
        </div>
        
        <span className={`text-[12px] font-medium px-2 py-0.5 rounded-md ${monitor.confirmed_status === 'DOWN' && !isMaintenance ? 'bg-red-50 dark:bg-red-500/10' : 'bg-neutral-100 dark:bg-neutral-900'} ${statusTextColor}`}>
          {statusText}
        </span>
      </div>
      
      <div className="mt-auto">
        <div className="flex items-end justify-between mb-3">
            <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">30-Day Uptime</span>
                <span className="text-xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100 leading-none">
                    {formattedUptime !== '...' ? `${formattedUptime}%` : '...'}
                </span>
            </div>
            
            <div className="flex flex-col items-end gap-1">
                {monitor.tls_expiry_at && (
                  <span className="flex items-center gap-1 text-[11px] text-neutral-500 bg-neutral-50 dark:bg-neutral-900/50 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      {new Date(monitor.tls_expiry_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                )}
            </div>
        </div>
      </div>
    </Link>
  );
}
