import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2, WifiOff } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth-service'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { sessionToken } = useAuthStore.getState().auth
    if (!sessionToken) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { setSession, sessionToken, organizations } = useAuthStore((state) => state.auth)

  /**
   * A page load only restores the token from a cookie — who the user is and
   * which workspaces they belong to live on the server, so fetch them before
   * rendering anything that depends on a role.
   */
  const { isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const data = await authApi.me()
      setSession(sessionToken, data.user, data.organizations)
      return data
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading && organizations.length === 0) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-background">
        <Logo size="lg" />
        <Loader2 className="size-4 animate-spin text-subtle-foreground" />
      </div>
    )
  }

  // A 401 has already redirected via the client interceptor; anything else
  // here means the API is unreachable, which is worth saying out loud.
  if (isError && organizations.length === 0) {
    return (
      <div className="grid-dots flex min-h-screen w-full flex-col items-center justify-center bg-background px-6">
        <div className="card flex w-full max-w-sm flex-col items-center p-8 text-center">
          <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-down-soft text-down">
            <WifiOff className="size-5" />
          </span>
          <h1 className="text-base font-semibold text-foreground">Can't reach the RouteRX API</h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Your session is still valid. Check your connection and reload.
          </p>
          <Button className="mt-6 w-full" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
