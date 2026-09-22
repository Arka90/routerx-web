export const queryURL = {
  // Auth
  requestOtp: '/auth/request-otp',
  verifyOtp: '/auth/verify-otp',
  me: '/auth/me',
  logout: '/auth/logout',
  sessions: '/auth/sessions',
  session: (id: number) => `/auth/sessions/${id}`,
  revokeOtherSessions: '/auth/sessions/revoke-others',

  // Workspaces
  organizations: '/orgs',
  members: '/orgs/members',
  member: (userId: number) => `/orgs/members/${userId}`,
  invites: '/orgs/invites',
  invite: (id: number) => `/orgs/invites/${id}`,
  inviteByToken: (token: string) => `/invites/${token}`,
  acceptInvite: (token: string) => `/invites/${token}/accept`,

  // Notification channels
  channels: '/channels',
  channel: (id: number) => `/channels/${id}`,
  testChannel: (id: number) => `/channels/${id}/test`,

  // Monitors
  monitors: '/monitor',
  monitorById: (id: number) => `/monitor/${id}`,
  probes: (id: number) => `/monitor/${id}/probes`,
  policy: (id: number) => `/monitor/${id}/policy`,
  deliveries: (id: number) => `/monitor/${id}/deliveries`,
  maintenance: (id: number) => `/monitor/${id}/maintenance`,

  // Status pages (management)
  statusPages: '/status-pages',
  statusPage: (id: number) => `/status-pages/${id}`,
  statusPageComponents: (id: number) => `/status-pages/${id}/components`,

  // Status pages (public)
  publicStatusPage: (slug: string) => `/status/${slug}`,
  subscribeToStatusPage: (slug: string) => `/status/${slug}/subscribe`,
  confirmSubscription: (token: string) => `/status/subscriptions/confirm/${token}`,
  unsubscribeFromStatusPage: (token: string) =>
    `/status/subscriptions/unsubscribe/${token}`,

  // Regions
  regions: '/regions',

  // Billing
  billing: '/billing',
  plans: '/billing/plans',
  checkout: '/billing/checkout',
  billingPortal: '/billing/portal',

  // Incidents
  allIncidents: '/incidents',
  incidents: (monitorId: number) => `/incidents/${monitorId}`,
  uptime: (monitorId: number, hours: number) =>
    `/incidents/${monitorId}/uptime?hours=${hours}`,
  acknowledgeIncident: (incidentId: number) => `/incidents/${incidentId}/ack`,
  incidentUpdates: (incidentId: number) => `/incidents/${incidentId}/updates`,
};
