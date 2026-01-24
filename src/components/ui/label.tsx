import type { ComponentProps } from 'react'

import { cn } from '~/lib/utils'

export interface LabelProps extends ComponentProps<'label'> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is passed via props
    <label data-slot="label" className={cn('mb-2 block font-semibold text-foreground text-sm', className)} {...props} />
  )
}
