import { Github, Server, ShieldCheck, Terminal } from 'lucide-react'
import { SectionIntro } from './section-intro'

const SNIPPET = `git clone https://github.com/Arka90/routerx-api.git
cd routerx-api && cp .env.example .env
docker compose up -d postgres redis
npm install && npm run dev      # API, migrations applied
npm run worker                  # a probe region`

export function SelfHost() {
  return (
    <section id="self-host" className="scroll-mt-20 border-t border-border bg-surface-2/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionIntro
            eyebrow="Open source"
            title="Run it on your own infrastructure."
            description="Node, Postgres and Redis. One process serves the API; every worker you start becomes a probe region. There is no phone-home and no external dependency for a check to run."
          />

          <ul className="mt-8 space-y-4">
            {[
              {
                icon: Server,
                title: 'One worker per region',
                body: 'Set REGION on a worker and it registers itself. Monitors pick which regions check them.',
              },
              {
                icon: ShieldCheck,
                title: 'Safe by default',
                body: 'Probes and webhooks refuse private, loopback and cloud-metadata addresses unless you opt in.',
              },
              {
                icon: Terminal,
                title: 'Tested without a database',
                body: 'The suite runs against an in-process Postgres, so CI needs nothing but Node.',
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-brand">
                  <item.icon className="size-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{item.body}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-2.5">
            <span className="font-mono text-[11px] text-muted-foreground">terminal</span>
            <a
              href="https://github.com/Arka90/routerx-api"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
            >
              <Github className="size-3.5" />
              routerx-api
            </a>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-foreground">
            {SNIPPET.split('\n').map((line, index) => (
              <div key={index} className="flex gap-3">
                <span className="select-none text-subtle-foreground">$</span>
                <span>
                  {line.includes('#') ? (
                    <>
                      {line.slice(0, line.indexOf('#'))}
                      <span className="text-subtle-foreground">{line.slice(line.indexOf('#'))}</span>
                    </>
                  ) : (
                    line
                  )}
                </span>
              </div>
            ))}
          </pre>
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border px-5 py-3 text-[12px] text-muted-foreground">
            <a className="link" href="https://github.com/Arka90/routerx-api#readme" target="_blank" rel="noreferrer">
              API &amp; workers
            </a>
            <a className="link" href="https://github.com/Arka90/routerx-web" target="_blank" rel="noreferrer">
              Web app
            </a>
            <a className="link" href="https://github.com/Arka90/routerx-api/blob/main/docs/MULTI-REGION.md" target="_blank" rel="noreferrer">
              Multi-region guide
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
