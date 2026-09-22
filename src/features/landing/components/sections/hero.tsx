import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowRight, Github } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { StatusDot } from '@/components/ui/status'
import { BrowserFrame, DashboardSnapshot } from '../snapshots'

const FACTS = [
  { value: '30s', label: 'fastest check interval' },
  { value: '4', label: 'network layers timed' },
  { value: '10', label: 'named failure classes' },
  { value: '90d', label: 'public uptime history' },
]

export function Hero() {
  const sessionToken = useAuthStore((state) => state.auth.sessionToken)

  return (
    <section className="relative overflow-hidden">
      {/* Engineering grid, faded toward the edges, with a brand glow behind the headline. */}
      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-10rem] left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, var(--brand-glow), transparent)' }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[12px] font-medium text-muted-foreground shadow-sm"
          >
            <StatusDot tone="up" live />
            Open source uptime monitoring, with the why
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-6xl"
          >
            Know <span className="text-brand">why</span> it&rsquo;s down.
            <br />
            Not just that it is.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg"
          >
            RouteRX runs a full network trace on every check — DNS, TCP, TLS, HTTP and a body
            assertion — names the layer that failed, confirms it from more than one region, and
            tells your team where they already are.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild variant="primary" size="lg">
              <Link to={sessionToken ? '/dashboard' : '/auth/login'}>
                {sessionToken ? 'Go to dashboard' : 'Start monitoring'}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://github.com/Arka90/routerx-api" target="_blank" rel="noreferrer">
                <Github />
                View the source
              </a>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="relative mt-16"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-6 -top-6 bottom-0 rounded-[2rem] opacity-70 blur-2xl"
            style={{ background: 'radial-gradient(60% 40% at 50% 0%, var(--brand-glow), transparent)' }}
          />
          <BrowserFrame url="app.routerx.dev/dashboard" className="relative">
            <DashboardSnapshot />
          </BrowserFrame>
        </motion.div>

        <dl className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {FACTS.map((fact) => (
            <div key={fact.label} className="text-center">
              <dt className="order-2 text-[13px] text-muted-foreground">{fact.label}</dt>
              <dd className="tabular text-3xl font-semibold tracking-tight text-foreground">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
