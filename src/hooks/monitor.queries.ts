import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monitorApi } from '@/api/monitor-service';
import type { 
  CreateMonitorPayload, 
  MaintenancePayload, 
} from '@/types/monitor.types';

// Fetch all monitors
export const useMonitors = () => {
  return useQuery({
    queryKey: ['monitors'],
    queryFn: async () => await monitorApi.getMonitors(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Create a new monitor
export const useCreateMonitor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMonitorPayload) => await monitorApi.createMonitor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });
};

// Update an existing monitor
export const useUpdateMonitor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number, payload: CreateMonitorPayload }) => await monitorApi.updateMonitor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });
};

// Delete a monitor
export const useDeleteMonitor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => await monitorApi.deleteMonitor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });
};

// Set maintenance for a monitor
export const useSetMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number, payload: MaintenancePayload }) => await monitorApi.setMaintenance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
};

// Get maintenance for a monitor
export const useGetMaintenance = (monitorId: number) => {
  return useQuery({
    queryKey: ['maintenance', monitorId],
    queryFn: async () => await monitorApi.getMaintenance(monitorId),
    enabled: !!monitorId,
  });
};

// Delete maintenance for a monitor
export const useDeleteMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => await monitorApi.deleteMaintenance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
};

// Fetch incidents for a monitor
export const useIncidents = (monitorId: number) => {
  return useQuery({
    queryKey: ['incidents', monitorId],
    queryFn: async () => await monitorApi.getIncidents(monitorId),
    enabled: !!monitorId,
  });
};

/**
 * Hours of history the dashboard asks for. The UI has always been labelled
 * "30-Day Uptime", but no window was ever sent, so the API fell back to its
 * 24-hour default and the headline number was a day of data under a
 * thirty-day heading.
 */
export const UPTIME_WINDOW_HOURS = 24 * 30;

// Fetch uptime for a monitor
export const useUptime = (monitorId: number, hours: number = UPTIME_WINDOW_HOURS) => {
  return useQuery({
    queryKey: ['uptime', monitorId, hours],
    queryFn: async () => await monitorApi.getUptime(monitorId, hours),
    enabled: !!monitorId,
  });
};

// Fetch probes for a monitor
export const useProbes = (monitorId: number) => {
  return useQuery({
    queryKey: ['probes', monitorId],
    queryFn: async () => await monitorApi.getProbes(monitorId),
    enabled: !!monitorId,
    refetchInterval: 10000, // Refetch every 10 seconds as requested
  });
};
