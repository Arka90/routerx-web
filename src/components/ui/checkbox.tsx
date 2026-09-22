import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-border-strong bg-card shadow-sm',
        'transition-[background-color,border-color] duration-150',
        'hover:border-foreground/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        'data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-brand-foreground',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        <Check className="size-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

/** Checkbox with its label and optional hint laid out the way forms use it. */
function CheckboxField({
  id,
  label,
  hint,
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  id: string
  label: React.ReactNode
  hint?: React.ReactNode
}) {
  return (
    <label htmlFor={id} className={cn('flex cursor-pointer items-start gap-2.5', className)}>
      <Checkbox id={id} className="mt-0.5" {...props} />
      <span className="min-w-0">
        <span className="block text-sm text-foreground">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  )
}

export { Checkbox, CheckboxField }
