import api from './client';
import { queryURL } from '@/services/queryURL';
import type { CurrentUser, Organization, SessionSummary } from '@/types/org.types';

export interface RequestOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  sessionToken: string;
  user: CurrentUser;
  organizations: Organization[];
}

export const authApi = {
  requestOtp: async (data: RequestOtpPayload): Promise<{ message: string }> => {
    const response = await api.post(queryURL.requestOtp, data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    const response = await api.post<VerifyOtpResponse>(queryURL.verifyOtp, data);
    return response.data;
  },

  me: async (): Promise<{ user: CurrentUser; organizations: Organization[] }> => {
    const response = await api.get(queryURL.me);
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post(queryURL.logout);
    return response.data;
  },

  listSessions: async (): Promise<{ sessions: SessionSummary[] }> => {
    const response = await api.get(queryURL.sessions);
    return response.data;
  },

  revokeSession: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(queryURL.session(id));
    return response.data;
  },

  revokeOtherSessions: async (): Promise<{ message: string }> => {
    const response = await api.post(queryURL.revokeOtherSessions);
    return response.data;
  },
};
