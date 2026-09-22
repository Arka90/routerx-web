import { motion } from 'framer-motion'
import { Hash, Mail, MessageCircle, Webhook } from 'lucide-react'
import { FEATURES, type Feature } from '../../data'
import { StatusDot } from '@/components/ui/status'
import { Badge } from '@/components/ui/badge'
import { MiniUptimeBar } from '../snapshots/shared'
import { uptimeHistory } from '../../data'
import { SectionIntro } from './section-intro'
import { cn } from '@/lib/utils'

/** Small illustrative visuals for the wide tiles. All static, all tokens. */
function Visual({ kind }: { kind: NonNullable<Feature['visual']> }) {
  switch (kind) {
    case 'assertion':
      return (
        <pre className="overflow-hidden rounded-lg border border-border bg-surface-2 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          <span className="text-subtle-foreground">POST</span> https://api.acme.dev/health{'\n'}
          <span className="text-subtle-foreground">expect</span>  200, 204{'\n'}
          <span className="text-subtle-foreground">assert</span>  json_path <span className="text-foreground">status</span> = <span className="text-up">"ok"</span>{'\n'}
          <span className="text-subtle-foreground">every</span>   30s · timeout 10s
        </pre>
      )
    case 'pipeline':
      return (
        <div className="space-y-1.5 rounded-lg border border-border bg-surface-2 p-3">
          {[
            ['DNS', 11, 'var(--chart-dns)'],
            ['TCP', 23, 'var(--chart-tcp)'],
            ['TLS', 58, 'var(--chart-tls)'],
            ['TTFB', 184, 'var(--chart-ttfb)'],
          ].map(([label, ms, color]) => (
            <div key={String(label)} className="flex items-center gap-2 text-[11px]">
              <span className="w-9 font-mono text-subtle-foreground">{label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(Number(ms) / 200) * 100}%`, background: String(color) }}
                />
              </div>
              <span className="tabular w-12 text-right font-mono text-muted-foreground">{ms} ms</span>
            </div>
          ))}
        </div>
      )
    case 'regions':
      return (
        <div className="rounded-lg border border-border bg-surface-2 p-3">
          <div className="mb-2 flex items-center justify-between text-[11px]">
            <span className="font-medium">By region</span>
            <span className="text-muted-foreground">2 of 3 must agree</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {[
              ['Frankfurt', 'up', 'Reachable'],
              ['Virginia', 'down', 'Unreachable · TCP connection failed'],
              ['Singapore', 'up', 'Reachable'],
            ].map(([name, tone, label]) => (
              <div key={name} className="flex items-center gap-2">
                <StatusDot tone={tone as 'up' | 'down'} />
                <span className="w-20 font-medium">{name}</span>
                <span className="truncate text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-md border border-degraded/30 bg-degraded-soft px-2 py-1.5 text-[10px] text-degraded">
            Below the confirmation threshold — no incident opened.
          </div>
        </div>
      )
    case 'channels':
      return (
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Hash, name: 'Slack', meta: '#ops-alerts' },
            { icon: MessageCircle, name: 'Discord', meta: '#incidents' },
            { icon: Mail, name: 'Email', meta: 'oncall@acme.dev' },
            { icon: Webhook, name: 'Webhook', meta: 'X-RouteRX-Signature' },
          ].map((channel) => (
            <div
              key={channel.name}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-2"
            >
              <channel.icon className="size-3.5 text-brand" />
              <span className="min-w-0">
                <span className="block text-[11px] font-medium">{channel.name}</span>
                <span className="block truncate font-mono text-[9px] text-muted-foreground">
                  {channel.meta}
                </span>
              </span>
            </div>
          ))}
        </div>
      )
    case 'statuspage':
      return (
        <div className="space-y-2 rounded-lg border border-border bg-surface-2 p-3">
          {[
            ['API', 'up', uptimeHistory(3)],
            ['Dashboard', 'up', uptimeHistory(9, [51])],
          ].map(([name, tone, history]) => (
            <div key={String(name)} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 font-medium">
                  <StatusDot tone={tone as 'up'} />
                  {String(name)}
                </span>
                <span className="tabular text-muted-foreground">99.98%</span>
              </div>
              <MiniUptimeBar history={history as Array<number | null>} />
            </div>
          ))}
        </div>
      )
    case 'roles':
      return (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface-2">
          {[
            ['sam@acme.dev', 'owner', 'up'],
            ['priya@acme.dev', 'admin', 'brand'],
            ['oncall@acme.dev', 'member', 'neutral'],
          ].map(([email, role, tone]) => (
            <div key={email} className="flex items-center justify-between px-3 py-2 text-[11px]">
              <span className="font-mono text-muted-foreground">{email}</span>
              <Badge variant={tone as 'up' | 'brand' | 'neutral'} size="sm">
                {role}
              </Badge>
            </div>
          ))}
        </div>
      )
  }
}

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-border bg-surface-2/40">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionIntro
          eyebrow="Everything in the box"
          title="Built for the whole life of an outage."
          description="From the first failed check to the post on your status page. Nothing here is a roadmap item — every feature below is in the product today."
        />

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <motion.li
              key={feature.title}
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className={cn(
                'card card-hover flex flex-col p-6',
                feature.visual && 'sm:col-span-2 lg:col-span-1'
              )}
            >
              <span className="mb-4 flex size-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-brand">
                <feature.icon className="size-4" />
              </span>
              <h3 className="text-[15px] font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
              {feature.visual && (
                <div className="mt-5">
                  <Visual kind={feature.visual} />
                </div>
              )}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
