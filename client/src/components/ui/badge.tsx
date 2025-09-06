import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80",
        destructive:
          "border-transparent bg-danger-bg text-danger-text hover:bg-danger-600/80",
        success:
          "border-transparent bg-success-bg text-success-text hover:bg-success-600/80",
        warning:
          "border-transparent bg-warning-bg text-warning-text hover:bg-warning-600/80",
        outline: "border-border-default text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
