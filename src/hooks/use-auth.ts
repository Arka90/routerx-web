import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth-service';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export function useRequestOtp() {
  const { setEmail } = useAuthStore((state) => state.auth);

  return useMutation({
    mutationFn: authApi.requestOtp,
    onSuccess: (response, variables) => {
      // Store the email in the global auth state for the verify step
      setEmail(variables.email);
      toast.success(response.message || 'OTP sent! Check your email.', { duration: 3000 });
    },
    onError: (error) => {
      console.error('Error requesting OTP:', error);
      toast.error('Failed to send OTP. Please try again.', { duration: 3000 });
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
        toast.success(response.message || 'Logged in!', { duration: 2000 });
      } else {
        toast.error('Login failed, no session token received.', { duration: 3000 });
      }
    },
    onError: (error) => {
      console.error('Error verifying OTP:', error);
      toast.error('Invalid OTP or verification failed.', { duration: 3000 });
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
