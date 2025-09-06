import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-normal ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-focus-offset disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 btn-base",
  {
    variants: {
      variant: {
        // Primary - Brand colors for main actions
        primary: "bg-brand-600 text-text-inverse hover:bg-brand-700 active:bg-brand-800 elevation-sm hover:elevation-md active:elevation-xs",
        
        // Secondary - Neutral colors for secondary actions
        secondary: "bg-surface-secondary border border-border-default text-text-primary hover:bg-surface-tertiary hover:border-border-strong active:bg-neutral-200",
        
        // Success - Green colors for positive actions
        success: "bg-success-600 text-text-inverse hover:bg-success-700 active:bg-success-800 elevation-sm hover:elevation-md active:elevation-xs",
        
        // Destructive - Red colors for dangerous actions
        destructive: "bg-danger-600 text-text-inverse hover:bg-danger-700 active:bg-danger-800 elevation-sm hover:elevation-md active:elevation-xs",
        
        // Outline - Bordered transparent background
        outline: "border border-border-default bg-transparent text-text-primary hover:bg-surface-secondary hover:border-border-strong active:bg-surface-tertiary",
        
        // Ghost - No background, minimal styling
        ghost: "bg-transparent text-text-primary hover:bg-surface-secondary active:bg-surface-tertiary",
      },
      size: {
        // 5 sizes as per acceptance criteria
        xs: "h-8 px-3 py-1 text-xs rounded-md [&_svg]:size-3",
        sm: "h-9 px-4 py-2 text-sm rounded-md [&_svg]:size-4",
        md: "h-10 px-5 py-2.5 text-sm rounded-lg [&_svg]:size-4",
        lg: "h-12 px-6 py-3 text-base rounded-lg [&_svg]:size-5",
        xl: "h-14 px-8 py-4 text-lg rounded-xl [&_svg]:size-6",
        icon: "h-10 w-10 rounded-lg [&_svg]:size-4",
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
