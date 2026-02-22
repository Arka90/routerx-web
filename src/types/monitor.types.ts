export interface Monitor {
  id: number;
  user_id: number;
  url: string;
  interval_seconds: number;
  next_check_at: string;
  created_at: string;
  confirmed_status: 'UP' | 'DOWN' | 'UNCONFIRMED' | 'MAINTENANCE';
  consecutive_failures: number;
  consecutive_successes: number;
  tls_expiry_at: string | null;
  tls_alerted_days: string | null;
  in_maintenance: boolean | number;
}

export interface CreateMonitorPayload {
  url: string;
  interval_seconds: number;
}

export interface MaintenancePayload {
  starts_at: string;
  ends_at: string;
  reason: string;
}

export interface Maintenance {
  id: number;
  monitor_id: number;
  starts_at: string;
  ends_at: string;
  reason: string;
  created_at: string;
}

export interface MaintenanceResponse {
  maintenance: Maintenance | null;
}

export interface Incident {
  id: number;
  monitor_id: number;
  started_at: string;
  resolved_at: string | null;
  duration_seconds: number | null;
  created_at: string;
  root_cause: string | null;
}

export interface IncidentResponse {
  monitor_id: number;
  open_incident: Incident | null;
  total: number;
  incidents: Incident[];
}

export interface UptimeResponse {
  monitor_id: number;
  url: string;
  uptime_percentage: number;
  total_downtime_seconds: number;
  window_hours: number;
}

export interface Probe {
  id: number;
  timestamp: string;
  dns: number;
  tcp: number;
  tls: number;
  ttfb: number;
  status: 'UP' | 'DOWN';
  http_status_code: number;
  responseTime: number;
}
