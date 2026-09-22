import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Monitor as MonitorIcon } from 'lucide-react'
import { useRevokeOtherSessions, useRevokeSession, useSessions } from '@/hooks/org.queries'
import { useActiveRole, useAuthStore } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
})

/** "Chrome on macOS" from a user-agent string, or the raw string if unsure. */
function describeDevice(userAgent: string | null): string {
  if (!userAgent) return 'Unknown device'

  const browser =
    /Edg\//.test(userAgent) ? 'Edge'
    : /Chrome\//.test(userAgent) ? 'Chrome'
    : /Safari\//.test(userAgent) ? 'Safari'
    : /Firefox\//.test(userAgent) ? 'Firefox'
    : null

  const platform =
    /Mac OS X/.test(userAgent) ? 'macOS'
    : /Windows/.test(userAgent) ? 'Windows'
    : /Android/.test(userAgent) ? 'Android'
    : /iPhone|iPad/.test(userAgent) ? 'iOS'
    : /Linux/.test(userAgent) ? 'Linux'
    : null

  if (browser && platform) return `${browser} on ${platform}`
  if (browser) return browser

  return userAgent.slice(0, 60)
}

function SettingsPage() {
  const { user, email, organizations, activeOrgId } = useAuthStore((state) => state.auth)
  const role = useActiveRole()

  const { data, isLoading } = useSessions()
  const revokeSession = useRevokeSession()
  const revokeOthers = useRevokeOtherSessions()

  const sessions = data?.sessions ?? []
  const activeOrg = organizations.find((org) => org.id === activeOrgId)
  const otherSessions = sessions.filter((session) => !session.current)

  return (
    <div className="animate-in fade-in max-w-4xl space-y-10 p-8 duration-500">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Your account and the devices signed in to it.
        </p>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Profile</h2>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Email address
            </dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {user?.email ?? email ?? 'Unknown'}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Current workspace
            </dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {activeOrg?.name ?? '—'}
              {role && (
                <span className="ml-2 text-[11px] uppercase tracking-wider text-neutral-400">
                  {role}
                </span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Active sessions
            </h2>
            <p className="mt-1 text-[13px] text-neutral-500">
              Signing out of a session takes effect immediately, everywhere.
            </p>
          </div>

          {otherSessions.length > 0 && (
            <button
              onClick={() =>
                revokeOthers.mutate(undefined, {
                  onSuccess: (result) => toast.success(result.message),
                  onError: (error) =>
                    toast.error(getApiErrorMessage(error, 'Could not sign out')),
                })
              }
              disabled={revokeOthers.isPending}
              className="shrink-0 rounded-md border border-neutral-200 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
            >
              Sign out everywhere else
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900" />
        ) : (
          <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <MonitorIcon className="h-4 w-4 shrink-0 text-neutral-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-neutral-900 dark:text-neutral-100">
                      {describeDevice(session.user_agent)}
                      {session.current && (
                        <span className="ml-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-500">
                          this device
                        </span>
                      )}
                    </p>
                    <p className="text-[12px] text-neutral-500">
                      {session.ip ?? 'Unknown IP'} ·{' '}
                      {session.last_used_at
                        ? `last used ${new Date(session.last_used_at).toLocaleString()}`
                        : `signed in ${new Date(session.created_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                {!session.current && (
                  <button
                    onClick={() =>
                      revokeSession.mutate(session.id, {
                        onSuccess: () => toast.success('Session signed out'),
                        onError: (error) =>
                          toast.error(getApiErrorMessage(error, 'Could not sign out')),
                      })
                    }
                    className="shrink-0 rounded-md border border-neutral-200 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                  >
                    Sign out
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
