import { createFileRoute } from '@tanstack/react-router'

import { generateOgImage } from '~/server/og-image'

export const Route = createFileRoute('/api/og')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
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
