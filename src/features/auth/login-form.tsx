import { useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useRequestOtp, useVerifyOtp } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const emailSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
});

/**
 * Must match the server's OTP length. The API issues six digits now — four
 * left only 9,000 possible codes, which is a guessable number.
 */
const OTP_LENGTH = 6;

const otpSchema = z.object({
  otp: z
    .string()
    .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), {
      message: `Enter the ${OTP_LENGTH}-digit code from your email.`,
    }),
});

export function LoginForm() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const navigate = useNavigate();

  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();

  const storedEmail = useAuthStore((state) => state.auth.email);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: storedEmail || "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });
  const currentOtp = otpForm.watch("otp") || "";

  // One ref list rather than a fixed set of useRef calls, so the number of
  // boxes follows OTP_LENGTH.
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const setOtpValue = (value: string) => {
    otpForm.setValue("otp", value, { shouldValidate: false });
  };

  /** Let people paste the whole code instead of retyping six digits. */
  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    event.preventDefault();

    const next = pasted.slice(0, OTP_LENGTH);
    setOtpValue(next);
    otpRefs.current[Math.min(next.length, OTP_LENGTH - 1)]?.focus();
  };

  const onEmailSubmit = (data: z.infer<typeof emailSchema>) => {
    requestOtpMutation.mutate(data, {
      onSuccess: () => {
        setStep("otp");
      },
    });
  };

  const onOtpSubmit = () => {
    if (!storedEmail) {
      window.alert("No email found. Please go back and enter your email.");
      return;
    }
    if (currentOtp.length < OTP_LENGTH) {
      toast.error(`Enter all ${OTP_LENGTH} digits of your code.`);
      return;
    }
    verifyOtpMutation.mutate(
      { email: storedEmail, otp: currentOtp },
      {
        onSuccess: () => {
          toast.success("Signed in.");
          navigate({ to: "/dashboard", replace: true });
        },
        // The hook already surfaces the server's message (wrong code, expired,
        // rate limited), so there is nothing to add here.
      },
    );
  };

  return (
    <div className="w-full bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col items-center space-y-2 text-center mb-8">
        <div className="h-10 w-10 bg-black dark:bg-white rounded-lg flex items-center justify-center mb-2 shadow-sm">
         <div className="h-6 w-6 bg-black dark:bg-white text-white dark:text-black flex flex-col items-center justify-center font-bold text-xs uppercase cursor-default">
            RX
          </div>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {step === "email" ? "Welcome back" : "Check your email"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {step === "email"
            ? "Enter your email to sign in to your account"
            : `We sent a verification code to ${storedEmail}`}
        </p>
      </div>

      {step === "email" ? (
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
            className="space-y-4"
          >
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      className="h-10 rounded-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111] text-sm transition-all focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:border-black dark:focus-visible:border-white shadow-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-1" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full h-10 rounded-md bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-sm font-medium transition-colors shadow-sm mt-6"
              disabled={requestOtpMutation.isPending}
            >
              {requestOtpMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending code...
                </span>
              ) : (
                "Continue with Email"
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(onOtpSubmit)}
            className="space-y-6"
          >
            <FormField
              control={otpForm.control}
              name="otp"
              render={() => (
                <FormItem className="flex flex-col items-center justify-center space-y-4">
                  <FormControl>
                    {/* PinInput style for OTP with spacing and auto-focus */}
                    <div className="flex h-10 gap-2 sm:gap-3 justify-center">
                      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                        <Input
                          key={i}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                          maxLength={1}
                          value={currentOtp[i] || ""}
                          ref={(element) => {
                            otpRefs.current[i] = element;
                          }}
                          onPaste={handleOtpPaste}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            const otpArr = Array.from(
                              { length: OTP_LENGTH },
                              (_, idx) => currentOtp[idx] ?? "",
                            );
                            otpArr[i] = val;
                            setOtpValue(otpArr.join(""));

                            if (val && i < OTP_LENGTH - 1) {
                              otpRefs.current[i + 1]?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !currentOtp[i] && i > 0) {
                              otpRefs.current[i - 1]?.focus();
                            }
                          }}
                          className={`h-12 w-10 sm:h-14 sm:w-12 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111] text-lg font-medium text-neutral-900 dark:text-neutral-100 ring-0 transition-all shadow-sm text-center ${otpForm.getFieldState("otp").invalid ? "border-red-500" : ""}`}
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs text-center" />
                </FormItem>
              )}
            />
            <div className="flex flex-col space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full h-10 rounded-md bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-sm font-medium transition-colors shadow-sm"
                disabled={verifyOtpMutation.isPending || currentOtp.length < OTP_LENGTH}
              >
                {verifyOtpMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full h-10 rounded-md text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition-colors"
                onClick={() => setStep("email")}
                disabled={verifyOtpMutation.isPending}
              >
                Back to email
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
