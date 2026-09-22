import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'border-border bg-surface-2 text-muted-foreground',
        outline: 'border-border bg-transparent text-muted-foreground',
        brand: 'border-brand/25 bg-brand-soft text-brand',
        up: 'border-up/25 bg-up-soft text-up',
        degraded: 'border-degraded/30 bg-degraded-soft text-degraded',
        down: 'border-down/25 bg-down-soft text-down',
        maintenance: 'border-maintenance/25 bg-maintenance-soft text-maintenance',
        paused: 'border-paused/25 bg-paused-soft text-paused',
        unknown: 'border-unknown/25 bg-unknown-soft text-unknown',
      },
      size: {
        sm: 'px-1.5 py-px text-[10px] uppercase tracking-wider',
        default: '',
        lg: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: { variant: 'neutral', size: 'default' },
  }
)

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge }
export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>
