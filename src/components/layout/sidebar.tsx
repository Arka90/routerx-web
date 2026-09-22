import { Link, useLocation } from '@tanstack/react-router'
import {
  AlertTriangle,
  Bell,
  Globe,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLogout } from '@/hooks/use-auth'
import { useAuthStore } from '@/stores/authStore'
import { WorkspaceSwitcher } from '@/features/org/components/workspace-switcher'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'Alerts', href: '/channels', icon: Bell },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Status Pages', href: '/status-pages', icon: Globe },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = useLocation().pathname
  const { logout } = useLogout()
  const email = useAuthStore((state) => state.auth.user?.email ?? state.auth.email)

  return (
    <div className="flex h-screen w-64 shrink-0 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 cursor-default flex-col items-center justify-center bg-black text-xs font-bold uppercase text-white dark:bg-white dark:text-black">
            RX
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            RouteRX
          </span>
        </div>
      </div>

      <WorkspaceSwitcher />

      <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 pb-6">
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center gap-3 border-l-2 px-3 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'border-black bg-neutral-100 text-neutral-900 dark:border-white dark:bg-neutral-900 dark:text-white'
                    : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white'
                )}
              >
                <item.icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors duration-200',
                    isActive
                      ? 'text-black dark:text-white'
                      : 'text-neutral-400 group-hover:text-black dark:group-hover:text-white'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 flex flex-col gap-1">
          {email && (
            <div className="truncate px-3 py-2 text-[11px] text-neutral-400" title={email}>
              {email}
            </div>
          )}
          <button
            onClick={() => logout()}
            className="group flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2 text-sm font-medium text-neutral-600 transition-all duration-200 hover:bg-neutral-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-red-500"
          >
            <LogOut className="h-4 w-4 shrink-0 text-neutral-400 transition-colors group-hover:text-red-600 dark:group-hover:text-red-500" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
