import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAllIncidents } from '@/hooks/monitor.queries'
import { IncidentList } from '@/features/monitor/components/incident-list'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/incidents')({
  component: IncidentsPage,
})

function IncidentsPage() {
  const [openOnly, setOpenOnly] = useState(false)

  // One request for the whole workspace. This page used to fetch every
  // monitor and then issue a request per monitor, discarding the ones with
  // no incidents.
  const { data, isLoading, isError } = useAllIncidents(openOnly)

  return (
    <div className="animate-in fade-in space-y-8 p-8 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Incidents
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Every outage across this workspace, newest first.
          </p>
        </div>

        <div className="flex shrink-0 rounded-lg border border-neutral-200 p-1 dark:border-neutral-800">
          {[
            { label: 'All', value: false },
            { label: 'Open only', value: true },
          ].map((option) => (
            <button
              key={option.label}
              onClick={() => setOpenOnly(option.value)}
              className={cn(
                'rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors',
                openOnly === option.value
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800/20 dark:bg-red-900/10 dark:text-red-400">
          Failed to load incidents. Please check your connection.
        </div>
      ) : isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
          <div className="h-32 border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
        </div>
      ) : (
        <>
          <IncidentList
            incidents={data?.incidents ?? []}
            showMonitor
            emptyTitle={openOnly ? 'Nothing is down' : 'No incidents recorded'}
            emptyHint={
              openOnly
                ? 'Every monitor in this workspace is currently healthy.'
                : 'Incidents appear here once a monitor fails enough checks to be confirmed down.'
            }
          />

          {!isLoading && (data?.incidents.length ?? 0) === 0 && !openOnly && (
            <p className="text-center text-sm text-neutral-500">
              <Link to="/dashboard" className="font-medium underline">
                Go to the dashboard
              </Link>{' '}
              to add a monitor.
            </p>
          )}
        </>
      )}
    </div>
  )
}
