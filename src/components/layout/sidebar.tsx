import { Link, useLocation } from '@tanstack/react-router'
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CreditCard,
  Globe,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { features } from '@/lib/features'
import { useLogout } from '@/hooks/use-auth'
import { useAuthStore } from '@/stores/authStore'
import { useAllIncidents } from '@/hooks/monitor.queries'
import { WorkspaceSwitcher } from '@/features/org/components/workspace-switcher'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

export function Sidebar() {
  const pathname = useLocation().pathname
  const { logout } = useLogout()
  const user = useAuthStore((state) => state.auth.user)
  const email = user?.email ?? useAuthStore.getState().auth.email

  // A live count of open incidents on the nav means nobody has to open the
  // page to learn something is down.
  const { data: openIncidents } = useAllIncidents(true)
  const openCount = openIncidents?.incidents.length ?? 0

  const groups: NavGroup[] = [
    {
      label: 'Monitoring',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Incidents', href: '/incidents', icon: AlertTriangle, badge: openCount },
      ],
    },
    {
      label: 'Configure',
      items: [
        { name: 'Alert channels', href: '/channels', icon: Bell },
        { name: 'Status pages', href: '/status-pages', icon: Globe },
        { name: 'Team', href: '/team', icon: Users },
      ],
    },
    {
      label: 'Account',
      items: [
        ...(features.billing
          ? [{ name: 'Plan & usage', href: '/billing', icon: CreditCard }]
          : []),
        { name: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ]

  const initials = (user?.name ?? email ?? '?').trim().charAt(0).toUpperCase()

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="flex h-14 shrink-0 items-center px-4">
        <Link to="/dashboard" className="rounded-md focus-visible:ring-2 focus-visible:ring-brand/40">
          <Logo />
        </Link>
      </div>

      <div className="px-3 pb-2">
        <WorkspaceSwitcher />
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3" aria-label="Primary">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="eyebrow mb-1.5 px-2.5">{group.label}</div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`) ||
                  (item.href === '/dashboard' && pathname.startsWith('/monitor/')) ||
                  (item.href === '/status-pages' && pathname.startsWith('/status-page/'))

                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'group relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors',
                        isActive
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground'
                      )}
                    >
                      {isActive && (
                        <span className="absolute top-2 bottom-2 -left-3 w-0.5 rounded-r bg-brand" />
                      )}
                      <item.icon
                        className={cn(
                          'size-4 shrink-0 transition-colors',
                          isActive ? 'text-brand' : 'text-subtle-foreground group-hover:text-foreground'
                        )}
                        aria-hidden
                      />
                      <span className="flex-1 truncate">{item.name}</span>
                      {item.badge ? (
                        <span className="tabular flex h-5 min-w-5 items-center justify-center rounded-md bg-down-soft px-1.5 text-[11px] font-semibold text-down">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        <div>
          <div className="eyebrow mb-1.5 px-2.5">Resources</div>
          <a
            href="https://github.com/Arka90/routerx-api#readme"
            target="_blank"
            rel="noreferrer"
            className="group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground"
          >
            <BookOpen className="size-4 text-subtle-foreground group-hover:text-foreground" />
            Docs &amp; self-hosting
          </a>
        </div>
      </nav>

      <div className="space-y-3 border-t border-border p-3">
        <ThemeToggle className="w-full" />

        <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-foreground">
              {user?.name ?? 'Signed in'}
            </p>
            <p className="truncate text-[11px] text-muted-foreground" title={email ?? undefined}>
              {email}
            </p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            title="Sign out"
            aria-label="Sign out"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-subtle-foreground transition-colors hover:bg-down-soft hover:text-down"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
