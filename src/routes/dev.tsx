import { createFileRoute, redirect } from '@tanstack/react-router'

import { Footer } from '~/components/layout/footer'
import { Header } from '~/components/layout/header'
import { Layout } from '~/components/layout/layout'
import { useTheme } from '~/providers/theme-provider'

export const Route = createFileRoute('/dev')({
  beforeLoad: () => {
    if (import.meta.env.PROD) {
      throw redirect({ to: '/' })
    }
  },
  component: DevPage,
})

function DevPage() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-2 font-bold text-3xl">Design System</h1>
        <p className="mb-12 text-muted-foreground">Component preview gallery</p>

        {/* Theme Toggle Section - using ThemeProvider directly until ThemeToggle component is created */}
        <Section title="Theme Toggle">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Current: <strong className="text-foreground">{theme}</strong> (resolved:{' '}
              <strong className="text-foreground">{resolvedTheme}</strong>)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`rounded-lg border px-3 py-1.5 text-sm ${theme === 'system' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'}`}
              >
                System
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`rounded-lg border px-3 py-1.5 text-sm ${theme === 'light' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'}`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`rounded-lg border px-3 py-1.5 text-sm ${theme === 'dark' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'}`}
              >
                Dark
              </button>
            </div>
          </div>
        </Section>

        {/* Color Tokens Section - demonstrates CSS tokens from T001 */}
        <Section title="Color Tokens">
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-semibold text-sm">Semantic Colors</h3>
              <div className="grid grid-cols-11 gap-2">
                <ColorSwatch name="background" className="bg-background" />
                <ColorSwatch name="foreground" className="bg-foreground" />
                <ColorSwatch name="card" className="bg-card" />
                <ColorSwatch name="muted" className="bg-muted" />
                <ColorSwatch name="primary" className="bg-primary" />
                <ColorSwatch name="secondary" className="bg-secondary" />
                <ColorSwatch name="border" className="bg-border" />
              </div>
            </div>
            <div>
              <h3 className="mb-3 font-semibold text-sm">Red Scale</h3>
              <div className="grid grid-cols-11 gap-2">
                <ColorSwatch name="red-50" className="bg-red-50" />
                <ColorSwatch name="red-100" className="bg-red-100" />
                <ColorSwatch name="red-200" className="bg-red-200" />
                <ColorSwatch name="red-300" className="bg-red-300" />
                <ColorSwatch name="red-400" className="bg-red-400" />
                <ColorSwatch name="red-500" className="bg-red-500" />
                <ColorSwatch name="red-600" className="bg-red-600" />
                <ColorSwatch name="red-700" className="bg-red-700" />
                <ColorSwatch name="red-800" className="bg-red-800" />
                <ColorSwatch name="red-900" className="bg-red-900" />
                <ColorSwatch name="red-950" className="bg-red-950" />
              </div>
            </div>
            <div>
              <h3 className="mb-3 font-semibold text-sm">Neutral Scale</h3>
              <div className="grid grid-cols-11 gap-2">
                <ColorSwatch name="neutral-50" className="bg-neutral-50" />
                <ColorSwatch name="neutral-100" className="bg-neutral-100" />
                <ColorSwatch name="neutral-200" className="bg-neutral-200" />
                <ColorSwatch name="neutral-300" className="bg-neutral-300" />
                <ColorSwatch name="neutral-400" className="bg-neutral-400" />
                <ColorSwatch name="neutral-500" className="bg-neutral-500" />
                <ColorSwatch name="neutral-600" className="bg-neutral-600" />
                <ColorSwatch name="neutral-700" className="bg-neutral-700" />
                <ColorSwatch name="neutral-800" className="bg-neutral-800" />
                <ColorSwatch name="neutral-900" className="bg-neutral-900" />
                <ColorSwatch name="neutral-950" className="bg-neutral-950" />
              </div>
            </div>
          </div>
        </Section>

        {/* Typography Section - demonstrates font tokens */}
        <Section title="Typography">
          <div className="space-y-4">
            <h1 className="font-black text-4xl">Heading 1 - Font Black</h1>
            <h2 className="font-bold text-3xl">Heading 2 - Font Bold</h2>
            <h3 className="font-semibold text-2xl">Heading 3 - Font Semibold</h3>
            <h4 className="font-medium text-xl">Heading 4 - Font Medium</h4>
            <p className="text-base">Body text - regular weight, base size</p>
            <p className="text-muted-foreground text-sm">Muted text - smaller, secondary color</p>
            <p className="text-muted-foreground text-xs">Helper text - extra small, muted</p>
          </div>
        </Section>

        {/* Layout Components Section */}
        <Section title="Layout Components">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Header</h3>
              <div className="-mx-6 overflow-hidden rounded-lg border border-border">
                <Header />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Footer</h3>
              <div className="-mx-6 overflow-hidden rounded-lg border border-border">
                <Footer />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Layout (full page wrapper)</h3>
              <p className="text-muted-foreground text-sm">
                The Layout component combines Header, main content area (max-w-275, px-6, py-20), and Footer.
              </p>
              <div className="-mx-6 overflow-hidden rounded-lg border border-border">
                <Layout>
                  <div className="rounded-lg border border-border border-dashed bg-muted/50 p-8 text-center">
                    <p className="text-muted-foreground text-sm">Main content area</p>
                    <p className="mt-1 text-muted-foreground text-xs">max-w-275 (1100px) | px-6 | py-20</p>
                  </div>
                </Layout>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-6 border-border border-b pb-3 font-bold text-muted-foreground text-xs uppercase tracking-[0.15em]">
        {title}
      </h2>
      {children}
    </section>
  )
}

function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`aspect-4/3 w-full rounded-lg border border-border ${className}`} />
      <span className="text-center text-[10px] text-muted-foreground">{name}</span>
    </div>
  )
}
