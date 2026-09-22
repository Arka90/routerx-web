import { createFileRoute, redirect } from '@tanstack/react-router'
import { features } from '@/lib/features'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { useBilling, useBillingPortal, useCheckout } from '@/hooks/status.queries'
import { useActiveRole } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'
import { cn } from '@/lib/utils'
import type { Plan, PlanLimits } from '@/types/status.types'

export const Route = createFileRoute('/_authenticated/billing')({
  // Billing is built but switched off for now (see src/lib/features.ts).
  // Nothing links here while the flag is off; a typed URL lands on the dashboard.
  beforeLoad: () => {
    if (!features.billing) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: BillingPage,
})

function limitLabel(value: number | null): string {
  return value === null ? 'Unlimited' : String(value)
}

function planFeatures(limits: PlanLimits): string[] {
  return [
    `${limitLabel(limits.monitors)} monitors`,
    `${limitLabel(limits.members)} team members`,
    `Checks every ${limits.minIntervalSeconds}s`,
    `${limitLabel(limits.regions)} probe region${limits.regions === 1 ? '' : 's'}`,
    `${limitLabel(limits.statusPages)} status page${limits.statusPages === 1 ? '' : 's'}`,
    `${limits.retentionDays} days of history`,
  ]
}

function BillingPage() {
  const { data, isLoading } = useBilling()
  const role = useActiveRole()
  const checkout = useCheckout()
  const portal = useBillingPortal()

  const isOwner = role === 'owner'

  if (isLoading || !data) {
    return (
      <div className="max-w-4xl space-y-4 p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-48 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900" />
      </div>
    )
  }

  const usageRows: Array<{ label: string; used: number; limit: number | null }> = [
    { label: 'Monitors', used: data.usage.monitors, limit: data.limits.monitors },
    { label: 'Team members', used: data.usage.members, limit: data.limits.members },
    { label: 'Alert channels', used: data.usage.channels, limit: data.limits.channels },
    { label: 'Status pages', used: data.usage.status_pages, limit: data.limits.statusPages },
  ]

  return (
    <div className="animate-in fade-in max-w-4xl space-y-10 p-8 duration-500">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Plan & usage
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          What this workspace is on, and what it's using.
        </p>
      </div>

      <section className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {data.plans.find((plan) => plan.id === data.subscription.plan)?.name ??
                data.subscription.plan}
              {data.subscription.status !== 'active' && (
                <span className="ml-2 text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-500">
                  {data.subscription.status.replace('_', ' ')}
                </span>
              )}
            </p>
            <p className="mt-0.5 text-[12px] text-neutral-500">
              {data.subscription.grandfathered
                ? 'Grandfathered — no limits apply to this workspace.'
                : data.enforced
                  ? 'Limits are being enforced.'
                  : 'Limits are shown but not enforced on this instance.'}
              {data.subscription.current_period_end &&
                ` Renews ${new Date(data.subscription.current_period_end).toLocaleDateString()}.`}
            </p>
          </div>

          {isOwner && data.billing_enabled && data.subscription.plan !== 'free' && (
            <button
              onClick={() =>
                portal.mutate(undefined, {
                  onError: (error) =>
                    toast.error(getApiErrorMessage(error, 'Could not open billing')),
                })
              }
              disabled={portal.isPending}
              className="rounded-md border border-neutral-200 px-4 py-2 text-[13px] font-medium transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
            >
              Manage billing
            </button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Usage</h2>

        <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {usageRows.map((row) => {
            const ratio = row.limit === null ? 0 : Math.min(1, row.used / row.limit)
            const atLimit = row.limit !== null && row.used >= row.limit

            return (
              <div key={row.label} className="p-4">
                <div className="mb-2 flex items-baseline justify-between text-[13px]">
                  <span className="text-neutral-700 dark:text-neutral-300">{row.label}</span>
                  <span
                    className={cn(
                      'font-medium',
                      atLimit ? 'text-amber-600 dark:text-amber-500' : 'text-neutral-500'
                    )}
                  >
                    {row.used} / {limitLabel(row.limit)}
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-900">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      atLimit ? 'bg-amber-500' : 'bg-neutral-900 dark:bg-neutral-100'
                    )}
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Plans</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {data.plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              current={plan.id === data.subscription.plan}
              canUpgrade={isOwner && data.billing_enabled && plan.id !== 'free'}
              pending={checkout.isPending}
              onSelect={() =>
                checkout.mutate(plan.id as 'pro' | 'business', {
                  onError: (error) =>
                    toast.error(getApiErrorMessage(error, 'Could not start checkout')),
                })
              }
            />
          ))}
        </div>

        {!data.billing_enabled && (
          <p className="text-[12px] text-neutral-500">
            Self-hosted instance — no payment provider is configured, so plans are
            informational. Limits still apply if the instance enforces them.
          </p>
        )}
      </section>
    </div>
  )
}

function PlanCard({
  plan,
  current,
  canUpgrade,
  pending,
  onSelect,
}: {
  plan: Plan
  current: boolean
  canUpgrade: boolean
  pending: boolean
  onSelect: () => void
}) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border p-5',
        current
          ? 'border-neutral-900 dark:border-neutral-100'
          : 'border-neutral-200 dark:border-neutral-800'
      )}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {plan.name}
        </h3>
        <p className="mt-1 text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
          {plan.priceMonthly === 0 ? 'Free' : `$${(plan.priceMonthly / 100).toFixed(0)}`}
          {plan.priceMonthly > 0 && (
            <span className="text-[13px] font-normal text-neutral-500">/mo</span>
          )}
        </p>
        <p className="mt-1 text-[12px] text-neutral-500">{plan.blurb}</p>
      </div>

      <ul className="mb-5 flex-1 space-y-1.5">
        {planFeatures(plan.limits).map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-[13px] text-neutral-600 dark:text-neutral-400"
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
            {feature}
          </li>
        ))}
      </ul>

      {current ? (
        <div className="rounded-md bg-neutral-100 py-2 text-center text-[13px] font-medium text-neutral-500 dark:bg-neutral-900">
          Current plan
        </div>
      ) : canUpgrade ? (
        <button
          onClick={onSelect}
          disabled={pending}
          className="h-9 rounded-md bg-neutral-900 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? 'Starting…' : `Upgrade to ${plan.name}`}
        </button>
      ) : (
        <div className="h-9" />
      )}
    </div>
  )
}
