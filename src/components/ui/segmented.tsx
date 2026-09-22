import * as React from 'react'

import { cn } from '@/lib/utils'

interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: React.ReactNode; count?: number }>
  size?: 'sm' | 'default'
  className?: string
  'aria-label'?: string
}

/** Small mutually-exclusive filter control (All / Open only, etc.). */
function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = 'default',
  className,
  ...rest
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={rest['aria-label']}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5',
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-[background-color,color,box-shadow]',
              size === 'sm' ? 'h-6 px-2 text-xs' : 'h-7 px-3 text-[13px]',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  'tabular rounded px-1 text-[10px] leading-4',
                  active ? 'bg-surface-2 text-muted-foreground' : 'text-subtle-foreground'
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export { Segmented }
