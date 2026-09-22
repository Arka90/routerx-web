import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { BrowserFrame, IncidentSnapshot, MonitorSnapshot, StatusPageSnapshot } from '../snapshots'
import { SectionIntro } from './section-intro'
import { cn } from '@/lib/utils'

const SHOTS = [
  {
    eyebrow: 'Monitor detail',
    title: 'Watch every layer, live.',
    body: 'Each check is charted by layer and refreshed every ten seconds. Uptime, downtime and the certificate countdown sit above it; the per-region view below shows the one vantage point that disagrees.',
    points: ['DNS, TCP, TLS and TTFB per check', 'Certificate days remaining', 'Per-region reachability and quorum'],
    url: 'app.routerx.dev/monitor/42',
    snapshot: <MonitorSnapshot />,
  },
  {
    eyebrow: 'Incidents',
    title: 'The incident carries its own forensics.',
    body: 'Root cause, the raw error, which regions saw it, who acknowledged it, and the running narrative — with internal notes kept separate from what customers see.',
    points: ['Named root cause with the underlying error', 'Acknowledge to stop reminders', 'Public and internal updates on one timeline'],
    url: 'app.routerx.dev/incidents',
    snapshot: <IncidentSnapshot />,
  },
  {
    eyebrow: 'Status pages',
    title: 'A page your customers can read during the outage.',
    body: 'Publish a status page per workspace. Components get the names you choose, never the monitor URL; visitors get 90 days of history and can subscribe by email.',
    points: ['90-day per-component uptime bars', 'Double-opt-in email subscribers', 'Draft until you publish'],
    url: 'app.routerx.dev/status/acme',
    snapshot: <StatusPageSnapshot />,
  },
]

export function Product() {
  return (
    <section id="product" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionIntro
          eyebrow="A look inside"
          title="The dashboard, at the moments that matter."
          description="These are the actual screens, rendered with the same components the app uses — not mockups."
        />

        <div className="mt-16 space-y-24">
          {SHOTS.map((shot, index) => (
            <motion.div
              key={shot.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className={cn(
                'grid items-center gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]',
                index % 2 === 1 && 'lg:[&>*:first-child]:order-2'
              )}
            >
              <div>
                <div className="eyebrow text-brand">{shot.eyebrow}</div>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                  {shot.title}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{shot.body}</p>
                <ul className="mt-6 space-y-2.5">
                  {shot.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-up-soft text-up">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <BrowserFrame url={shot.url}>{shot.snapshot}</BrowserFrame>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
