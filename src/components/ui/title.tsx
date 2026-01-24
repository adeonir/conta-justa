import type { ComponentProps } from 'react'

import { cn } from '~/lib/utils'

export interface TitleProps extends ComponentProps<'h2'> {}

export function Title({ className, children, ...props }: TitleProps) {
  return (
    <h2
      data-slot="title"
      className={cn(
        'mb-5 border-border border-b pb-3 font-bold text-muted-foreground text-xs uppercase tracking-[0.15em]',
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  )
}
