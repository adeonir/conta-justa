import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'

type Theme = 'system' | 'light' | 'dark'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  mounted: boolean
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'theme'
const DEFAULT_THEME: Theme = 'system'
const DEFAULT_RESOLVED: ResolvedTheme = 'dark'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return DEFAULT_RESOLVED
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(DEFAULT_RESOLVED)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const storedTheme = (localStorage.getItem(STORAGE_KEY) as Theme) || DEFAULT_THEME
    setThemeState(storedTheme)

    const resolved = storedTheme === 'system' ? getSystemTheme() : storedTheme
    setResolvedTheme(resolved)

    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolved)

    setMounted(true)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)

    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme
    setResolvedTheme(resolved)

    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolved)
  }

  useEffect(() => {
    if (!mounted || theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const resolved = getSystemTheme()
      setResolvedTheme(resolved)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(resolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mounted, theme])

  return <ThemeContext.Provider value={{ theme, resolvedTheme, mounted, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
