import api, { publicApi } from './client'
import { queryURL } from '@/services/queryURL'
import type {
  BillingState,
  IncidentUpdate,
  IncidentUpdateStatus,
  Plan,
  PublicStatusPage,
  Region,
  StatusPage,
  StatusPageComponent,
} from '@/types/status.types'

export const statusPageApi = {
  list: async (): Promise<{ status_pages: StatusPage[] }> => {
    const response = await api.get(queryURL.statusPages)
    return response.data
  },

  get: async (
    id: number
  ): Promise<{
    status_page: StatusPage
    components: StatusPageComponent[]
    subscriber_count: number
  }> => {
    const response = await api.get(queryURL.statusPage(id))
    return response.data
  },

  create: async (payload: {
    name: string
    slug?: string
  }): Promise<{ status_page: StatusPage }> => {
    const response = await api.post(queryURL.statusPages, payload)
    return response.data
  },

  update: async (
    id: number,
    payload: Partial<Omit<StatusPage, 'id' | 'org_id' | 'public_url'>>
  ): Promise<{ status_page: StatusPage }> => {
    const response = await api.patch(queryURL.statusPage(id), payload)
    return response.data
  },

  setComponents: async (
    id: number,
    components: Array<{ monitor_id: number; display_name: string }>
  ): Promise<{ components: StatusPageComponent[] }> => {
    const response = await api.put(queryURL.statusPageComponents(id), { components })
    return response.data
  },

  remove: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(queryURL.statusPage(id))
    return response.data
  },
}

/** No auth header on any of these — they work signed out, by design. */
export const publicStatusApi = {
  get: async (slug: string): Promise<PublicStatusPage> => {
    const response = await publicApi.get(queryURL.publicStatusPage(slug))
    return response.data
  },

  subscribe: async (slug: string, email: string): Promise<{ message: string }> => {
    const response = await publicApi.post(queryURL.subscribeToStatusPage(slug), { email })
    return response.data
  },

  confirm: async (token: string): Promise<{ message: string; email: string }> => {
    const response = await publicApi.post(queryURL.confirmSubscription(token))
    return response.data
  },

  unsubscribe: async (token: string): Promise<{ message: string }> => {
    const response = await publicApi.post(queryURL.unsubscribeFromStatusPage(token))
    return response.data
  },
}

export const incidentUpdateApi = {
  list: async (incidentId: number): Promise<{ updates: IncidentUpdate[] }> => {
    const response = await api.get(queryURL.incidentUpdates(incidentId))
    return response.data
  },

  create: async (
    incidentId: number,
    payload: { status: IncidentUpdateStatus; body: string; is_public: boolean }
  ): Promise<{ update: IncidentUpdate }> => {
    const response = await api.post(queryURL.incidentUpdates(incidentId), payload)
    return response.data
  },
}

export const regionApi = {
  list: async (): Promise<{ regions: Region[] }> => {
    const response = await api.get(queryURL.regions)
    return response.data
  },
}

export const billingApi = {
  get: async (): Promise<BillingState> => {
    const response = await api.get(queryURL.billing)
    return response.data
  },

  plans: async (): Promise<{ plans: Plan[]; billing_enabled: boolean }> => {
    const response = await publicApi.get(queryURL.plans)
    return response.data
  },

  checkout: async (plan: 'pro' | 'business'): Promise<{ url: string }> => {
    const response = await api.post(queryURL.checkout, { plan })
    return response.data
  },

  portal: async (): Promise<{ url: string }> => {
    const response = await api.post(queryURL.billingPortal)
    return response.data
  },
}
