import * as React from 'react'

import { cn } from '@/lib/utils'

interface PageHeaderProps {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Consistent page gutter and width for every authenticated route. */
function Page({
  className,
  width = 'default',
  ...props
}: React.ComponentProps<'div'> & { width?: 'default' | 'narrow' | 'wide' }) {
  return (
    <div
      className={cn(
        'mx-auto w-full animate-fade-in space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8',
        width === 'narrow' && 'max-w-4xl',
        width === 'default' && 'max-w-6xl',
        width === 'wide' && 'max-w-[1600px]',
        className
      )}
      {...props}
    />
  )
}

function SectionHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export { PageHeader, Page, SectionHeader }
