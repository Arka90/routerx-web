import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const userEmail = useAuthStore((state) => state.auth.email);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-none bg-white dark:bg-black p-6">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Profile</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Email Address</label>
              <div className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {userEmail || "No email available"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
