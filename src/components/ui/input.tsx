import type { ComponentProps } from 'react'

import { cn } from '~/lib/utils'

export interface InputProps extends ComponentProps<'input'> {
  error?: boolean
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      data-error={error || undefined}
      aria-invalid={error || undefined}
      className={cn(
        'w-full rounded-lg border-2 border-input bg-muted/50 px-5 py-4 font-medium text-foreground transition-all',
        'placeholder:font-normal placeholder:text-muted-foreground',
        'focus:border-ring focus:outline-none focus:ring-4 focus:ring-ring/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        error && 'border-error focus:border-error',
        className,
      )}
      {...props}
    />
  )
}
