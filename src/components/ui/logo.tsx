import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Brand mark: a route traced through a probe, drawn as a pulse line inside a
 * tile. Renders from currentColor so it works on any surface.
 */
function LogoMark({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn('size-6', className)}
      {...props}
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M6.5 17h5.2l2.6-6.5 3.4 11 2.6-6.5h5.2"
        stroke="var(--logo-ink, #fff)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25.5" cy="17" r="2" fill="var(--logo-accent, #22d3ee)" />
    </svg>
  )
}

function Logo({
  className,
  wordmark = true,
  size = 'default',
}: {
  className?: string
  wordmark?: boolean
  size?: 'default' | 'lg'
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 text-foreground', className)}>
      <LogoMark
        className={cn(size === 'lg' ? 'size-9' : 'size-7', 'text-foreground')}
        style={
          {
            '--logo-ink': 'var(--background)',
            '--logo-accent': 'var(--brand)',
          } as React.CSSProperties
        }
      />
      {wordmark && (
        <span
          className={cn(
            'font-semibold tracking-tight',
            size === 'lg' ? 'text-lg' : 'text-[15px]'
          )}
        >
          Route<span className="text-brand">RX</span>
        </span>
      )}
    </span>
  )
}

export { Logo, LogoMark }
