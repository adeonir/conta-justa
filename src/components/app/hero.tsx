import type { ComponentProps } from 'react'

import { cn } from '~/lib/utils'

export interface HeroProps extends ComponentProps<'section'> {}

export function Hero({ className, children, ...props }: HeroProps) {
  return (
    <section className={cn('sticky top-42 self-start max-lg:static', className)} {...props}>
      {children}
    </section>
  )
}
