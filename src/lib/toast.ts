export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastData {
  id: number
  message: string
  variant: ToastVariant
  duration: number
}

type Subscriber = (toasts: ToastData[]) => void

const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
  success: 3000,
  error: 5000,
  info: 5000,
}

class ToastState {
  private toasts: ToastData[] = []
  private subscribers: Set<Subscriber> = new Set()
  private counter = 0

  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  private publish() {
    const snapshot = [...this.toasts]
    for (const callback of this.subscribers) {
      try {
        callback(snapshot)
      } catch {
        // Prevent one bad subscriber from breaking others
      }
    }
  }

  add(message: string, variant: ToastVariant = 'info', duration?: number): number {
    const id = ++this.counter
    const toastDuration = duration ?? DEFAULT_DURATIONS[variant]

    this.toasts.push({ id, message, variant, duration: toastDuration })
    this.publish()

    return id
  }

  dismiss(id: number) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id)
    this.publish()
  }

  dismissAll() {
    this.toasts = []
    this.publish()
  }

  getToasts(): ToastData[] {
    return [...this.toasts]
  }
}

const toastState = new ToastState()

function toastFn(message: string, variant?: ToastVariant, duration?: number): number {
  return toastState.add(message, variant, duration)
}

export const toast = Object.assign(toastFn, {
  success: (message: string, duration?: number) => toastFn(message, 'success', duration),
  error: (message: string, duration?: number) => toastFn(message, 'error', duration),
  info: (message: string, duration?: number) => toastFn(message, 'info', duration),
  dismiss: (id: number) => toastState.dismiss(id),
  dismissAll: () => toastState.dismissAll(),
})

export function subscribe(callback: Subscriber): () => void {
  return toastState.subscribe(callback)
}

export function getToasts(): ToastData[] {
  return toastState.getToasts()
}
