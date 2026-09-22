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

  // Incidents
  allIncidents: '/incidents',
  incidents: (monitorId: number) => `/incidents/${monitorId}`,
  uptime: (monitorId: number, hours: number) =>
    `/incidents/${monitorId}/uptime?hours=${hours}`,
  acknowledgeIncident: (incidentId: number) => `/incidents/${incidentId}/ack`,
};
