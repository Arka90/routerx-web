import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { sessionToken } = useAuthStore.getState().auth
    if (!sessionToken) {
      throw redirect({
        to: '/auth/login',
      })
    }
  },
  component: AuthenticatedLayout,
})

import { Sidebar } from "@/components/layout/sidebar"

function AuthenticatedLayout() {
  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-black font-sans selection:bg-neutral-200 selection:text-black dark:selection:bg-neutral-800 dark:selection:text-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
