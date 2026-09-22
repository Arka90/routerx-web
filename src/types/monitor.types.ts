export type MonitorStatus =
  | 'UP'
  | 'DOWN'
  | 'DEGRADED'
  | 'UNCONFIRMED'
  | 'MAINTENANCE';

export type AssertionType = 'none' | 'contains' | 'not_contains' | 'json_path';

export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface Monitor {
  id: number;
  org_id: number;
  created_by: number | null;
  name: string | null;
  url: string;
  method: HttpMethod;
  request_headers: Record<string, string>;
  request_body: string | null;
  expected_status_codes: number[];
  assertion_type: AssertionType;
  assertion_value: string | null;
  timeout_ms: number;
  follow_redirects: boolean;
  interval_seconds: number;
  paused: boolean;
  confirmed_status: MonitorStatus;
  consecutive_failures: number;
  consecutive_successes: number;
  tls_expiry_at: string | null;
  tls_alerted_days: number[];
  in_maintenance: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertPolicy {
  monitor_id: number;
  failure_threshold: number;
  recovery_threshold: number;
  alert_on_slow: boolean;
  slow_threshold_ms: number;
  renotify_minutes: number | null;
  muted_until: string | null;
}

export interface MonitorDetail extends Monitor {
  policy: AlertPolicy;
  channel_ids: number[];
}

export interface CreateMonitorPayload {
  name?: string | null;
  url: string;
  method?: HttpMethod;
  request_headers?: Record<string, string>;
  request_body?: string | null;
  expected_status_codes?: number[];
  assertion_type?: AssertionType;
  assertion_value?: string | null;
  timeout_ms?: number;
  follow_redirects?: boolean;
  interval_seconds?: number;
  paused?: boolean;
}

export interface AlertPolicyPayload {
  failure_threshold?: number;
  recovery_threshold?: number;
  alert_on_slow?: boolean;
  slow_threshold_ms?: number;
  renotify_minutes?: number | null;
  muted_until?: string | null;
  channel_ids?: number[];
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
  reason: string | null;
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
  root_cause: string | null;
  failure_detail: string | null;
  acknowledged_at: string | null;
  acknowledged_by: number | null;
  created_at: string;
}

/** Incidents from the workspace-wide endpoint carry their monitor. */
export interface OrgIncident extends Incident {
  monitor_url: string;
  monitor_name: string | null;
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
  /** The window that was requested. */
  window_hours: number;
  /**
   * The window the percentage could actually be measured over. Smaller than
   * window_hours for a monitor younger than the requested window.
   */
  observed_hours: number;
}

export interface Probe {
  id: number;
  timestamp: string;
  dns: number | null;
  tcp: number | null;
  tls: number | null;
  ttfb: number | null;
  status: string;
  http_status_code: number | null;
  root_cause: string | null;
  failure_detail: string | null;
  responseTime: number;
}

export interface AlertDelivery {
  id: number;
  channel_type: string;
  channel_name: string | null;
  event: string;
  status: 'sent' | 'failed';
  error: string | null;
  created_at: string;
}
