import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { tv } from 'tailwind-variants'

import type { ToastData, ToastVariant } from '~/lib/toast'
import { subscribe, toast } from '~/lib/toast'
import { cn } from '~/lib/utils'

export { toast } from '~/lib/toast'

export const toastVariants = tv({
  base: ['pointer-events-auto flex w-full items-center gap-3 rounded-lg border px-4 py-3 shadow-sm'],
  variants: {
    variant: {
      success: 'border-success/30 bg-success/10 text-success',
      error: 'border-error/30 bg-error/10 text-error',
      info: 'border-info/30 bg-info/10 text-info',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
})

const variantIcons: Record<ToastVariant, typeof CircleCheck> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
}

interface ToastItemProps {
  toast: ToastData
  onDismiss: (id: number) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [mounted, setMounted] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [removed, setRemoved] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const remainingRef = useRef(toast.duration)
  const startRef = useRef(0)
  const dismissedRef = useRef(false)

  const Icon = variantIcons[toast.variant]

  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    setExiting(true)
  }, [])

  const startTimer = useCallback(
    (duration: number) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      startRef.current = Date.now()
      remainingRef.current = duration
      timerRef.current = setTimeout(handleDismiss, duration)
    },
    [handleDismiss],
  )

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const elapsed = Date.now() - startRef.current
    remainingRef.current = Math.max(remainingRef.current - elapsed, 0)
  }, [])

  const handleMouseEnter = useCallback(() => {
    pauseTimer()
  }, [pauseTimer])

  const handleMouseLeave = useCallback(() => {
    if (!dismissedRef.current && remainingRef.current > 0) {
      startTimer(remainingRef.current)
    }
  }, [startTimer])

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (exiting && e.propertyName === 'opacity') {
        setRemoved(true)
      }
      if (removed && e.propertyName === 'grid-template-rows') {
        onDismiss(toast.id)
      }
    },
    [exiting, removed, onDismiss, toast.id],
  )

  // Enter animation via double rAF
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMounted(true)
      })
    })
    return () => cancelAnimationFrame(frameId)
  }, [])

  // Auto-dismiss timer
  useEffect(() => {
    startTimer(toast.duration)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.duration, startTimer])

  // Pause on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseTimer()
      } else if (!dismissedRef.current && remainingRef.current > 0) {
        startTimer(remainingRef.current)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pauseTimer, startTimer])

  // Fallback timeout for exit animation completion
  // Breakdown: 500ms opacity transition + 500ms grid-template-rows transition + 100ms safety margin
  useEffect(() => {
    if (!exiting) return

    const EXIT_ANIMATION_DURATION_MS = 1100 // Ensures toast is fully removed after all transitions
    const fallbackTimer = setTimeout(() => {
      onDismiss(toast.id)
    }, EXIT_ANIMATION_DURATION_MS)

    return () => clearTimeout(fallbackTimer)
  }, [exiting, onDismiss, toast.id])

  const dataMounted = exiting ? 'false' : mounted ? 'true' : 'false'

  return (
    <div
      data-slot="toast-wrapper"
      className={cn(
        'grid transition-[grid-template-rows] duration-500 ease-out',
        removed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
      )}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="min-h-0">
        {/* biome-ignore lint/a11y/noStaticElementInteractions: hover events pause auto-dismiss timer, not primary interaction */}
        <div
          data-slot="toast-item"
          data-toast
          data-mounted={dataMounted}
          className={cn(
            toastVariants({ variant: toast.variant }),
            'w-full sm:w-88',
            'transition-all duration-500 ease-out',
            'data-[mounted=false]:translate-y-full data-[mounted=false]:opacity-0',
            'data-[mounted=true]:translate-y-0 data-[mounted=true]:opacity-100',
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Icon size={18} aria-hidden="true" className="shrink-0" />
          <span className="flex-1 font-medium text-foreground text-sm">{toast.message}</span>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Fechar"
            className="shrink-0 cursor-pointer rounded-sm p-0.5 opacity-70 transition-opacity hover:opacity-100"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribe(setToasts)
    return unsubscribe
  }, [])

  const handleDismiss = useCallback((id: number) => {
    toast.dismiss(id)
  }, [])

  return (
    <>
      <section data-slot="toaster" aria-label="Notificações">
        <ol className="sr-only">
          {toasts.map((t) => (
            <li key={t.id} role={t.variant === 'error' ? 'alert' : 'status'} aria-atomic="true">
              {t.message}
            </li>
          ))}
        </ol>
      </section>

      {mounted &&
        createPortal(
          <div
            data-slot="toaster-viewport"
            className={cn(
              'pointer-events-none fixed z-9999 flex flex-col-reverse gap-2',
              'inset-x-4 bottom-4',
              'sm:right-4 sm:bottom-4 sm:left-auto sm:max-w-88',
            )}
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={handleDismiss} />
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
