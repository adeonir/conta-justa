import { createFileRoute } from '@tanstack/react-router'

import { generateOgImage } from '~/server/og-image'

const RATE_LIMIT_WINDOW_MS = 60000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5 // limit requests per minute
const CLEANUP_INTERVAL_MS = 300000 // clean up old entries every 5 minutes

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory rate limit store (per-process, not shared between instances)
const rateLimitStore = new Map<string, RateLimitEntry>()

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  return request.headers.get('x-real-ip') ?? 'unknown'
}

// Sliding window rate limiting: tracks request count per IP with automatic window reset
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    })
    return false
  }

  if (now > entry.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    })
    return false
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  entry.count++
  return false
}

setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip)
    }
  }
}, CLEANUP_INTERVAL_MS) // clean up old entries every 5 minutes

export const Route = createFileRoute('/api/og')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const clientIp = getClientIp(request)

          if (isRateLimited(clientIp)) {
            return new Response('Too Many Requests', {
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
              },
            })
          }

          const url = new URL(request.url)
          const pngBuffer = await generateOgImage(url.searchParams)

          return new Response(pngBuffer as BodyInit, {
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          })
        } catch (error) {
          console.error('[og-image] Generation failed:', error)
          return new Response('Internal Server Error', { status: 500 })
        }
      },
    },
  },
})
