import * as React from 'react'

import { cn } from '@/lib/utils'
import { Label } from './label'

interface FieldProps {
  id?: string
  label: React.ReactNode
  hint?: React.ReactNode
  error?: string | null
  optional?: boolean
  className?: string
  children: React.ReactNode
}

/** Label, control, hint and error stacked the same way on every form. */
function Field({ id, label, hint, error, optional, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>
        {label}
        {optional && <span className="font-normal text-subtle-foreground">optional</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-down">{error}</p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

/** Inline error box used above a form's submit button. */
function FormError({ children }: { children: React.ReactNode }) {
  if (!children) return null
  return (
    <p
      role="alert"
      className="rounded-lg border border-down/25 bg-down-soft px-3 py-2 text-[13px] text-down"
    >
      {children}
    </p>
  )
}

export { Field, FormError }
