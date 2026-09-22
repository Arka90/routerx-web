/**
 * Feature flags.
 *
 * Billing (plans, Stripe checkout and the customer portal) is built but
 * switched off for now. The code stays in place; nothing links to it and the
 * route redirects until VITE_ENABLE_BILLING=true is set at build time.
 */
export const features = {
  billing: import.meta.env.VITE_ENABLE_BILLING === 'true',
} as const
