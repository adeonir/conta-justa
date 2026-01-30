import { ChevronDown, Plus } from 'lucide-react'
import type { ComponentProps } from 'react'
import { createContext, useContext, useId, useState } from 'react'

import { cn } from '~/lib/utils'

interface CollapsibleContextValue {
  open: boolean
  toggle: () => void
  contentId: string
  triggerId: string
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null)

function useCollapsible() {
  const context = useContext(CollapsibleContext)
  if (!context) {
    throw new Error('Collapsible components must be used within Collapsible.Root')
  }
  return context
}

export interface CollapsibleRootProps extends ComponentProps<'div'> {
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function CollapsibleRoot({ defaultOpen = false, onOpenChange, className, children, ...props }: CollapsibleRootProps) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  const toggle = () => {
    const newValue = !open
    setOpen(newValue)
    onOpenChange?.(newValue)
  }

  return (
    <CollapsibleContext.Provider
      value={{
        open,
        toggle,
        contentId: `collapsible-content-${id}`,
        triggerId: `collapsible-trigger-${id}`,
      }}
    >
      <div data-slot="collapsible" data-state={open ? 'open' : 'closed'} className={className} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

export interface CollapsibleTriggerProps extends ComponentProps<'button'> {
  icon?: 'plus' | 'chevron'
}

function CollapsibleTrigger({ icon = 'plus', className, children, ...props }: CollapsibleTriggerProps) {
  const { open, toggle, contentId, triggerId } = useCollapsible()

  const Icon = icon === 'plus' ? Plus : ChevronDown

  return (
    <button
      type="button"
      id={triggerId}
      data-slot="collapsible-trigger"
      data-state={open ? 'open' : 'closed'}
      aria-expanded={open}
      aria-controls={contentId}
      onClick={toggle}
      className={cn(
        'flex cursor-pointer items-center gap-2 bg-transparent p-0 text-left font-bold text-primary text-sm uppercase tracking-wide',
        'rounded-sm transition-colors hover:text-primary/80',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        className,
      )}
      {...props}
    >
      <Icon
        className={cn(
          'size-5 transition-transform duration-300 ease-out',
          icon === 'chevron' && open && 'rotate-180',
          icon === 'plus' && open && 'rotate-45',
        )}
      />
      {children}
    </button>
  )
}

export interface CollapsibleContentProps extends ComponentProps<'section'> {}

function CollapsibleContent({ className, children, ...props }: CollapsibleContentProps) {
  const { open, contentId, triggerId } = useCollapsible()

  return (
    <section
      id={contentId}
      data-slot="collapsible-content"
      data-state={open ? 'open' : 'closed'}
      aria-labelledby={triggerId}
      aria-hidden={!open}
      inert={!open ? true : undefined}
      className={cn(
        '-m-1 grid transition-[grid-template-rows,opacity] duration-300 ease-out',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        className,
      )}
      {...props}
    >
      <div className="overflow-hidden p-1">
        <div className="pt-6">{children}</div>
      </div>
    </section>
  )
}

export interface CollapsibleDescriptionProps extends ComponentProps<'p'> {}

function CollapsibleDescription({ className, children, ...props }: CollapsibleDescriptionProps) {
  return (
    <p
      data-slot="collapsible-description"
      className={cn('mb-6 border-border border-l-2 pl-4 text-muted-foreground text-sm leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export const Collapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
  Description: CollapsibleDescription,
}

export type { CollapsibleContextValue }
