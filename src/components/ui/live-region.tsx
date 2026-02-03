import type { ReactNode } from 'react'

interface AriaLiveRegionProps {
  children?: ReactNode
  'aria-live'?: 'polite' | 'assertive' | 'off'
  'aria-atomic'?: boolean
}

export function AriaLiveRegion({
  children,
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true,
}: AriaLiveRegionProps) {
  return (
    <div aria-live={ariaLive} aria-atomic={ariaAtomic} className="sr-only">
      {children}
    </div>
  )
}
