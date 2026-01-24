import type { ComponentProps } from 'react'

import { cn } from '~/lib/utils'

export interface DescriptionProps extends ComponentProps<'p'> {
  error?: boolean
}

export function Description({ className, error, ...props }: DescriptionProps) {
  return (
    <p
      data-slot="description"
      data-error={error || undefined}
      className={cn('mt-1.5 text-muted-foreground text-xs', error && 'text-error', className)}
      {...props}
    />
  )
}
