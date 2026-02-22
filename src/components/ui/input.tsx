import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-base shadow-sm transition-colors md:text-sm",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-neutral-500",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-neutral-800 dark:focus-visible:ring-neutral-300 dark:placeholder:text-neutral-400 text-neutral-900 dark:text-neutral-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
