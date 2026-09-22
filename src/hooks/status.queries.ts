import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  billingApi,
  incidentUpdateApi,
  regionApi,
  statusPageApi,
} from '@/api/status-service'
import type { IncidentUpdateStatus, StatusPage } from '@/types/status.types'

export const useStatusPages = () =>
  useQuery({ queryKey: ['status-pages'], queryFn: statusPageApi.list })

export const useStatusPage = (id: number) =>
  useQuery({
    queryKey: ['status-page', id],
    queryFn: () => statusPageApi.get(id),
    enabled: Number.isInteger(id) && id > 0,
  })

function useStatusPageMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-pages'] })
      queryClient.invalidateQueries({ queryKey: ['status-page'] })
      // Creating or deleting a page moves the usage counter.
      queryClient.invalidateQueries({ queryKey: ['billing'] })
    },
  })
}

export const useCreateStatusPage = () =>
  useStatusPageMutation((payload: { name: string; slug?: string }) =>
    statusPageApi.create(payload)
  )

export const useUpdateStatusPage = () =>
  useStatusPageMutation(
    ({ id, payload }: { id: number; payload: Partial<StatusPage> }) =>
      statusPageApi.update(id, payload)
  )

export const useSetComponents = () =>
  useStatusPageMutation(
    ({
      id,
      components,
    }: {
      id: number
      components: Array<{ monitor_id: number; display_name: string }>
    }) => statusPageApi.setComponents(id, components)
  )

export const useDeleteStatusPage = () =>
  useStatusPageMutation((id: number) => statusPageApi.remove(id))

export const useIncidentUpdates = (incidentId: number) =>
  useQuery({
    queryKey: ['incident-updates', incidentId],
    queryFn: () => incidentUpdateApi.list(incidentId),
    enabled: Number.isInteger(incidentId) && incidentId > 0,
  })

export const useAddIncidentUpdate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      incidentId,
      ...payload
    }: {
      incidentId: number
      status: IncidentUpdateStatus
      body: string
      is_public: boolean
    }) => incidentUpdateApi.create(incidentId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['incident-updates', variables.incidentId],
      })
    },
  })
}

export const useRegions = () =>
  useQuery({
    queryKey: ['regions'],
    queryFn: regionApi.list,
    // Regions change when a worker is deployed, not minute to minute.
    staleTime: 10 * 60 * 1000,
  })

export const useBilling = () =>
  useQuery({ queryKey: ['billing'], queryFn: billingApi.get })

export const useCheckout = () =>
  useMutation({
    mutationFn: (plan: 'pro' | 'business') => billingApi.checkout(plan),
    onSuccess: (data) => {
      // Stripe hosts the payment form; we never see card details.
      window.location.href = data.url
    },
  })

export const useBillingPortal = () =>
  useMutation({
    mutationFn: () => billingApi.portal(),
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })
