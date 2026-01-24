import type { ComponentProps } from 'react'
import type { VariantProps } from 'tailwind-variants'

import { tv } from 'tailwind-variants'

import { cn } from '~/lib/utils'

export const buttonVariants = tv({
  base: [
    'inline-flex cursor-pointer items-center justify-center rounded-lg border font-medium transition-all',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20',
    'disabled:pointer-events-none disabled:opacity-50',
    'data-disabled:pointer-events-none data-disabled:opacity-50',
  ],
  variants: {
    variant: {
      primary: ['border-primary bg-primary text-primary-foreground', 'hover:shadow-glow'],
      secondary: ['border-transparent bg-foreground/20 text-foreground', 'hover:bg-foreground/25'],
      ghost: ['border-transparent bg-transparent text-muted-foreground', 'hover:bg-muted hover:text-foreground'],
      outline: ['border-border bg-transparent text-foreground', 'hover:bg-muted hover:border-muted-foreground/50'],
    },
    size: {
      sm: 'h-8 gap-1.5 px-3 text-xs',
      md: 'h-10 gap-2 px-4 text-sm',
      lg: 'h-12 gap-2.5 px-8 py-5 text-base',
    },
    fullWidth: {
      true: 'w-full',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  fullWidth?: boolean
}

export function Button({ className, variant, size, fullWidth, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      data-slot="button"
      data-disabled={disabled || undefined}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {children}
    </button>
  )
}
