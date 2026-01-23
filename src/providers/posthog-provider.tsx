import posthog from 'posthog-js'
import { type ReactNode, useEffect } from 'react'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST
const IS_PRODUCTION = import.meta.env.PROD

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!IS_PRODUCTION || !POSTHOG_KEY) {
      return
    }

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
    })
  }, [])

  return <>{children}</>
}
