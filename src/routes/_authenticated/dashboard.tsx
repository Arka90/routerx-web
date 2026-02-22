import { createFileRoute } from '@tanstack/react-router'
import { useMonitors } from '@/hooks/monitor.queries'
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header'
import { MonitorGrid } from '@/features/dashboard/components/monitor-grid'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: monitors = [], isLoading, isError } = useMonitors();

  return (
    <div className="space-y-10 animate-in fade-in duration-500 p-8">
      <DashboardHeader />
      
      <section className="space-y-4">
        <MonitorGrid 
          monitors={monitors} 
          isLoading={isLoading} 
          isError={isError} 
        />
      </section>
    </div>
  )
}
