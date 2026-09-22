import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { monitorApi } from '@/api/monitor-service';
import type {
  AlertPolicyPayload,
  CreateMonitorPayload,
  MaintenancePayload,
} from '@/types/monitor.types';

/**
 * Hours of history the dashboard asks for. The UI has always been labelled
 * "30-Day Uptime", but no window was ever sent, so the API fell back to its
 * 24-hour default.
 */
export const UPTIME_WINDOW_HOURS = 24 * 30;

export const useMonitors = () =>
  useQuery({
    queryKey: ['monitors'],
    queryFn: monitorApi.getMonitors,
    refetchInterval: 30_000,
  });

export const useMonitor = (id: number) =>
  useQuery({
    queryKey: ['monitor', id],
    queryFn: () => monitorApi.getMonitor(id),
    enabled: Number.isInteger(id) && id > 0,
    refetchInterval: 30_000,
  });

/** Refreshes the list and, when given, the single monitor that changed. */
function useMonitorMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  monitorIdOf?: (variables: TVariables) => number
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });

      if (monitorIdOf) {
        queryClient.invalidateQueries({ queryKey: ['monitor', monitorIdOf(variables)] });
      }
    },
  });
}

export const useCreateMonitor = () =>
  useMonitorMutation((payload: CreateMonitorPayload) => monitorApi.createMonitor(payload));

export const useUpdateMonitor = () =>
  useMonitorMutation(
    ({ id, payload }: { id: number; payload: CreateMonitorPayload }) =>
      monitorApi.updateMonitor(id, payload),
    ({ id }) => id
  );

export const useDeleteMonitor = () =>
  useMonitorMutation((id: number) => monitorApi.deleteMonitor(id), (id) => id);

export const useUpdatePolicy = () =>
  useMonitorMutation(
    ({ id, payload }: { id: number; payload: AlertPolicyPayload }) =>
      monitorApi.updatePolicy(id, payload),
    ({ id }) => id
  );

export const useSetMaintenance = () =>
  useMonitorMutation(
    ({ id, payload }: { id: number; payload: MaintenancePayload }) =>
      monitorApi.setMaintenance(id, payload),
    ({ id }) => id
  );

export const useDeleteMaintenance = () =>
  useMonitorMutation((id: number) => monitorApi.deleteMaintenance(id), (id) => id);

export const useGetMaintenance = (monitorId: number) =>
  useQuery({
    queryKey: ['maintenance', monitorId],
    queryFn: () => monitorApi.getMaintenance(monitorId),
    enabled: !!monitorId,
  });

export const useIncidents = (monitorId: number) =>
  useQuery({
    queryKey: ['incidents', monitorId],
    queryFn: () => monitorApi.getIncidents(monitorId),
    enabled: !!monitorId,
  });

export const useAllIncidents = (openOnly = false) =>
  useQuery({
    queryKey: ['incidents', 'all', openOnly],
    queryFn: () => monitorApi.getAllIncidents(openOnly),
    refetchInterval: 60_000,
  });

export const useAcknowledgeIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (incidentId: number) => monitorApi.acknowledgeIncident(incidentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidents'] }),
  });
};

export const useUptime = (monitorId: number, hours: number = UPTIME_WINDOW_HOURS) =>
  useQuery({
    queryKey: ['uptime', monitorId, hours],
    queryFn: () => monitorApi.getUptime(monitorId, hours),
    enabled: !!monitorId,
  });

export const useProbes = (monitorId: number) =>
  useQuery({
    queryKey: ['probes', monitorId],
    queryFn: () => monitorApi.getProbes(monitorId),
    enabled: !!monitorId,
    refetchInterval: 10_000,
  });

export const useDeliveries = (monitorId: number) =>
  useQuery({
    queryKey: ['deliveries', monitorId],
    queryFn: () => monitorApi.getDeliveries(monitorId),
    enabled: !!monitorId,
  });
