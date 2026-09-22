import { Link } from '@tanstack/react-router'
import { ArrowRight, Github } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'

export function ClosingCta() {
  const sessionToken = useAuthStore((state) => state.auth.sessionToken)

  return (
    <section className="relative overflow-hidden border-t border-border">
      <div
        aria-hidden
        className="grid-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_100%,#000_30%,transparent_100%)]"
      />
      <div className="relative mx-auto max-w-3xl px-4 py-28 text-center sm:px-6">
        <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance sm:text-5xl">
          Start watching something.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground text-pretty">
          Sign in with a one-time code, add a URL, and the first trace runs within the minute.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="primary" size="lg">
            <Link to={sessionToken ? '/dashboard' : '/auth/login'}>
              {sessionToken ? 'Open the dashboard' : 'Create your workspace'}
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <a href="https://github.com/Arka90/routerx-api" target="_blank" rel="noreferrer">
              <Github />
              Star on GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-2">
          <Logo />
          <p className="text-[13px] text-muted-foreground">
            Uptime monitoring with root-cause forensics. © {new Date().getFullYear()} RouteRX.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted-foreground" aria-label="Footer">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how-it-works" className="hover:text-foreground">How it works</a>
          <a href="#self-host" className="hover:text-foreground">Self-host</a>
          <a href="https://github.com/Arka90/routerx-api" target="_blank" rel="noreferrer" className="hover:text-foreground">
            GitHub
          </a>
          <Link to="/auth/login" className="hover:text-foreground">Sign in</Link>
        </nav>
      </div>
    </footer>
  )
}
