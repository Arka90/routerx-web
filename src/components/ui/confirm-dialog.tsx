import * as React from 'react'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import { AlertTriangle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  pending?: boolean
  onConfirm: () => void
}

/**
 * Replaces window.confirm. A destructive action gets a red button and an
 * explicit description of what is about to be lost.
 */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in dark:bg-black/60" />
        <AlertDialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border border-border bg-popover p-6 text-popover-foreground shadow-lg outline-none sm:max-w-md',
            'data-[state=open]:animate-rise'
          )}
        >
          <div className="flex gap-4">
            {destructive && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-down-soft text-down">
                <AlertTriangle className="size-4" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <AlertDialogPrimitive.Title className="text-base leading-tight font-semibold tracking-tight">
                {title}
              </AlertDialogPrimitive.Title>
              {description && (
                <AlertDialogPrimitive.Description className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {description}
                </AlertDialogPrimitive.Description>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" disabled={pending}>
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <Button
              variant={destructive ? 'destructive' : 'default'}
              loading={pending}
              onClick={(event) => {
                event.preventDefault()
                onConfirm()
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}

/**
 * Imperative helper: `const confirm = useConfirm()` then
 * `confirm({ title, onConfirm })`. Keeps call sites as short as window.confirm was.
 */
function useConfirm() {
  const [state, setState] = React.useState<Omit<ConfirmDialogProps, 'open' | 'onOpenChange'> | null>(
    null
  )

  const confirm = React.useCallback(
    (options: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>) => setState(options),
    []
  )

  const dialog = state ? (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) setState(null)
      }}
      {...state}
      onConfirm={() => {
        state.onConfirm()
        setState(null)
      }}
    />
  ) : null

  return { confirm, dialog }
}

// eslint-disable-next-line react-refresh/only-export-components -- hook and dialog belong together
export { ConfirmDialog, useConfirm }
