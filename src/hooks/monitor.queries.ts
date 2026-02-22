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

// Fetch uptime for a monitor
export const useUptime = (monitorId: number) => {
  return useQuery({
    queryKey: ['uptime', monitorId],
    queryFn: async () => await monitorApi.getUptime(monitorId),
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
