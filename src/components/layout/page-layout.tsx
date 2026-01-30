import type { ComponentProps } from 'react'

import { cn } from '~/lib/utils'

export interface PageLayoutProps extends ComponentProps<'main'> {}

export function PageLayout({ className, children, ...props }: PageLayoutProps) {
  return (
    <main
      className={cn(
        'mx-auto grid max-w-275 flex-1 grid-cols-[1fr_1.6fr] items-start gap-20 px-6 py-20 max-md:max-w-140 max-md:grid-cols-1 max-md:gap-8 max-md:px-4 max-md:py-8',
        className,
      )}
      {...props}
    >
      {children}
    </main>
  )
}
