import { AxiosError } from 'axios';

interface ApiErrorBody {
  error?: string;
  message?: string;
}

/**
 * Pull the server's own message out of a failed request.
 *
 * The API now answers with specific, user-facing text for rate limits (429),
 * blocked probe targets, and invalid login codes. Showing a hardcoded
 * "Something went wrong" over the top of those tells the user nothing about
 * what to do next.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    const message = body?.error ?? body?.message;

    if (typeof message === 'string' && message.trim()) return message;

    if (!error.response) {
      return 'Could not reach the server. Check your connection and try again.';
    }
  }

  return fallback;
}
