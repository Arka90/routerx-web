import api from './client';

export interface RequestOtpPayload {
  email: string;
}

export interface RequestOtpResponse {
  message: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  sessionToken: string;
}

export const authApi = {
  requestOtp: async (data: RequestOtpPayload): Promise<RequestOtpResponse> => {
    const response = await api.post<RequestOtpResponse>('/auth/request-otp', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    const response = await api.post<VerifyOtpResponse>('/auth/verify-otp', data);
    return response.data;
  },
};
