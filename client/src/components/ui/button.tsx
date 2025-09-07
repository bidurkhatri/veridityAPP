import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-normal ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-focus-offset disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 btn-base",
  {
    variants: {
      variant: {
        // Primary - Brief spec: emerald-600 with hover emerald-hover
        primary: "bg-brand-emerald-600 text-text-inverse hover:bg-brand-emerald-hover active:bg-brand-emerald-hover/90 elevation-sm hover:elevation-md active:elevation-xs",
        
        // Secondary - Neutral with border 
        secondary: "bg-surface-secondary border border-border-default text-text-primary hover:bg-surface-tertiary hover:border-border-strong active:bg-neutral-200",
        
        // Tertiary - Minimal with subtle background
        tertiary: "bg-transparent border border-border-default text-text-primary hover:bg-surface-secondary hover:border-border-strong active:bg-surface-tertiary",
        
        // Destructive - Red for dangerous actions
        destructive: "bg-error-600 text-text-inverse hover:bg-error-700 active:bg-error-700/90 elevation-sm hover:elevation-md active:elevation-xs",
        
        // Quiet - No background, minimal styling
        quiet: "bg-transparent text-text-primary hover:bg-surface-secondary active:bg-surface-tertiary",
      },
      size: {
        // Brief specifications: clear sizes sm/md/lg
        sm: "h-9 px-4 py-2 text-sm rounded-sm [&_svg]:size-4",           /* 10px radius */
        md: "h-10 px-5 py-2.5 text-sm rounded-md [&_svg]:size-4",        /* 14px radius */
        lg: "h-12 px-6 py-3 text-base rounded-lg [&_svg]:size-5",        /* 20px radius */
        icon: "h-10 w-10 rounded-md [&_svg]:size-4",
      },
      loading: {
        true: "cursor-wait opacity-70",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const isDisabled = disabled || loading
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
