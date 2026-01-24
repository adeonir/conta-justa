import type { ComponentProps, ReactNode } from 'react'

import { cn } from '~/lib/utils'

export interface InfoBoxProps extends ComponentProps<'div'> {
  icon?: ReactNode
}

export function InfoBox({ className, icon, children, ...props }: InfoBoxProps) {
  return (
    <div
      data-slot="info-box"
      className={cn('flex items-start gap-3 rounded-lg border border-info/30 bg-info/5 p-4', className)}
      {...props}
    >
      {icon && <span className="mt-0.5 shrink-0 text-info [&>svg]:size-4.5">{icon}</span>}
      <div className="text-[13px] text-muted-foreground leading-relaxed">{children}</div>
    </div>
  )
}
