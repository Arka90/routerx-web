import * as React from "react"
import { cn } from "@/lib/utils"

interface PremiumFieldProps extends React.ComponentProps<"input"> {
  label: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const PremiumField = React.forwardRef<HTMLInputElement, PremiumFieldProps>(
  ({ label, helperText, icon, className, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="group space-y-2.5 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 px-1">
          {label}
        </label>
        
        <div className={cn(
          "relative flex items-center transition-all duration-300",
          "rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-black/50 backdrop-blur-md",
          "hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-white dark:hover:bg-[#0A0A0A]",
          isFocused ? "ring-2 ring-neutral-900/5 dark:ring-white/5 border-neutral-900 dark:border-white shadow-xl translate-y-[-1px]" : "shadow-sm"
        )}>
          {icon && (
            <div className="pl-4 text-neutral-400 dark:text-neutral-500">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "flex h-14 w-full bg-transparent px-4 py-4 text-sm outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600",
              "text-neutral-900 dark:text-neutral-100",
              type === "datetime-local" && "[color-scheme:light] dark:[color-scheme:dark] cursor-pointer",
              className
            )}
            {...props}
          />
          
          {/* Subtle Glow Effect */}
          <div className={cn(
            "absolute inset-0 rounded-xl transition-opacity duration-500 pointer-events-none",
            "bg-gradient-to-tr from-neutral-500/5 via-transparent to-neutral-500/5 dark:from-white/5 dark:to-white/5",
            isFocused ? "opacity-100" : "opacity-0"
          )} />
        </div>
        
        {helperText && (
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 px-1 leading-relaxed">
            {helperText}
          </p>
        )}
      </div>
    );
  }
)
PremiumField.displayName = "PremiumField"

export { PremiumField }
