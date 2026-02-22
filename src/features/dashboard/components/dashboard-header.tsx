import { CreateMonitorModal } from './create-monitor-modal';

export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-8 mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Overview</h1>
        <p className="text-[14px] text-neutral-500 mt-1">Real-time infrastructure monitoring and uptime statistics.</p>
      </div>
      <div className="flex items-center gap-3">
        <CreateMonitorModal />
      </div>
    </div>
  );
}
