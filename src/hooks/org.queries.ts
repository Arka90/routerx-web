import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { channelApi, orgApi } from '@/api/org-service';
import { authApi } from '@/api/auth-service';
import { useAuthStore } from '@/stores/authStore';
import type { NotificationChannel, OrgRole } from '@/types/org.types';

export const useOrganizations = () => {
  const setOrganizations = useAuthStore((state) => state.auth.setOrganizations);

  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const data = await orgApi.list();
      // Roles can change under us; keep the store in step so the UI does not
      // keep offering actions the server will now refuse.
      setOrganizations(data.organizations);
      return data.organizations;
    },
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => orgApi.create(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
  });
};

export const useMembers = () =>
  useQuery({ queryKey: ['members'], queryFn: () => orgApi.listMembers() });

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: OrgRole }) =>
      orgApi.updateMemberRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => orgApi.removeMember(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  });
};

export const useInvites = () =>
  useQuery({ queryKey: ['invites'], queryFn: () => orgApi.listInvites() });

export const useCreateInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: OrgRole }) =>
      orgApi.createInvite(email, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invites'] }),
  });
};

export const useRevokeInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => orgApi.revokeInvite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invites'] }),
  });
};

// ---------------------------------------------------------------
// Notification channels
// ---------------------------------------------------------------

export const useChannels = () =>
  useQuery({ queryKey: ['channels'], queryFn: () => channelApi.list() });

function useChannelMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['channels'] }),
  });
}

export const useCreateChannel = () =>
  useChannelMutation(
    (payload: {
      type: NotificationChannel['type'];
      name: string;
      config: Record<string, unknown>;
    }) => channelApi.create(payload)
  );

export const useUpdateChannel = () =>
  useChannelMutation(
    ({
      id,
      payload,
    }: {
      id: number;
      payload: { name?: string; config?: Record<string, unknown>; enabled?: boolean };
    }) => channelApi.update(id, payload)
  );

export const useDeleteChannel = () =>
  useChannelMutation((id: number) => channelApi.remove(id));

export const useTestChannel = () =>
  useMutation({ mutationFn: (id: number) => channelApi.test(id) });

// ---------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------

export const useSessions = () =>
  useQuery({ queryKey: ['sessions'], queryFn: () => authApi.listSessions() });

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => authApi.revokeSession(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  });
};

export const useRevokeOtherSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.revokeOtherSessions(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  });
};
