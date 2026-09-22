import * as React from 'react'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Browser chrome around a product snapshot. The snapshots underneath are real
 * React markup styled by the same tokens as the app, so they never drift out
 * of date the way screenshots do.
 */
export function BrowserFrame({
  url,
  className,
  children,
}: {
  url: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('browser-frame', className)}>
      <div className="flex h-10 items-center gap-3 border-b border-border bg-surface-2 px-3.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="size-2.5 rounded-full bg-border-strong" />
        </div>
        <div className="mx-auto flex h-6 w-full max-w-sm items-center gap-1.5 rounded-md border border-border bg-card px-2.5 font-mono text-[11px] text-muted-foreground">
          <Lock className="size-3 text-subtle-foreground" />
          <span className="truncate">{url}</span>
        </div>
        <div className="w-14" />
      </div>
      <div className="bg-background">{children}</div>
    </div>
  )
}
