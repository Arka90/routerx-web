import api from './client';
import { queryURL } from '@/services/queryURL';
import type {
  InvitePreview,
  NotificationChannel,
  OrgInvite,
  OrgMember,
  OrgRole,
  Organization,
} from '@/types/org.types';

export const orgApi = {
  list: async (): Promise<{ organizations: Organization[] }> => {
    const response = await api.get(queryURL.organizations);
    return response.data;
  },

  create: async (name: string): Promise<{ organization: Organization }> => {
    const response = await api.post(queryURL.organizations, { name });
    return response.data;
  },

  listMembers: async (): Promise<{ members: OrgMember[] }> => {
    const response = await api.get(queryURL.members);
    return response.data;
  },

  updateMemberRole: async (userId: number, role: OrgRole): Promise<{ message: string }> => {
    const response = await api.patch(queryURL.member(userId), { role });
    return response.data;
  },

  removeMember: async (userId: number): Promise<{ message: string }> => {
    const response = await api.delete(queryURL.member(userId));
    return response.data;
  },

  listInvites: async (): Promise<{ invites: OrgInvite[] }> => {
    const response = await api.get(queryURL.invites);
    return response.data;
  },

  createInvite: async (email: string, role: OrgRole): Promise<{ invite: OrgInvite }> => {
    const response = await api.post(queryURL.invites, { email, role });
    return response.data;
  },

  revokeInvite: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(queryURL.invite(id));
    return response.data;
  },

  peekInvite: async (token: string): Promise<{ invite: InvitePreview }> => {
    const response = await api.get(queryURL.inviteByToken(token));
    return response.data;
  },

  acceptInvite: async (token: string): Promise<{ organization: Organization }> => {
    const response = await api.post(queryURL.acceptInvite(token));
    return response.data;
  },
};

export const channelApi = {
  list: async (): Promise<{ channels: NotificationChannel[] }> => {
    const response = await api.get(queryURL.channels);
    return response.data;
  },

  create: async (payload: {
    type: NotificationChannel['type'];
    name: string;
    config: Record<string, unknown>;
  }): Promise<{ channel: NotificationChannel }> => {
    const response = await api.post(queryURL.channels, payload);
    return response.data;
  },

  update: async (
    id: number,
    payload: { name?: string; config?: Record<string, unknown>; enabled?: boolean }
  ): Promise<{ channel: NotificationChannel }> => {
    const response = await api.patch(queryURL.channel(id), payload);
    return response.data;
  },

  remove: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(queryURL.channel(id));
    return response.data;
  },

  test: async (id: number): Promise<{ message: string }> => {
    const response = await api.post(queryURL.testChannel(id));
    return response.data;
  },
};
