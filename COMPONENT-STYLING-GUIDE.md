# Component Styling Guide

## CSS Foundation + Tailwind Override Pattern

This guide explains the hybrid approach we use for component styling that combines CSS classes as a foundation with Tailwind overrides for maximum flexibility.

## Overview

Our components use a **CSS foundation + Tailwind override** pattern that provides:
- ⚡ **Instant styling** - Override styles directly in JSX with Tailwind
- 🎯 **Precise control** - Change exactly what you need without editing components
- 🔄 **Zero refactoring** - Existing components continue working unchanged
- 🎨 **Design system consistency** - Global changes through CSS, local adjustments through Tailwind

### Primary Purpose: Eliminate className Repetition

**The main goal of globals.css classes is to remove repeated className patterns from page.tsx files**, ensuring:
- 🧹 **Clean JSX** - No duplicate `className="px-8 py-6 text-lg"` scattered across pages
- 🎯 **Consistent usage** - All similar elements use the same styling automatically
- 🔧 **Single source of truth** - Change the CSS class once, updates everywhere
- 📝 **Readable code** - Page components focus on content, not styling details

**Example transformation:**
```tsx
// Before: Repeated className in page.tsx
<Button className="px-8 py-6 text-lg">Sign up</Button>
<Button className="px-8 py-6 text-lg">Learn More</Button>
<Button className="px-8 py-6 text-lg">Get Started</Button>

// After: Clean usage with CSS class
<Button variant="cta">Sign up</Button>
<Button variant="cta">Learn More</Button>
<Button variant="cta">Get Started</Button>
```

## Implementation Pattern

### 1. CSS Foundation (globals.css)

Create base CSS classes that define your component's core behavior:

```css
.button {
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* ... other base styles */
  
  /* Default variant */
  background-color: transparent;
  color: black;
  border: 1px solid black;
  
  &:hover {
    border-color: #D4A771;
    color: #D4A771;
  }
  
  /* Size variants */
  &.button-default {
    height: 2.5rem;
    padding: 0.5rem 1rem;
  }
  
  &.button-lg {
    height: 2.75rem;
    padding: 0 2rem;
  }
  
  /* Style variants */
  &.button-light {
    color: white;
    border: 1px solid white;
  }
}
```

### 2. TypeScript Component Structure

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva(
  "your-css-class", // CSS class as foundation
  {
    variants: {
      variant: {
        default: "", // Empty - uses base CSS styles
        destructive: "your-css-class-destructive",
        outline: "your-css-class-outline",
      },
      size: {
        default: "your-css-class-default",
        sm: "your-css-class-sm",
        lg: "your-css-class-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const YourComponent = ({ className, variant, size, ...props }) => {
  return (
    <div
      className={cn(componentVariants({ variant, size }), className)} // className last for overrides
      {...props}
    />
  )
}
```

### 3. Key Implementation Rules

1. **CSS class as base**: Use your CSS class name as the base in `cva()`
2. **Empty default variant**: Let the CSS class handle default styling
3. **className last**: Always put `className` last in `cn()` for proper override precedence
4. **Additive variants**: CSS variant classes should add to, not replace, base styles

## Usage Workflows

### Quick Page-Level Styling (Most Common)

```tsx
// Override styles directly with Tailwind - no component editing needed
<Button className="bg-blue-500 text-white border-blue-600 px-8">
  Custom Button
</Button>

// Subtle adjustments
<Button className="text-lg px-6">
  Larger Button
</Button>

// Responsive overrides
<Button className="px-4 md:px-8 lg:px-12">
  Responsive Button
</Button>
```

### Component-Level Styling (Reusable Patterns)

```tsx
// Create wrapper components for common patterns
const CTAButton = ({ children, ...props }) => (
  <Button 
    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-8" 
    {...props}
  >
    {children}
  </Button>
)

const DangerButton = ({ children, ...props }) => (
  <Button 
    className="bg-red-500 hover:bg-red-600 text-white border-red-500" 
    {...props}
  >
    {children}
  </Button>
)
```

### Global Styling Updates (Design System Changes)

When you need to change base behavior across the entire app:

1. **Edit CSS in `globals.css`** - Modify the base class (e.g., `.button`)
2. **Changes apply everywhere** - All components using that class update instantly
3. **Overrides remain intact** - Page-level Tailwind overrides continue working

## Best Practices

### ✅ Do This

- Use Tailwind classes for page-specific styling needs
- Put `className` last in the `cn()` function call
- Create wrapper components for frequently used style combinations
- Use CSS classes for design system foundations
- Test that your overrides work by inspecting the final className order

### ❌ Avoid This

- Editing the base component file for one-off styling needs
- Putting `className` before the variant classes in `cn()`
- Creating new variants for simple style adjustments
- Duplicating styles between CSS and component variants

## Example Use Cases

### Marketing Landing Page
```tsx
// Hero section button
<Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl px-12 py-4 rounded-full shadow-lg">
  Get Started Today
</Button>

// Secondary CTA
<Button variant="outline" className="border-2 border-purple-500 text-purple-500 hover:bg-purple-50">
  Learn More
</Button>
```

### Dashboard Interface
```tsx
// Compact action button
<Button size="sm" className="bg-green-500 text-white text-xs">
  Save
</Button>

// Danger action
<Button className="bg-red-500 hover:bg-red-600 text-white">
  Delete Item
</Button>
```

### Form Components
```tsx
// Submit button
<Button type="submit" className="w-full bg-blue-600 text-white py-3">
  Submit Form
</Button>

// Cancel button
<Button type="button" variant="ghost" className="text-gray-500">
  Cancel
</Button>
```

## Migration Guide

### Converting Existing Components

1. **Extract common styles** to CSS classes in `globals.css`
2. **Update the component** to use the CSS class as base in `cva()`
3. **Convert variants** to additive CSS classes
4. **Ensure className ordering** puts overrides last
5. **Test existing usage** to ensure no breaking changes

### Example Migration

**Before:**
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center bg-blue-500 text-white...",
  // variants...
)
```

**After:**
```tsx
const buttonVariants = cva(
  "button", // CSS class handles the styling
  // variants now use CSS classes...
)
```

## Troubleshooting

### Overrides Not Working?
- Check that `className` is last in the `cn()` call
- Verify CSS specificity isn't preventing overrides
- Use browser dev tools to inspect the final className order

### Styles Not Applying?
- Ensure your CSS class is properly defined in `globals.css`
- Check that Tailwind classes are not being purged
- Verify the component is using the correct variant system

### TypeScript Errors?
- Make sure variant types match your CSS class names
- Ensure all required props are properly typed
- Check that `VariantProps` is correctly applied

---

## Summary

This pattern gives you the **fastest possible iteration speed** for styling components while maintaining consistency. You can style components directly in your JSX and see changes immediately, while keeping a solid foundation through your CSS class system.

The key is: **CSS for the foundation, Tailwind for the customization**.
