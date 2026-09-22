import { useState } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRegions } from '@/hooks/status.queries'
import { cn } from '@/lib/utils'
import type {
  AssertionType,
  CreateMonitorPayload,
  HttpMethod,
  MonitorDetail,
} from '@/types/monitor.types'

const METHODS: HttpMethod[] = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE']

const INTERVALS = [
  { value: 30, label: 'Every 30 seconds' },
  { value: 60, label: 'Every minute' },
  { value: 300, label: 'Every 5 minutes' },
  { value: 900, label: 'Every 15 minutes' },
  { value: 1800, label: 'Every 30 minutes' },
  { value: 3600, label: 'Every hour' },
]

const ASSERTIONS: Array<{ value: AssertionType; label: string; hint: string }> = [
  { value: 'none', label: 'No body check', hint: 'Only the status code decides.' },
  {
    value: 'contains',
    label: 'Body contains',
    hint: 'Catches a page that returns 200 while rendering an error.',
  },
  {
    value: 'not_contains',
    label: 'Body does not contain',
    hint: 'e.g. alert when the word "Exception" appears.',
  },
  {
    value: 'json_path',
    label: 'JSON path equals',
    hint: 'e.g. status=ok, or data.items[0].state=ready',
  },
]

const fieldClass =
  'h-10 rounded-md border-neutral-200 bg-white text-sm shadow-sm transition-all focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black dark:border-neutral-800 dark:bg-[#111] dark:focus-visible:border-white dark:focus-visible:ring-white'

const selectClass =
  'flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black dark:border-neutral-800 dark:bg-[#111] dark:text-neutral-100 dark:focus-visible:ring-white'

const labelClass =
  'text-sm font-medium leading-none text-neutral-900 dark:text-neutral-100'

const hintClass = 'text-[12px] text-neutral-500 dark:text-neutral-400'

export interface MonitorFormValues extends CreateMonitorPayload {
  url: string
}

interface MonitorFormProps {
  initial?: MonitorDetail
  submitLabel: string
  pending: boolean
  onSubmit: (values: MonitorFormValues) => void
  /** Shown as an inline error above the submit button. */
  error?: string | null
}

interface HeaderRow {
  key: string
  value: string
}

function toRows(headers: Record<string, string> | undefined): HeaderRow[] {
  return Object.entries(headers ?? {}).map(([key, value]) => ({ key, value }))
}

export function MonitorForm({
  initial,
  submitLabel,
  pending,
  onSubmit,
  error,
}: MonitorFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [url, setUrl] = useState(initial?.url ?? 'https://')
  const [method, setMethod] = useState<HttpMethod>(initial?.method ?? 'GET')
  const [interval, setInterval] = useState(String(initial?.interval_seconds ?? 60))
  const [timeout, setTimeoutMs] = useState(String(initial?.timeout_ms ?? 10000))
  const [followRedirects, setFollowRedirects] = useState(initial?.follow_redirects ?? true)
  const [expectedCodes, setExpectedCodes] = useState(
    (initial?.expected_status_codes ?? []).join(', ')
  )
  const [assertionType, setAssertionType] = useState<AssertionType>(
    initial?.assertion_type ?? 'none'
  )
  const [assertionValue, setAssertionValue] = useState(initial?.assertion_value ?? '')
  const [headers, setHeaders] = useState<HeaderRow[]>(toRows(initial?.request_headers))
  const [body, setBody] = useState(initial?.request_body ?? '')
  const [paused, setPaused] = useState(initial?.paused ?? false)
  const [regions, setRegions] = useState<string[]>(initial?.regions ?? [])

  const { data: regionData } = useRegions()
  const availableRegions = regionData?.regions ?? []

  // Everything most people never touch stays behind a disclosure, so adding a
  // monitor is still a URL and an interval.
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(
      initial &&
        (initial.method !== 'GET' ||
          initial.assertion_type !== 'none' ||
          initial.expected_status_codes.length > 0 ||
          Object.keys(initial.request_headers ?? {}).length > 0)
    )
  )

  const methodTakesBody = method !== 'GET' && method !== 'HEAD'
  const assertion = ASSERTIONS.find((item) => item.value === assertionType)!

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const parsedCodes = expectedCodes
      .split(',')
      .map((part) => Number(part.trim()))
      .filter((code) => Number.isInteger(code) && code >= 100 && code <= 599)

    const headerObject = headers.reduce<Record<string, string>>((accumulator, row) => {
      if (row.key.trim()) accumulator[row.key.trim()] = row.value
      return accumulator
    }, {})

    onSubmit({
      name: name.trim() || null,
      url: url.trim(),
      method,
      interval_seconds: Number(interval),
      timeout_ms: Number(timeout),
      follow_redirects: followRedirects,
      expected_status_codes: parsedCodes,
      assertion_type: assertionType,
      assertion_value: assertionType === 'none' ? null : assertionValue.trim() || null,
      request_headers: headerObject,
      request_body: methodTakesBody && body.trim() ? body : null,
      regions,
      paused,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="url" className={labelClass}>
          Endpoint URL
        </label>
        <Input
          id="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/health"
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className={labelClass}>
            Name <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Checkout API"
            className={fieldClass}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="interval" className={labelClass}>
            Check interval
          </label>
          <select
            id="interval"
            value={interval}
            onChange={(event) => setInterval(event.target.value)}
            className={selectClass}
          >
            {INTERVALS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((value) => !value)}
        className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', showAdvanced && 'rotate-180')}
        />
        Request and assertions
      </button>

      {showAdvanced && (
        <div className="space-y-5 border-l-2 border-neutral-100 pl-4 dark:border-neutral-800">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="method" className={labelClass}>
                Method
              </label>
              <select
                id="method"
                value={method}
                onChange={(event) => setMethod(event.target.value as HttpMethod)}
                className={selectClass}
              >
                {METHODS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="timeout" className={labelClass}>
                Timeout (ms)
              </label>
              <Input
                id="timeout"
                type="number"
                min={1000}
                max={60000}
                step={500}
                value={timeout}
                onChange={(event) => setTimeoutMs(event.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="codes" className={labelClass}>
              Expected status codes
            </label>
            <Input
              id="codes"
              value={expectedCodes}
              onChange={(event) => setExpectedCodes(event.target.value)}
              placeholder="200, 204"
              className={fieldClass}
            />
            <p className={hintClass}>
              Leave empty to accept any 2xx or 3xx. A 404 counts as down unless you list it
              here.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="assertion" className={labelClass}>
              Body assertion
            </label>
            <select
              id="assertion"
              value={assertionType}
              onChange={(event) => setAssertionType(event.target.value as AssertionType)}
              className={selectClass}
            >
              {ASSERTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className={hintClass}>{assertion.hint}</p>

            {assertionType !== 'none' && (
              <Input
                value={assertionValue}
                onChange={(event) => setAssertionValue(event.target.value)}
                placeholder={assertionType === 'json_path' ? 'status=ok' : 'healthy'}
                className={cn(fieldClass, 'mt-2 font-mono text-[13px]')}
              />
            )}
          </div>

          <div className="space-y-2">
            <span className={labelClass}>Request headers</span>

            {headers.map((row, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={row.key}
                  onChange={(event) => {
                    const next = [...headers]
                    next[index] = { ...row, key: event.target.value }
                    setHeaders(next)
                  }}
                  placeholder="Authorization"
                  className={cn(fieldClass, 'flex-1 font-mono text-[13px]')}
                />
                <Input
                  value={row.value}
                  onChange={(event) => {
                    const next = [...headers]
                    next[index] = { ...row, value: event.target.value }
                    setHeaders(next)
                  }}
                  placeholder="Bearer …"
                  className={cn(fieldClass, 'flex-1 font-mono text-[13px]')}
                />
                <button
                  type="button"
                  aria-label={`Remove header ${row.key || index + 1}`}
                  onClick={() => setHeaders(headers.filter((_, i) => i !== index))}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-400 transition-colors hover:text-red-600 dark:border-neutral-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setHeaders([...headers, { key: '', value: '' }])}
              className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <Plus className="h-3.5 w-3.5" />
              Add header
            </button>
          </div>

          {methodTakesBody && (
            <div className="space-y-2">
              <label htmlFor="body" className={labelClass}>
                Request body
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={4}
                placeholder='{"ping": true}'
                className="w-full rounded-md border border-neutral-200 bg-white p-3 font-mono text-[13px] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black dark:border-neutral-800 dark:bg-[#111] dark:text-neutral-100 dark:focus-visible:ring-white"
              />
            </div>
          )}

          {availableRegions.length > 1 && (
            <div className="space-y-2">
              <span className={labelClass}>Check from</span>

              <div className="flex flex-wrap gap-2">
                {availableRegions.map((region) => {
                  const selected = regions.includes(region.code)

                  return (
                    <button
                      key={region.code}
                      type="button"
                      onClick={() =>
                        setRegions(
                          selected
                            ? regions.filter((code) => code !== region.code)
                            : [...regions, region.code]
                        )
                      }
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors',
                        selected
                          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-black'
                          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900'
                      )}
                    >
                      {region.name}
                    </button>
                  )
                })}
              </div>

              <p className={hintClass}>
                {regions.length === 0
                  ? 'Every region, including any added later.'
                  : `${regions.length} of ${availableRegions.length} regions. Set how many must agree before alerting in the Alerts tab.`}
              </p>
            </div>
          )}

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={followRedirects}
              onChange={(event) => setFollowRedirects(event.target.checked)}
              className="h-4 w-4 accent-black dark:accent-white"
            />
            <span className="text-[13px] text-neutral-700 dark:text-neutral-300">
              Follow redirects
            </span>
          </label>

          {initial && (
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={paused}
                onChange={(event) => setPaused(event.target.checked)}
                className="h-4 w-4 accent-black dark:accent-white"
              />
              <span className="text-[13px] text-neutral-700 dark:text-neutral-300">
                Pause this monitor
              </span>
            </label>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-md bg-black px-4 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
