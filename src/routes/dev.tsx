import { createFileRoute, redirect } from '@tanstack/react-router'

import { Info } from 'lucide-react'

import { Footer } from '~/components/layout/footer'
import { Header } from '~/components/layout/header'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Collapsible } from '~/components/ui/collapsible'
import { Description } from '~/components/ui/description'
import { InfoBox } from '~/components/ui/info-box'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { ThemeToggle } from '~/components/ui/theme-toggle'
import { Title } from '~/components/ui/title'
import { Tooltip } from '~/components/ui/tooltip'
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

        {/* Theme Toggle Section */}
        <Section title="Theme Toggle">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Current: <strong className="text-foreground">{theme}</strong> (resolved:{' '}
                <strong className="text-foreground">{resolvedTheme}</strong>)
              </span>
              <ThemeToggle />
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Manual selection</h3>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'system' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                >
                  System
                </Button>
                <Button variant={theme === 'light' ? 'primary' : 'outline'} size="sm" onClick={() => setTheme('light')}>
                  Light
                </Button>
                <Button variant={theme === 'dark' ? 'primary' : 'outline'} size="sm" onClick={() => setTheme('dark')}>
                  Dark
                </Button>
              </div>
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
              <h3 className="mb-3 font-semibold text-sm">Brand Scale</h3>
              <div className="grid grid-cols-11 gap-2">
                <ColorSwatch name="brand-50" className="bg-brand-50" />
                <ColorSwatch name="brand-100" className="bg-brand-100" />
                <ColorSwatch name="brand-200" className="bg-brand-200" />
                <ColorSwatch name="brand-300" className="bg-brand-300" />
                <ColorSwatch name="brand-400" className="bg-brand-400" />
                <ColorSwatch name="brand-500" className="bg-brand-500" />
                <ColorSwatch name="brand-600" className="bg-brand-600" />
                <ColorSwatch name="brand-700" className="bg-brand-700" />
                <ColorSwatch name="brand-800" className="bg-brand-800" />
                <ColorSwatch name="brand-900" className="bg-brand-900" />
                <ColorSwatch name="brand-950" className="bg-brand-950" />
              </div>
            </div>
            <div>
              <h3 className="mb-3 font-semibold text-sm">Base Scale</h3>
              <div className="grid grid-cols-11 gap-2">
                <ColorSwatch name="base-50" className="bg-base-50" />
                <ColorSwatch name="base-100" className="bg-base-100" />
                <ColorSwatch name="base-200" className="bg-base-200" />
                <ColorSwatch name="base-300" className="bg-base-300" />
                <ColorSwatch name="base-400" className="bg-base-400" />
                <ColorSwatch name="base-500" className="bg-base-500" />
                <ColorSwatch name="base-600" className="bg-base-600" />
                <ColorSwatch name="base-700" className="bg-base-700" />
                <ColorSwatch name="base-800" className="bg-base-800" />
                <ColorSwatch name="base-900" className="bg-base-900" />
                <ColorSwatch name="base-950" className="bg-base-950" />
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

        {/* Buttons Section */}
        <Section title="Buttons">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Variants</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">States</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Full Width</h3>
              <Button fullWidth>Full Width Button</Button>
            </div>
          </div>
        </Section>

        {/* Tooltip Section */}
        <Section title="Tooltip">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Positions</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Tooltip content="Tooltip on top" side="top">
                  <Button variant="outline">Top</Button>
                </Tooltip>
                <Tooltip content="Tooltip on bottom" side="bottom">
                  <Button variant="outline">Bottom</Button>
                </Tooltip>
                <Tooltip content="Tooltip on left" side="left">
                  <Button variant="outline">Left</Button>
                </Tooltip>
                <Tooltip content="Tooltip on right" side="right">
                  <Button variant="outline">Right</Button>
                </Tooltip>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Delay</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Tooltip content="No delay" side="top" delay="none">
                  <Button variant="outline">None</Button>
                </Tooltip>
                <Tooltip content="Short delay (300ms)" side="top" delay="short">
                  <Button variant="outline">Short</Button>
                </Tooltip>
                <Tooltip content="Long delay (700ms)" side="top" delay="long">
                  <Button variant="outline">Long</Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </Section>

        {/* Form Elements Section */}
        <Section title="Form Elements">
          <div className="grid max-w-md gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Normal State</h3>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="e.g. John" />
                <Description>Enter your full name</Description>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Error State</h3>
              <div>
                <Label htmlFor="income">Monthly income</Label>
                <Input id="income" placeholder="$0.00" error />
                <Description error>This field is required</Description>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Disabled State</h3>
              <div>
                <Label htmlFor="disabled">Disabled field</Label>
                <Input id="disabled" placeholder="Not editable" disabled />
              </div>
            </div>
          </div>
        </Section>

        {/* Container Components Section */}
        <Section title="Container Components">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Card (with accent - default)</h3>
              <Card>
                <Title>Person A</Title>
                <p className="text-muted-foreground text-sm">Card with accent bar enabled by default.</p>
              </Card>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Card (without accent)</h3>
              <Card accent={false}>
                <Title>Person A</Title>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="card-name">Name</Label>
                    <Input id="card-name" placeholder="e.g. John" />
                  </div>
                  <div>
                    <Label htmlFor="card-income">Monthly income</Label>
                    <Input id="card-income" placeholder="$0.00" />
                  </div>
                </div>
              </Card>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Title</h3>
              <div className="rounded-lg border border-border bg-card p-6">
                <Title>Section Title</Title>
                <p className="text-muted-foreground text-sm">
                  The Title component renders an uppercase heading with tracking-wide and a bottom border.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">InfoBox</h3>
              <InfoBox icon={<Info />}>
                This is an informational message to help users understand a feature or provide additional context.
              </InfoBox>
            </div>
          </div>
        </Section>

        {/* Collapsible Section */}
        <Section title="Collapsible">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">With separator (form context)</h3>
              <Card accent={false}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="main-field">Main field</Label>
                    <Input id="main-field" placeholder="Required field" />
                  </div>
                </div>
                <Collapsible.Root className="mt-8 border-border border-t pt-8">
                  <Collapsible.Trigger>Show additional options</Collapsible.Trigger>
                  <Collapsible.Content>
                    <Collapsible.Description>
                      This is a description that provides context about the collapsible content below.
                    </Collapsible.Description>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="field-a">Field A</Label>
                        <Input id="field-a" type="number" placeholder="0" />
                      </div>
                      <div>
                        <Label htmlFor="field-b">Field B</Label>
                        <Input id="field-b" type="number" placeholder="0" />
                      </div>
                    </div>
                    <InfoBox icon={<Info />} className="mt-5">
                      An informational note related to the fields above.
                    </InfoBox>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Standalone (default open)</h3>
              <Card accent={false}>
                <Collapsible.Root defaultOpen>
                  <Collapsible.Trigger>Advanced settings</Collapsible.Trigger>
                  <Collapsible.Content>
                    <Collapsible.Description>
                      Configure additional settings to customize the behavior.
                    </Collapsible.Description>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="custom-value">Custom value</Label>
                        <Input id="custom-value" placeholder="Enter value" />
                        <Description>Optional field for custom configuration</Description>
                      </div>
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">With chevron icon</h3>
              <Card accent={false}>
                <Collapsible.Root>
                  <Collapsible.Trigger icon="chevron">View details</Collapsible.Trigger>
                  <Collapsible.Content>
                    <p className="text-muted-foreground text-sm">
                      This collapsible uses a chevron icon instead of the default plus icon.
                    </p>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card>
            </div>
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
