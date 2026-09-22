import { useState } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { useCreateMonitor } from '@/hooks/monitor.queries'
import { getApiErrorMessage } from '@/api/errors'
import { useCanManage } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MonitorForm, type MonitorFormValues } from './monitor-form'

export function CreateMonitorModal() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMonitor = useCreateMonitor()
  const canManage = useCanManage()

  // Members can see everything and acknowledge incidents, but not change what
  // is monitored — so don't offer an action the server will refuse.
  if (!canManage) return null

  const handleSubmit = (values: MonitorFormValues) => {
    setError(null)

    createMonitor.mutate(values, {
      onSuccess: () => {
        toast.success('Monitor created')
        setOpen(false)
      },
      onError: (mutationError) =>
        setError(getApiErrorMessage(mutationError, 'Could not create that monitor')),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setError(null)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="primary">
          <Plus />
          Add monitor
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a monitor</DialogTitle>
          <DialogDescription>
            Add an endpoint to track its uptime, latency and certificate.
          </DialogDescription>
        </DialogHeader>

        <MonitorForm
          submitLabel="Create monitor"
          pending={createMonitor.isPending}
          onSubmit={handleSubmit}
          error={error}
        />
      </DialogContent>
    </Dialog>
  )
}
