import * as React from 'react'

import { cn } from '@/lib/utils'

const inputClass = [
  'flex h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-1 text-sm text-foreground shadow-sm',
  'transition-[border-color,box-shadow] duration-150',
  'placeholder:text-subtle-foreground',
  'file:border-0 file:bg-transparent file:text-sm file:font-medium',
  'hover:border-border-strong',
  'focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'aria-invalid:border-down aria-invalid:ring-2 aria-invalid:ring-down/20',
  '[color-scheme:light] dark:[color-scheme:dark]',
].join(' ')

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return <input type={type} data-slot="input" className={cn(inputClass, className)} {...props} />
}

export { Input }
