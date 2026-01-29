import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import type { ReactNode } from 'react'

import { PostHogProvider } from '~/providers/posthog-provider'
import { ThemeProvider } from '~/providers/theme-provider'
import appCss from '~/styles.css?url'

const siteUrl = import.meta.env.VITE_SITE_URL

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Conta Justa - Divisão de Despesas para Casais' },
      {
        name: 'description',
        content:
          'Calculadora que divide despesas de forma justa entre casais, considerando renda e trabalho doméstico. Descubra quanto cada pessoa deve contribuir.',
      },
      { name: 'theme-color', content: '#e53935' },
      { property: 'og:title', content: 'Conta Justa - Divisão de Despesas para Casais' },
      {
        property: 'og:description',
        content: 'Calcule a divisão justa das despesas do casal considerando renda e trabalho doméstico.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'pt_BR' },
      { property: 'og:image', content: `${siteUrl}/og-image.jpg` },
      { property: 'og:url', content: siteUrl },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Conta Justa - Divisão de Despesas para Casais' },
      {
        name: 'twitter:description',
        content: 'Calcule a divisão justa das despesas do casal considerando renda e trabalho doméstico.',
      },
      { name: 'twitter:image', content: `${siteUrl}/og-image.jpg` },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <ThemeProvider>
        <PostHogProvider>
          <NuqsAdapter>
            <Outlet />
          </NuqsAdapter>
        </PostHogProvider>
      </ThemeProvider>
    </RootDocument>
  )
}

const themeScript = `
(function() {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored === 'light' ? 'light' : stored === 'dark' ? 'dark' : (prefersDark ? 'dark' : 'light');
  document.documentElement.classList.add(theme);
})();
`

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: FOUC prevention requires inline script with static content */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
