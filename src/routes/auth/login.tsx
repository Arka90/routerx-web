import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { LoginForm } from '@/features/auth/login-form'
import { useAuthStore } from '@/stores/authStore'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export const Route = createFileRoute('/auth/login')({
  beforeLoad: () => {
    const { sessionToken } = useAuthStore.getState().auth
    if (sessionToken) {
      throw redirect({ to: '/' })
    }
  },
  component: RouteComponent,
})

const POINTS = [
  'Full network trace on every check',
  'Root cause named, not guessed',
  'Multi-region confirmation before anyone is paged',
]

function RouteComponent() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_30%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-12rem] left-1/2 h-[28rem] w-[40rem] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, var(--brand-glow), transparent)' }}
      />

      <header className="relative z-10 flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="rounded-md focus-visible:ring-2 focus-visible:ring-brand/40">
          <Logo />
        </Link>
        <ThemeToggle compact />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <LoginForm />

          <ul className="mt-8 space-y-2">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
                <Check className="size-3.5 text-up" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}
