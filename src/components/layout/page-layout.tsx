import type { ComponentProps } from 'react'

import { cn } from '~/lib/utils'

export interface PageLayoutProps extends ComponentProps<'main'> {}

export function PageLayout({ className, children, ...props }: PageLayoutProps) {
  return (
    <main
      className={cn(
        'mx-auto grid max-w-275 flex-1 grid-cols-[1fr_1.6fr] items-start gap-20 px-6 py-20 max-lg:max-w-140 max-lg:grid-cols-1 max-lg:gap-8 max-lg:px-4 max-lg:py-8',
        className,
      )}
      {...props}
    >
      {children}
    </main>
  )
}
