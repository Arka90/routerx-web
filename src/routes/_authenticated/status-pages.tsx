import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/status-pages')({
  component: StatusPagesPage,
})

function StatusPagesPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Status Pages
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Create and manage public status pages for your monitors.
        </p>
      </div>
      
      <div className="flex h-64 items-center justify-center rounded-none border border-neutral-200 border-dashed bg-neutral-50 dark:border-neutral-800 dark:bg-black">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">You don't have any status pages yet.</p>
      </div>
    </div>
  )
}
