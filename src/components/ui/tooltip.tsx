import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

import { cn } from '~/lib/utils'

export interface TooltipProps {
  children: ReactElement
  content: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: 'none' | 'short' | 'long'
}

const delayMs = {
  none: 0,
  short: 300,
  long: 700,
}

const arrowClasses = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-foreground border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-foreground border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-foreground border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-foreground border-y-transparent border-l-transparent',
}

export function Tooltip({ content, side = 'top', delay = 'short', children }: TooltipProps) {
  const id = useId()
  const tooltipId = `tooltip-${id}`

  const triggerRef = useRef<HTMLElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isPositioned, setIsPositioned] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  const showTooltip = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delayMs[delay])
  }, [delay])

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
    setIsPositioned(false)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: content changes tooltip width, needs repositioning
  useLayoutEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return

    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return

      const trigger = triggerRef.current.getBoundingClientRect()
      const tooltip = tooltipRef.current.getBoundingClientRect()
      const gap = 8

      let top = 0
      let left = 0

      switch (side) {
        case 'top':
          top = trigger.top - tooltip.height - gap
          left = trigger.left + trigger.width / 2 - tooltip.width / 2
          break
        case 'bottom':
          top = trigger.bottom + gap
          left = trigger.left + trigger.width / 2 - tooltip.width / 2
          break
        case 'left':
          top = trigger.top + trigger.height / 2 - tooltip.height / 2
          left = trigger.left - tooltip.width - gap
          break
        case 'right':
          top = trigger.top + trigger.height / 2 - tooltip.height / 2
          left = trigger.right + gap
          break
      }

      setPosition({ top, left })
      setIsPositioned(true)
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(updatePosition)
    })
  }, [isVisible, side, content])

  useLayoutEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (!isValidElement(children)) {
    return children
  }

  const shouldShow = isVisible && isPositioned

  return (
    <>
      {cloneElement(children, {
        ref: triggerRef,
        'aria-describedby': shouldShow ? tooltipId : undefined,
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
      } as Record<string, unknown>)}
      {mounted &&
        createPortal(
          <span
            ref={tooltipRef}
            id={tooltipId}
            data-slot="tooltip"
            role="tooltip"
            style={{ top: position.top, left: position.left }}
            className={cn(
              'pointer-events-none fixed z-9999 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-background text-xs',
              'transition-opacity duration-200',
              shouldShow ? 'opacity-100' : 'opacity-0',
            )}
          >
            {content}
            <span
              data-slot="tooltip-arrow"
              className={cn('absolute size-0 border-4', arrowClasses[side])}
              aria-hidden="true"
            />
          </span>,
          document.body,
        )}
    </>
  )
}
