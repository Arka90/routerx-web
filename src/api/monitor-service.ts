import api from './client';
import { queryURL } from '@/services/queryURL';
import type { 
  Monitor, 
  CreateMonitorPayload, 
  MaintenancePayload,
  MaintenanceResponse,
  IncidentResponse, 
  UptimeResponse,
  Probe
} from '@/types/monitor.types';

export const monitorApi = {
  getMonitors: async (): Promise<Monitor[]> => {
    const response = await api.get<Monitor[]>(queryURL.monitors);
    return response.data;
  },

  createMonitor: async (payload: CreateMonitorPayload): Promise<{ message: string, monitor: Monitor }> => {
    const response = await api.post<{ message: string, monitor: Monitor }>(queryURL.monitors, payload);
    return response.data;
  },

  updateMonitor: async (id: number, payload: CreateMonitorPayload): Promise<{ message: string, monitor: Monitor }> => {
    const response = await api.patch<{ message: string, monitor: Monitor }>(queryURL.monitorById(id), payload);
    return response.data;
  },

  deleteMonitor: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(queryURL.monitorById(id));
    return response.data;
  },

  setMaintenance: async (id: number, payload: MaintenancePayload): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(queryURL.maintenance(id), payload);
    return response.data;
  },

  getMaintenance: async (id: number): Promise<MaintenanceResponse> => {
    const response = await api.get<MaintenanceResponse>(queryURL.maintenance(id));
    return response.data;
  },

  deleteMaintenance: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(queryURL.maintenance(id));
    return response.data;
  },

  getIncidents: async (monitorId: number): Promise<IncidentResponse> => {
    const response = await api.get<IncidentResponse>(queryURL.incidents(monitorId));
    return response.data;
  },

  getUptime: async (monitorId: number): Promise<UptimeResponse> => {
    const response = await api.get<UptimeResponse>(queryURL.uptime(monitorId));
    return response.data;
  },

  getProbes: async (monitorId: number): Promise<Probe[]> => {
    const response = await api.get<Probe[]>(queryURL.probes(monitorId));
    return response.data;
  },
};
