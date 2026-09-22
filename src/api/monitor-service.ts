import api from './client';
import { queryURL } from '@/services/queryURL';
import type {
  AlertDelivery,
  AlertPolicy,
  AlertPolicyPayload,
  CreateMonitorPayload,
  IncidentResponse,
  MaintenancePayload,
  MaintenanceResponse,
  Monitor,
  MonitorDetail,
  OrgIncident,
  Probe,
  UptimeResponse,
} from '@/types/monitor.types';

export const monitorApi = {
  getMonitors: async (): Promise<Monitor[]> => {
    const response = await api.get<Monitor[]>(queryURL.monitors);
    return response.data;
  },

  getMonitor: async (id: number): Promise<MonitorDetail> => {
    const response = await api.get<MonitorDetail>(queryURL.monitorById(id));
    return response.data;
  },

  createMonitor: async (
    payload: CreateMonitorPayload
  ): Promise<{ message: string; monitor: Monitor }> => {
    const response = await api.post(queryURL.monitors, payload);
    return response.data;
  },

  updateMonitor: async (
    id: number,
    payload: CreateMonitorPayload
  ): Promise<{ message: string; monitor: Monitor }> => {
    const response = await api.patch(queryURL.monitorById(id), payload);
    return response.data;
  },

  deleteMonitor: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(queryURL.monitorById(id));
    return response.data;
  },

  getPolicy: async (id: number): Promise<{ policy: AlertPolicy; channel_ids: number[] }> => {
    const response = await api.get(queryURL.policy(id));
    return response.data;
  },

  updatePolicy: async (
    id: number,
    payload: AlertPolicyPayload
  ): Promise<{ policy: AlertPolicy; channel_ids: number[] }> => {
    const response = await api.put(queryURL.policy(id), payload);
    return response.data;
  },

  getDeliveries: async (id: number): Promise<{ deliveries: AlertDelivery[] }> => {
    const response = await api.get(queryURL.deliveries(id));
    return response.data;
  },

  setMaintenance: async (
    id: number,
    payload: MaintenancePayload
  ): Promise<{ message: string }> => {
    const response = await api.post(queryURL.maintenance(id), payload);
    return response.data;
  },

  getMaintenance: async (id: number): Promise<MaintenanceResponse> => {
    const response = await api.get<MaintenanceResponse>(queryURL.maintenance(id));
    return response.data;
  },

  deleteMaintenance: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(queryURL.maintenance(id));
    return response.data;
  },

  getIncidents: async (monitorId: number): Promise<IncidentResponse> => {
    const response = await api.get<IncidentResponse>(queryURL.incidents(monitorId));
    return response.data;
  },

  /** Every incident in the workspace — one request, not one per monitor. */
  getAllIncidents: async (
    openOnly = false
  ): Promise<{ total: number; incidents: OrgIncident[] }> => {
    const response = await api.get(queryURL.allIncidents, {
      params: openOnly ? { open: 'true' } : undefined,
    });
    return response.data;
  },

  acknowledgeIncident: async (incidentId: number): Promise<{ message: string }> => {
    const response = await api.post(queryURL.acknowledgeIncident(incidentId));
    return response.data;
  },

  getUptime: async (monitorId: number, hours: number): Promise<UptimeResponse> => {
    const response = await api.get<UptimeResponse>(queryURL.uptime(monitorId, hours));
    return response.data;
  },

  getProbes: async (monitorId: number): Promise<Probe[]> => {
    const response = await api.get<Probe[]>(queryURL.probes(monitorId));
    return response.data;
  },
};
