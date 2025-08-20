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
        light: "button-light", // Add back the light variant for decorative lines
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
    
    const buttonElement = (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)} // className comes last for overrides
        ref={ref}
        {...props}
      >
        {children || text}
      </Comp>
    )
    
    // If asChild is true, return just the button without wrapper
    if (asChild) {
      return buttonElement
    }
    
    // Determine line colors based on variant
    const isLightVariant = variant === "light"
    const lineBaseColor = isLightVariant ? "border-white" : "border-black"
    const lineHoverColor = "group-hover:border-[#D4A771]"
    
    // Return button with decorative lines
    return (
      <div className="inline-flex flex-col items-center group">
        {buttonElement}
        <div className="mt-1 flex flex-col w-full">
          <div className={`border-b ${lineBaseColor} ${lineHoverColor} transition-colors duration-200`}></div>
          <div className="h-1"></div>
          <div className={`border-b ${lineBaseColor} ${lineHoverColor} transition-colors duration-200`}></div>
        </div>
      </div>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
