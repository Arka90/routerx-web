import { useState } from 'react';
import { useCreateMonitor } from '@/hooks/monitor.queries';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function CreateMonitorModal() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('https://');
  const [interval, setIntervalValue] = useState('60');

  const createMonitorMutation = useCreateMonitor();

  const handleCreateMonitor = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || url === 'https://') {
      toast.error('Please enter a valid URL');
      return;
    }

    const intervalNum = parseInt(interval, 10);
    if (isNaN(intervalNum) || ![30, 60, 90].includes(intervalNum)) {
      toast.error('Interval must be 30, 60, or 90 seconds');
      return;
    }

    createMonitorMutation.mutate(
      { url: url, interval_seconds: intervalNum },
      {
        onSuccess: () => {
          toast.success('Monitor created successfully');
          setOpen(false);
          setUrl('https://');
          setIntervalValue('60');
        },
        onError: (error: unknown) => {
          const errMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create monitor';
          toast.error(errMessage);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 px-4 py-2 rounded-md text-[13px] font-medium transition-opacity shadow-sm">
          Add Monitor
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0A0A0A] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Create new monitor</DialogTitle>
          <DialogDescription className="text-neutral-500 dark:text-neutral-400">
            Add a new endpoint to track its uptime and performance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateMonitor} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium leading-none text-neutral-900 dark:text-neutral-100">
              Endpoint URL
            </label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="h-10 rounded-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111] text-sm transition-all focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:border-black dark:focus-visible:border-white shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="interval" className="text-sm font-medium leading-none text-neutral-900 dark:text-neutral-100">
              Check Interval
            </label>
            <select
              id="interval"
              value={interval}
              onChange={(e) => setIntervalValue(e.target.value)}
              className="flex h-10 w-full rounded-md border border-neutral-200 bg-white dark:bg-[#111] text-neutral-900 dark:text-neutral-100 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black dark:border-neutral-800 dark:focus-visible:ring-white"
            >
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="90">1.5 minutes</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="w-full h-10 rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50 shadow-sm transition-all"
            disabled={createMonitorMutation.isPending}
          >
            {createMonitorMutation.isPending ? 'Creating...' : 'Create Monitor'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
