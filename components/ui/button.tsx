import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "button", // Use your CSS class as the base foundation
  {
    variants: {
      variant: {
        default: "", // Empty - uses .button base styles
        destructive: "button-destructive",
        outline: "button-outline", 
        secondary: "button-secondary",
        ghost: "button-ghost",
        link: "button-link",
        dark: "button-dark", // Dark variant for light backgrounds
        light: "button-light", // Light variant for dark backgrounds
        clean: "button-clean", // Clean variant
        cta: "button-cta", // CTA variant for homepage buttons
      },
      size: {
        default: "button-default",
        sm: "button-sm", 
        lg: "button-lg",
        icon: "button-icon",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  text?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, text = "Sign up for 7 free days", children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)} // className comes last for overrides
        ref={ref}
        {...props}
      >
        {children || text}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
