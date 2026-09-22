import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth-service'
import { Sidebar } from '@/components/layout/sidebar'
import { Loader2 } from 'lucide-react'

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
      <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-black">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    )
  }

  // A 401 has already redirected via the client interceptor; anything else
  // here means the API is unreachable, which is worth saying out loud.
  if (isError && organizations.length === 0) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-white px-6 text-center dark:bg-black">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Can't reach the RouteRX API
        </p>
        <p className="text-sm text-neutral-500">
          Your session is still valid. Check your connection and reload.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white dark:bg-white dark:text-black"
        >
          Reload
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white font-sans selection:bg-neutral-200 selection:text-black dark:bg-black dark:selection:bg-neutral-800 dark:selection:text-white">
      <Sidebar />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <main className="w-full flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
