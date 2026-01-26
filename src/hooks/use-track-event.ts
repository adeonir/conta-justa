import posthog from 'posthog-js'
import { useEffect, useRef } from 'react'

export function useTrackEvent(eventName: string, properties: Record<string, unknown> | null, isReady: boolean) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (isReady && properties && !hasTracked.current) {
      hasTracked.current = true
      posthog.capture(eventName, properties)
    }
  }, [eventName, properties, isReady])
}
