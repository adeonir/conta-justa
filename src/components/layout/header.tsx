import { Link } from '@tanstack/react-router'
import { Monitor } from 'lucide-react'
import type { ComponentProps } from 'react'

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
          {/* ThemeToggle placeholder - will be replaced in T012 */}
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            <Monitor className="size-4" />
          </button>
          <Link
            to="/"
            className="rounded-xl border border-border px-6 py-3 font-semibold text-muted-foreground text-sm transition-colors hover:border-foreground hover:text-foreground"
          >
            Sobre
          </Link>
        </nav>
      </div>
    </header>
  )
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="font-black text-[22px] tracking-tight">Conta Justa</span>
      <span className="mt-1 size-2.5 rounded-full bg-primary" />
    </Link>
  )
}
