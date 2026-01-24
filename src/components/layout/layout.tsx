import type { ReactNode } from 'react'

import { Footer } from '~/components/layout/footer'
import { Header } from '~/components/layout/header'

export interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div data-slot="layout" className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-275 flex-1 p-6">{children}</main>
      <Footer />
    </div>
  )
}
