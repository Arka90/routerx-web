import { useState } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'
import { useRegions } from '@/hooks/status.queries'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CheckboxField } from '@/components/ui/checkbox'
import { Field, FormError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
      <Field id="url" label="Endpoint URL">
        <Input
          id="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/health"
          className="font-mono text-[13px]"
          autoComplete="off"
          spellCheck={false}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Name" optional>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Checkout API"
          />
        </Field>

        <Field id="interval" label="Check interval">
          <Select
            id="interval"
            value={interval}
            onChange={(event) => setInterval(event.target.value)}
          >
            {INTERVALS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((value) => !value)}
        aria-expanded={showAdvanced}
        className="flex items-center gap-1.5 rounded-md text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown
          className={cn('size-3.5 transition-transform duration-200', showAdvanced && 'rotate-180')}
          aria-hidden
        />
        Request and assertions
      </button>

      {showAdvanced && (
        <div className="space-y-5 rounded-lg border border-border bg-surface-2/60 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="method" label="Method">
              <Select
                id="method"
                value={method}
                onChange={(event) => setMethod(event.target.value as HttpMethod)}
                className="font-mono text-[13px]"
              >
                {METHODS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>

            <Field id="timeout" label="Timeout (ms)">
              <Input
                id="timeout"
                type="number"
                min={1000}
                max={60000}
                step={500}
                value={timeout}
                onChange={(event) => setTimeoutMs(event.target.value)}
                className="tabular"
              />
            </Field>
          </div>

          <Field
            id="codes"
            label="Expected status codes"
            hint="Leave empty to accept any 2xx or 3xx. A 404 counts as down unless you list it here."
          >
            <Input
              id="codes"
              value={expectedCodes}
              onChange={(event) => setExpectedCodes(event.target.value)}
              placeholder="200, 204"
              className="font-mono text-[13px]"
            />
          </Field>

          <Field id="assertion" label="Body assertion" hint={assertion.hint}>
            <Select
              id="assertion"
              value={assertionType}
              onChange={(event) => setAssertionType(event.target.value as AssertionType)}
            >
              {ASSERTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            {assertionType !== 'none' && (
              <Input
                value={assertionValue}
                onChange={(event) => setAssertionValue(event.target.value)}
                placeholder={assertionType === 'json_path' ? 'status=ok' : 'healthy'}
                aria-label="Assertion value"
                className="font-mono text-[13px]"
              />
            )}
          </Field>

          <div className="space-y-2">
            <Label asChild>
              <span>Request headers</span>
            </Label>

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
                  aria-label={`Header ${index + 1} name`}
                  className="flex-1 font-mono text-[13px]"
                />
                <Input
                  value={row.value}
                  onChange={(event) => {
                    const next = [...headers]
                    next[index] = { ...row, value: event.target.value }
                    setHeaders(next)
                  }}
                  placeholder="Bearer …"
                  aria-label={`Header ${index + 1} value`}
                  className="flex-1 font-mono text-[13px]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove header ${row.key || index + 1}`}
                  onClick={() => setHeaders(headers.filter((_, i) => i !== index))}
                  className="h-9 hover:text-down"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setHeaders([...headers, { key: '', value: '' }])}
              className="-ml-2"
            >
              <Plus className="size-3.5" />
              Add header
            </Button>
          </div>

          {methodTakesBody && (
            <Field id="body" label="Request body">
              <Textarea
                id="body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={4}
                placeholder='{"ping": true}'
                className="font-mono text-[13px]"
                spellCheck={false}
              />
            </Field>
          )}

          {availableRegions.length > 1 && (
            <div className="space-y-2">
              <Label asChild>
                <span>Check from</span>
              </Label>

              <div className="flex flex-wrap gap-2" role="group" aria-label="Regions">
                {availableRegions.map((region) => {
                  const selected = regions.includes(region.code)

                  return (
                    <button
                      key={region.code}
                      type="button"
                      aria-pressed={selected}
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
                          ? 'border-brand bg-brand-soft text-brand'
                          : 'border-border text-muted-foreground hover:bg-accent'
                      )}
                    >
                      {region.name}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {regions.length === 0
                  ? 'Every region, including any added later.'
                  : `${regions.length} of ${availableRegions.length} regions. Set how many must agree before alerting in the Alerts tab.`}
              </p>
            </div>
          )}

          <CheckboxField
            id="follow_redirects"
            label="Follow redirects"
            checked={followRedirects}
            onCheckedChange={(checked) => setFollowRedirects(checked === true)}
          />

          {initial && (
            <CheckboxField
              id="paused"
              label="Pause this monitor"
              hint="No checks run and no alerts fire until it is resumed."
              checked={paused}
              onCheckedChange={(checked) => setPaused(checked === true)}
            />
          )}
        </div>
      )}

      <FormError>{error}</FormError>

      <Button type="submit" variant="primary" loading={pending} className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}
