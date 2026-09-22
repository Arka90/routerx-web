import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * A native <select> with the same chrome as Input. Native is deliberate: it
 * works on every device, needs no positioning logic, and every value here is
 * a short list of fixed options.
 */
function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          'flex h-9 w-full appearance-none rounded-lg border border-input bg-card py-1 pr-9 pl-3 text-sm text-foreground shadow-sm',
          'transition-[border-color,box-shadow] duration-150',
          'hover:border-border-strong focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-subtle-foreground" />
    </div>
  )
}

export { Select }
