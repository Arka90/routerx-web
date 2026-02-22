import type { Monitor } from '@/types/monitor.types';
import { MonitorCard } from './monitor-card';

interface MonitorGridProps {
  monitors: Monitor[];
  isLoading: boolean;
  isError: boolean;
}

export function MonitorGrid({ monitors, isLoading, isError }: MonitorGridProps) {
  if (isError) {
    return (
      <div className="p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 border border-red-200 dark:border-red-800/20 text-sm">
        Failed to load monitors. Please check your connection.
      </div>
    );
  }

  if (isLoading && !monitors.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 min-h-[160px] animate-pulse">
             <div className="flex justify-between items-start">
               <div className="w-1/2 h-4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
               <div className="w-16 h-4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
             </div>
             <div className="mt-8 w-3/4 h-3 bg-neutral-100 dark:bg-neutral-900 rounded"></div>
             <div className="mt-6 flex gap-[2px] h-6">
                {Array.from({ length: 40 }).map((_, j) => (
                  <div key={j} className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-sm"></div>
                ))}
             </div>
          </div>
        ))}
      </div>
    );
  }

  if (monitors.length === 0) {
    return (
      <div className="py-16 text-center text-neutral-500 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A]">
        <h3 className="text-sm font-medium mb-1 text-neutral-900 dark:text-neutral-100">No monitors configured</h3>
        <p className="text-xs">Add a monitor to start tracking its performance.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {monitors.map((monitor) => (
        <MonitorCard 
          key={monitor.id} 
          monitor={monitor} 
        />
      ))}
    </div>
  );
}
