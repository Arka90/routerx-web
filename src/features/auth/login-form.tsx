import { useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useRequestOtp, useVerifyOtp } from '@/hooks/use-auth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { LogoMark } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

const emailSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address.' }),
})

/**
 * Must match the server's OTP length. The API issues six digits now — four
 * left only 9,000 possible codes, which is a guessable number.
 */
const OTP_LENGTH = 6

const otpSchema = z.object({
  otp: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), {
    message: `Enter the ${OTP_LENGTH}-digit code from your email.`,
  }),
})

export function LoginForm() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const navigate = useNavigate()

  const requestOtpMutation = useRequestOtp()
  const verifyOtpMutation = useVerifyOtp()

  const storedEmail = useAuthStore((state) => state.auth.email)

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: storedEmail || '' },
  })

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })
  const currentOtp = otpForm.watch('otp') || ''

  // One ref list rather than a fixed set of useRef calls, so the number of
  // boxes follows OTP_LENGTH.
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  const setOtpValue = (value: string) => {
    otpForm.setValue('otp', value, { shouldValidate: false })
  }

  /** Let people paste the whole code instead of retyping six digits. */
  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return

    event.preventDefault()

    const next = pasted.slice(0, OTP_LENGTH)
    setOtpValue(next)
    otpRefs.current[Math.min(next.length, OTP_LENGTH - 1)]?.focus()
  }

  const onEmailSubmit = (data: z.infer<typeof emailSchema>) => {
    requestOtpMutation.mutate(data, {
      onSuccess: () => {
        setStep('otp')
      },
    })
  }

  const onOtpSubmit = () => {
    if (!storedEmail) {
      toast.error('No email found. Go back and enter your email.')
      return
    }
    if (currentOtp.length < OTP_LENGTH) {
      toast.error(`Enter all ${OTP_LENGTH} digits of your code.`)
      return
    }
    verifyOtpMutation.mutate(
      { email: storedEmail, otp: currentOtp },
      {
        onSuccess: () => {
          toast.success('Signed in.')
          navigate({ to: '/dashboard', replace: true })
        },
        // The hook already surfaces the server's message (wrong code, expired,
        // rate limited), so there is nothing to add here.
      }
    )
  }

  const otpInvalid = otpForm.getFieldState('otp').invalid

  return (
    <div className="card animate-rise p-6 sm:p-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <LogoMark
          className="mb-4 size-11 text-foreground"
          style={{ '--logo-ink': 'var(--background)', '--logo-accent': 'var(--brand)' } as React.CSSProperties}
        />
        <h1 className="text-xl font-semibold tracking-tight">
          {step === 'email' ? 'Sign in to RouteRX' : 'Check your email'}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {step === 'email' ? (
            'No password. We email you a one-time code.'
          ) : (
            <>
              We sent a {OTP_LENGTH}-digit code to{' '}
              <span className="font-medium text-foreground">{storedEmail}</span>
            </>
          )}
        </p>
      </div>

      {step === 'email' ? (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="gap-2">
                  <FormLabel className="text-[13px]">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle-foreground" />
                      <Input
                        type="email"
                        autoComplete="email"
                        autoFocus
                        placeholder="you@company.com"
                        className="h-10 pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-down" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="primary"
              className="h-10 w-full"
              loading={requestOtpMutation.isPending}
            >
              {requestOtpMutation.isPending ? 'Sending code' : 'Continue with email'}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
            <FormField
              control={otpForm.control}
              name="otp"
              render={() => (
                <FormItem className="items-center gap-3">
                  <FormControl>
                    <div className="flex justify-center gap-2">
                      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                        <input
                          key={i}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                          maxLength={1}
                          value={currentOtp[i] || ''}
                          ref={(element) => {
                            otpRefs.current[i] = element
                          }}
                          onPaste={handleOtpPaste}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '')
                            const otpArr = Array.from(
                              { length: OTP_LENGTH },
                              (_, idx) => currentOtp[idx] ?? ''
                            )
                            otpArr[i] = val
                            setOtpValue(otpArr.join(''))

                            if (val && i < OTP_LENGTH - 1) {
                              otpRefs.current[i + 1]?.focus()
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !currentOtp[i] && i > 0) {
                              otpRefs.current[i - 1]?.focus()
                            }
                          }}
                          autoFocus={i === 0}
                          className={cn(
                            'tabular h-12 w-10 rounded-lg border border-input bg-card text-center font-mono text-lg font-medium text-foreground shadow-sm sm:h-14 sm:w-12',
                            'transition-[border-color,box-shadow] focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
                            currentOtp[i] && 'border-border-strong',
                            otpInvalid && 'border-down'
                          )}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="text-center text-xs text-down" />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Button
                type="submit"
                variant="primary"
                className="h-10 w-full"
                loading={verifyOtpMutation.isPending}
                disabled={currentOtp.length < OTP_LENGTH}
              >
                {verifyOtpMutation.isPending ? 'Verifying' : 'Sign in'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full"
                onClick={() => setStep('email')}
                disabled={verifyOtpMutation.isPending}
              >
                <ArrowLeft />
                Use a different email
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
