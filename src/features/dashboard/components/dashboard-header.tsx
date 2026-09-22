import { PageHeader } from '@/components/ui/page-header'
import { CreateMonitorModal } from './create-monitor-modal'

export function DashboardHeader() {
  return (
    <PageHeader
      title="Monitors"
      description="Everything this workspace is watching, refreshed every 30 seconds."
      actions={<CreateMonitorModal />}
    />
  )
}
