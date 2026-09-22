import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Monitor as MonitorIcon, Smartphone } from 'lucide-react'
import { useRevokeOtherSessions, useRevokeSession, useSessions } from '@/hooks/org.queries'
import { useActiveRole, useAuthStore } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/errors'
import { formatDate, formatDateTime, formatRelative } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Page, PageHeader, SectionHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from '@/components/ui/theme-toggle'

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
    // iOS user agents also say "like Mac OS X", so they must be tested first.
    /iPhone|iPad/.test(userAgent) ? 'iOS'
    : /Mac OS X/.test(userAgent) ? 'macOS'
    : /Windows/.test(userAgent) ? 'Windows'
    : /Android/.test(userAgent) ? 'Android'
    : /Linux/.test(userAgent) ? 'Linux'
    : null

  if (browser && platform) return `${browser} on ${platform}`
  if (browser) return browser

  return userAgent.slice(0, 60)
}

/** Phones and tablets get a phone glyph; everything else a screen. */
function isHandheld(userAgent: string | null): boolean {
  return Boolean(userAgent && /Android|iPhone|iPad/.test(userAgent))
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
    <Page width="narrow">
      <PageHeader
        title="Settings"
        description="Your account and the devices signed in to it."
      />

      <section className="card space-y-4 p-5">
        <SectionHeader title="Profile" />

        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="eyebrow">Email</dt>
            <dd className="mt-1 truncate text-sm font-medium text-foreground">
              {user?.email ?? email ?? 'Unknown'}
            </dd>
          </div>

          <div>
            <dt className="eyebrow">Name</dt>
            <dd className="mt-1 truncate text-sm font-medium text-foreground">
              {user?.name ?? '—'}
            </dd>
          </div>

          <div>
            <dt className="eyebrow">Current workspace</dt>
            <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="truncate">{activeOrg?.name ?? '—'}</span>
              {role && (
                <Badge variant="brand" size="sm">
                  {role}
                </Badge>
              )}
            </dd>
          </div>

          <div>
            <dt className="eyebrow">Workspaces</dt>
            <dd className="tabular mt-1 text-sm font-medium text-foreground">
              {organizations.length}
            </dd>
          </div>
        </dl>
      </section>

      <section className="card p-5">
        <SectionHeader
          title="Appearance"
          description="Theme follows your system unless you pick one."
          actions={<ThemeToggle />}
        />
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Active sessions"
          description="Signing out of a session takes effect immediately, everywhere."
          actions={
            otherSessions.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                loading={revokeOthers.isPending}
                onClick={() =>
                  revokeOthers.mutate(undefined, {
                    onSuccess: (result) => toast.success(result.message),
                    onError: (error) =>
                      toast.error(getApiErrorMessage(error, 'Could not sign out')),
                  })
                }
              >
                Sign out everywhere else
              </Button>
            ) : undefined
          }
        />

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {sessions.map((session) => {
              const DeviceIcon = isHandheld(session.user_agent) ? Smartphone : MonitorIcon
              const revoking =
                revokeSession.isPending && revokeSession.variables === session.id

              return (
                <div key={session.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted-foreground">
                    <DeviceIcon className="size-4" aria-hidden />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {describeDevice(session.user_agent)}
                      </span>
                      {session.current && (
                        <Badge variant="up" size="sm">
                          this device
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      <span className="font-mono">{session.ip ?? 'Unknown IP'}</span>
                      {' · '}
                      {session.last_used_at ? (
                        <span title={formatDateTime(session.last_used_at)}>
                          last used {formatRelative(session.last_used_at)}
                        </span>
                      ) : (
                        <span>signed in {formatDate(session.created_at)}</span>
                      )}
                    </p>
                  </div>

                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      loading={revoking}
                      onClick={() =>
                        revokeSession.mutate(session.id, {
                          onSuccess: () => toast.success('Session signed out'),
                          onError: (error) =>
                            toast.error(getApiErrorMessage(error, 'Could not sign out')),
                        })
                      }
                    >
                      Sign out
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </Page>
  )
}
