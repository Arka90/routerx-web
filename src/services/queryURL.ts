export const queryURL = {
  monitors: '/monitor',
  monitorById: (id: number) => `/monitor/${id}`,
  maintenance: (id: number) => `/monitor/${id}/maintenance`,
  incidents: (id: number) => `/incidents/${id}`,
  uptime: (id: number) => `/incidents/${id}/uptime`,
  probes: (id: number) => `/monitor/${id}/probes`,
};
