import { Monitor, Moon, Sun } from 'lucide-react'
import type { ComponentProps } from 'react'

import { Tooltip } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'
import { useTheme } from '~/providers/theme-provider'

export interface ThemeToggleProps extends Omit<ComponentProps<'button'>, 'children'> {}

const themeConfig = {
  system: { icon: Monitor, label: 'Sistema', next: 'light' as const },
  light: { icon: Sun, label: 'Claro', next: 'dark' as const },
  dark: { icon: Moon, label: 'Escuro', next: 'system' as const },
}

export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { theme, mounted, setTheme } = useTheme()

  const config = themeConfig[theme]
  const cycleTheme = () => setTheme(config.next)

  const buttonClassName = cn(
    'flex size-9 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-transparent text-muted-foreground transition-colors',
    'hover:bg-muted hover:text-foreground',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20',
    className,
  )

  if (!mounted) {
    return (
      <button type="button" data-slot="theme-toggle" className={buttonClassName} {...props}>
        <span className="size-4" />
      </button>
    )
  }

  const Icon = config.icon

  return (
    <Tooltip content={config.label} side="bottom">
      <button
        type="button"
        data-slot="theme-toggle"
        onClick={cycleTheme}
        aria-label={`Tema: ${config.label}. Clique para alternar`}
        className={buttonClassName}
        {...props}
      >
        <Icon className="size-4" />
      </button>
    </Tooltip>
  )
}
