export interface StatusPage {
  id: number
  org_id: number
  slug: string
  name: string
  headline: string | null
  about: string | null
  support_url: string | null
  published: boolean
  show_uptime: boolean
  public_url: string
  created_at: string
  updated_at: string
}

export interface StatusPageComponent {
  monitor_id: number
  display_name: string
  position: number
}

export type PublicComponentStatus =
  | 'operational'
  | 'degraded'
  | 'outage'
  | 'maintenance'
  | 'unknown'

export interface PublicComponent {
  name: string
  status: PublicComponentStatus
  uptime_percentage: number | null
  /** Oldest first, 90 entries. null means the monitor did not exist yet. */
  history: Array<{ date: string; uptime: number | null }>
}

export interface PublicIncidentUpdate {
  status: string
  body: string
  created_at: string
}

export interface PublicIncident {
  id: number
  component: string
  started_at: string
  resolved_at: string | null
  updates: PublicIncidentUpdate[]
}

export interface PublicStatusPage {
  name: string
  headline: string | null
  about: string | null
  support_url: string | null
  show_uptime: boolean
  overall: 'operational' | 'degraded' | 'outage' | 'maintenance'
  components: PublicComponent[]
  active_incidents: PublicIncident[]
  recent_incidents: PublicIncident[]
}

export type IncidentUpdateStatus =
  | 'investigating'
  | 'identified'
  | 'monitoring'
  | 'resolved'

export interface IncidentUpdate {
  id: number
  incident_id: number
  author_id: number | null
  author_email: string | null
  status: IncidentUpdateStatus
  body: string
  is_public: boolean
  created_at: string
}

export interface Region {
  code: string
  name: string
  enabled: boolean
}

export interface MonitorRegionState {
  region: string
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNCONFIRMED'
  consecutive_failures: number
  last_checked_at: string | null
  last_root_cause: string | null
}

// ---------------------------------------------------------------
// Billing
// ---------------------------------------------------------------

export interface PlanLimits {
  monitors: number | null
  members: number | null
  channels: number | null
  statusPages: number | null
  regions: number | null
  minIntervalSeconds: number
  retentionDays: number
}

export interface Plan {
  id: 'free' | 'pro' | 'business'
  name: string
  priceMonthly: number
  blurb: string
  limits: PlanLimits
}

export interface BillingUsage {
  monitors: number
  members: number
  channels: number
  status_pages: number
}

export interface BillingState {
  subscription: {
    plan: Plan['id']
    status: 'active' | 'trialing' | 'past_due' | 'canceled'
    current_period_end: string | null
    grandfathered: boolean
  }
  limits: PlanLimits
  usage: BillingUsage
  /** Limits are reported even when nothing is refused. */
  enforced: boolean
  billing_enabled: boolean
  plans: Plan[]
}
