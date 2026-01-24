import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'

import { cn } from '~/lib/utils'

export interface FooterProps extends ComponentProps<'footer'> {}

export function Footer({ className, ...props }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer data-slot="footer" className={cn('border-border border-t px-6 py-10', className)} {...props}>
      <div className="mx-auto flex max-w-275 items-center justify-between">
        <Logo />
        <span className="text-[13px] text-muted-foreground">
          {currentYear}
          <span className="mx-1">•</span>
          <Link to="/" className="transition-colors hover:text-foreground">
            Sobre
          </Link>
        </span>
      </div>
    </footer>
  )
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-1.5">
      <span className="font-bold text-[13px] tracking-tight">Conta Justa</span>
      <span className="mt-0.5 size-1.5 rounded-full bg-primary" />
    </Link>
  )
}
