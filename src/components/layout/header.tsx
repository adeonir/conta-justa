import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'

import { buttonVariants, ThemeToggle } from '~/components/ui'
import { cn } from '~/lib/utils'

export interface HeaderProps extends ComponentProps<'header'> {}

export function Header({ className, ...props }: HeaderProps) {
  return (
    <header
      data-slot="header"
      className={cn('sticky top-0 z-100 border-border border-b bg-background/85 px-6 py-5 backdrop-blur-md', className)}
      {...props}
    >
      <div className="mx-auto flex max-w-300 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/" className={buttonVariants({ variant: 'outline', size: 'md' })}>
            Sobre
          </Link>
        </nav>
      </div>
    </header>
  )
}

function Logo() {
  return (
    <Link
      to="/"
      className={cn(
        'flex items-center gap-2 rounded-sm',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <span className="font-black text-[22px] tracking-tight">Conta Justa</span>
      <span className="mt-1 size-2.5 rounded-full bg-primary" />
    </Link>
  )
}
