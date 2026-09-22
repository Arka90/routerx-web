import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { PIPELINE, ROOT_CAUSES } from '../../data'
import { Badge } from '@/components/ui/badge'
import { SectionIntro } from './section-intro'

const LAYER_TONE: Record<string, 'brand' | 'degraded' | 'unknown' | 'down' | 'maintenance' | 'neutral'> = {
  DNS: 'neutral',
  TCP: 'degraded',
  TLS: 'unknown',
  HTTP: 'brand',
  Latency: 'degraded',
  Body: 'maintenance',
  Safety: 'down',
}

export function HowItWorks() {
  const total = PIPELINE.reduce((sum, stage) => sum + stage.ms, 0)

  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionIntro
          eyebrow="How a check works"
          title="Every check is a full network trace."
          description="A worker walks the same path a browser does and times each hop. When something breaks, the failing layer is the answer — not a red dot."
        />

        <motion.ol
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="mt-14 grid gap-3 md:grid-cols-5"
        >
          {PIPELINE.map((stage, index) => (
            <motion.li
              key={stage.stage}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              className="card relative p-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand">
                  {String(index + 1).padStart(2, '0')} · {stage.stage}
                </span>
                {index < PIPELINE.length - 1 && (
                  <ArrowRight className="hidden size-3.5 text-subtle-foreground md:block" />
                )}
              </div>
              <div className="mt-3 text-base font-semibold tracking-tight">{stage.label}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{stage.detail}</div>
              <div className="tabular mt-4 flex items-baseline gap-1 font-mono">
                {stage.stage === 'Assert' ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-up">
                    <Check className="size-3.5" /> passed
                  </span>
                ) : (
                  <>
                    <span className="text-2xl font-semibold">{stage.ms}</span>
                    <span className="text-xs text-subtle-foreground">ms</span>
                  </>
                )}
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.max(6, (stage.ms / total) * 100)}%` }}
                />
              </div>
            </motion.li>
          ))}
        </motion.ol>

        <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Failures get a name.</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              A binary up/down hides the thing you need at 3am. RouteRX's classifier looks at
              where the trace stopped and what came back, then records one of ten causes on the
              incident — with the raw error underneath it.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Incidents open only after the failures you configure in a row, and only once
              enough regions agree. A blip on one route is shown on the monitor, not paged to
              the team.
            </p>
          </div>

          <div className="card overflow-hidden">
            <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)_auto] gap-3 border-b border-border bg-surface-2 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
              <span>Root cause</span>
              <span>Meaning</span>
              <span>Layer</span>
            </div>
            <ul className="divide-y divide-border">
              {ROOT_CAUSES.map((cause) => (
                <li
                  key={cause.code}
                  className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)_auto] items-center gap-3 px-4 py-2.5 text-[13px]"
                >
                  <code className="truncate font-mono text-[12px] text-foreground">{cause.code}</code>
                  <span className="text-muted-foreground">{cause.meaning}</span>
                  <Badge variant={LAYER_TONE[cause.layer]} size="sm">
                    {cause.layer}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
