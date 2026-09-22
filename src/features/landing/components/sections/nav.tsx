import { Link } from '@tanstack/react-router'
import { ArrowRight, Github } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#product', label: 'Product' },
  { href: '#self-host', label: 'Self-host' },
]

export function LandingNav() {
  const sessionToken = useAuthStore((state) => state.auth.sessionToken)

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="rounded-md focus-visible:ring-2 focus-visible:ring-brand/40">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle compact className="hidden sm:inline-flex" />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <a href="https://github.com/Arka90/routerx-api" target="_blank" rel="noreferrer">
              <Github />
              GitHub
            </a>
          </Button>
          {sessionToken ? (
            <Button asChild size="sm">
              <Link to="/dashboard">
                Dashboard
                <ArrowRight />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth/login">Sign in</Link>
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link to="/auth/login">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
