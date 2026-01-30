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
      className={cn(
        'sticky top-0 z-100 border-border border-b bg-background/85 px-6 py-5 backdrop-blur-md max-md:px-4 max-md:py-3',
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-300 items-center justify-between gap-4 max-md:gap-2 max-xs:gap-1">
        <Logo />
        <nav className="flex items-center gap-4 max-md:gap-2 max-xs:gap-1 max-xs:[&>a]:px-2">
          <Link
            to="/"
            className={buttonVariants({
              variant: pathname === '/' ? 'secondary' : 'ghost',
              size: 'md',
            })}
          >
            Início
          </Link>
          <Link
            to="/about"
            className={buttonVariants({
              variant: pathname === '/about' ? 'secondary' : 'ghost',
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
        'flex items-center gap-2 rounded-sm max-md:gap-1.5 max-xs:gap-1',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <span className="whitespace-nowrap font-black text-[22px] tracking-tight max-md:text-lg max-xs:text-base">
        Conta Justa
      </span>
      <span className="mt-0.75 size-2.5 shrink-0 rounded-full bg-primary max-md:size-2 max-xs:mt-0.5" />
    </Link>
  )
}
