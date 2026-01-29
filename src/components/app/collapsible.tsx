import type { ReactNode } from 'react'

import { Collapsible as CollapsibleUI } from '~/components/ui'

interface CollapsibleProps {
  trigger: string
  description?: string
  defaultOpen?: boolean
  children: ReactNode
  onOpenChange?: (open: boolean) => void
}

export function Collapsible({ trigger, description, defaultOpen = false, onOpenChange, children }: CollapsibleProps) {
  return (
    <CollapsibleUI.Root defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <CollapsibleUI.Trigger>{trigger}</CollapsibleUI.Trigger>
      <CollapsibleUI.Content>
        {description && <CollapsibleUI.Description>{description}</CollapsibleUI.Description>}
        {children}
      </CollapsibleUI.Content>
    </CollapsibleUI.Root>
  )
}
