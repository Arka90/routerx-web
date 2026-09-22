import * as React from 'react'

import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'grid-dots flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong px-6 py-16 text-center',
        className
      )}
    >
      {icon && (
        <span className="mb-4 flex size-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm [&_svg]:size-5">
          {icon}
        </span>
      )}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export { EmptyState }
