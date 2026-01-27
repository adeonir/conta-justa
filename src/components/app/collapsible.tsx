import type { ReactNode } from 'react'

import { Collapsible as CollapsibleUI } from '~/components/ui/collapsible'

interface CollapsibleProps {
  trigger: string
  description?: string
  defaultOpen?: boolean
  children: ReactNode
}

export function Collapsible({ trigger, description, defaultOpen = false, children }: CollapsibleProps) {
  return (
    <CollapsibleUI.Root defaultOpen={defaultOpen}>
      <CollapsibleUI.Trigger>{trigger}</CollapsibleUI.Trigger>
      <CollapsibleUI.Content>
        {description && <CollapsibleUI.Description>{description}</CollapsibleUI.Description>}
        {children}
      </CollapsibleUI.Content>
    </CollapsibleUI.Root>
  )
}
