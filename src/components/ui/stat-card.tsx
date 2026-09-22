import * as React from 'react'

import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface StatCardProps {
  label: React.ReactNode
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: React.ReactNode
  tone?: 'default' | 'up' | 'down' | 'degraded' | 'brand'
  loading?: boolean
  className?: string
}

const TONE: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-foreground',
  up: 'text-up',
  down: 'text-down',
  degraded: 'text-degraded',
  brand: 'text-brand',
}

function StatCard({ label, value, hint, icon, tone = 'default', loading, className }: StatCardProps) {
  return (
    <div className={cn('card flex flex-col justify-between gap-3 p-4 sm:p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow truncate">{label}</span>
        {icon && <span className="text-subtle-foreground [&_svg]:size-4">{icon}</span>}
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <div className={cn('tabular text-2xl font-semibold tracking-tight sm:text-[28px]', TONE[tone])}>
          {value}
        </div>
      )}
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  )
}

export { StatCard }
