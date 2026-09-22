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
      setEmail(variables.email);
      toast.success(response.message || 'Code sent! Check your email.', { duration: 3000 });
    },
    onError: (error) => {
      // Surfaces the server's wording, which for a 429 says how long to wait
      // rather than implying the request itself was malformed.
      toast.error(getApiErrorMessage(error, 'Failed to send the code. Please try again.'), {
        duration: 4000,
      });
    },
  });
}

export function useVerifyOtp() {
  const { setSession } = useAuthStore((state) => state.auth);

  return useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (response) => {
      if (response.sessionToken) {
        setSession(response.sessionToken, response.user, response.organizations);
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

  const logout = async () => {
    // Tell the server first so the session row is actually revoked; clearing
    // the cookie alone would leave a usable token behind.
    try {
      await authApi.logout();
    } catch {
      // Already invalid, or the API is unreachable — sign out locally either
      // way rather than trapping someone in a session they asked to end.
    }

    reset();

    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  };

  return { logout };
}
