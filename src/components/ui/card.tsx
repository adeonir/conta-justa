import type { ComponentProps } from 'react'

import { cn } from '~/lib/utils'

export interface CardProps extends ComponentProps<'div'> {
  accent?: boolean
}

export function Card({ className, accent = true, children, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        'relative rounded-2xl border border-border bg-card p-10',
        accent && [
          'before:absolute before:top-0 before:left-1/2 before:h-0.75 before:w-36 before:-translate-x-1/2',
          'before:rounded-b-sm before:bg-primary',
        ],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
