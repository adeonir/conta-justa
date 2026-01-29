import { Link, useRouterState } from '@tanstack/react-router'
import type { ComponentProps } from 'react'

import { buttonVariants, ThemeToggle } from '~/components/ui'
import { cn } from '~/lib/utils'

export interface HeaderProps extends ComponentProps<'header'> {}

export function Header({ className, ...props }: HeaderProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <header
      data-slot="header"
      className={cn('sticky top-0 z-100 border-border border-b bg-background/85 px-6 py-5 backdrop-blur-md', className)}
      {...props}
    >
      <div className="mx-auto flex max-w-300 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className={buttonVariants({
              variant: pathname === '/' ? 'secondary' : 'outline',
              size: 'md',
            })}
          >
            Início
          </Link>
          <Link
            to="/about"
            className={buttonVariants({
              variant: pathname === '/about' ? 'secondary' : 'outline',
              size: 'md',
            })}
          >
            Sobre
          </Link>
          <ThemeToggle />
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
