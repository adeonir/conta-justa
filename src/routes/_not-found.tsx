import { Link } from '@tanstack/react-router'

import { Footer } from '~/components/layout/footer'
import { Header } from '~/components/layout/header'
import { buttonVariants } from '~/components/ui'

export function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-275 flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-4 font-light text-9xl text-primary">404</span>
        <h1 className="mb-3 font-bold text-2xl">Página não encontrada</h1>
        <p className="mb-8 max-w-80 text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          Voltar para início
        </Link>
      </main>
      <Footer />
    </>
  )
}
