import * as React from 'react'
import { useLocation } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Sidebar } from './sidebar'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Sidebar on desktop, a top bar with a slide-in drawer below the lg breakpoint.
 * The drawer closes itself on navigation so a tap on a nav link feels like
 * one action, not two.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const pathname = useLocation().pathname

  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 lg:block">
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
          <Logo />
          <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu />
              </Button>
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
              <DialogPrimitive.Content
                className={cn(
                  'fixed inset-y-0 left-0 z-50 h-full w-[280px] border-r border-border bg-card shadow-lg outline-none',
                  'data-[state=open]:animate-[slide-in_0.25s_cubic-bezier(0.22,1,0.36,1)]'
                )}
              >
                <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
                <Sidebar />
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
