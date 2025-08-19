import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent text-black border border-black font-sans font-normal rounded-none hover:border-[#D4A771] hover:text-[#D4A771] transition-colors duration-200",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        dark: "bg-transparent text-black border border-black font-sans font-normal rounded-none hover:border-[#D4A771] hover:text-[#D4A771] transition-colors duration-200",
        light: "bg-transparent text-white border border-white font-sans font-normal rounded-none hover:border-[#D4A771] hover:!text-[#D4A771] transition-colors duration-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
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
        className={cn(buttonVariants({ variant, size, className }))}
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
