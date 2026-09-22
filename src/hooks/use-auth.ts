import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth-service';
import { getApiErrorMessage } from '@/api/errors';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export function useRequestOtp() {
  const { setEmail } = useAuthStore((state) => state.auth);

  return useMutation({
    mutationFn: authApi.requestOtp,
    onSuccess: (response, variables) => {
      // Store the email in the global auth state for the verify step
      setEmail(variables.email);
      toast.success(response.message || 'Code sent! Check your email.', { duration: 3000 });
    },
    onError: (error) => {
      // Surfaces the server's wording, which for a 429 tells the user how
      // long to wait rather than implying the request itself was malformed.
      toast.error(getApiErrorMessage(error, 'Failed to send the code. Please try again.'), {
        duration: 4000,
      });
    },
  });
}

export function useVerifyOtp() {
  const { setSessionToken } = useAuthStore((state) => state.auth);

  return useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (response) => {
      if (response.sessionToken) {
        setSessionToken(response.sessionToken);
      } else {
        toast.error('Login failed, no session token received.', { duration: 3000 });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'That code was not accepted.'), {
        duration: 4000,
      });
    },
  });
}

export function useLogout() {
  const { reset } = useAuthStore((state) => state.auth);

  const logout = () => {
    reset();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  };

  return { logout };
}
