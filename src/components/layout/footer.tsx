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
          <a
            href="https://github.com/adeonir/conta-justa"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'rounded-sm transition-colors hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            GitHub
          </a>
        </span>
      </div>
    </footer>
  )
}

function Logo() {
  return (
    <Link
      to="/"
      className={cn(
        'flex items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <span className="font-bold text-[13px] tracking-tight">Conta Justa</span>
      <span className="mt-0.5 size-1.5 rounded-full bg-primary" />
    </Link>
  )
}
