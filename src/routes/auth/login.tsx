import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth/login-form'
import { useAuthStore } from '@/stores/authStore'

export const Route = createFileRoute('/auth/login')({
  beforeLoad: () => {
    const { sessionToken } = useAuthStore.getState().auth;
    if (sessionToken) {
      throw redirect({
        to: '/',
      });
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center relative bg-white dark:bg-black font-sans selection:bg-neutral-200 selection:text-black dark:selection:bg-neutral-800 dark:selection:text-white">
      {/* Vercel-style subtle background texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Glow behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-neutral-100 dark:bg-neutral-900 rounded-full blur-[100px] -z-10 opacity-50 dark:opacity-20"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md px-4">
        <LoginForm />
        
        {/* Minimal Footer */}
        <div className="mt-8 text-center text-[13px] text-neutral-500 font-medium">
          <p>
            Secure access to <span className="text-neutral-900 dark:text-neutral-100 font-semibold tracking-tight">RouteRX</span> Platform
          </p>
        </div>
      </div>
    </div>
  )
}
