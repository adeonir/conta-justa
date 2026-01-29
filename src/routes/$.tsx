import { createFileRoute, Link } from '@tanstack/react-router'

import { Footer, Header } from '~/components/layout'
import { buttonVariants } from '~/components/ui'

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
  head: () => ({
    meta: [
      { title: 'Página não encontrada - Conta Justa' },
      {
        name: 'description',
        content: 'A página que você tentou acessar não existe ou mudou de lugar.',
      },
      { property: 'og:title', content: 'Página não encontrada - Conta Justa' },
      {
        property: 'og:description',
        content: 'A página que você tentou acessar não existe ou mudou de lugar.',
      },
    ],
  }),
})

function NotFoundPage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-275 flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-4 font-light text-9xl text-primary">404</span>
        <h1 className="mb-3 font-bold text-2xl">Essa conta não fecha</h1>
        <p className="mb-2 max-w-lg text-muted-foreground">
          A página que você tentou acessar não existe ou mudou de lugar.
        </p>
        <p className="mb-12 text-muted-foreground text-sm">Às vezes a gente se perde — com links também acontece.</p>

        <Link to="/" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          Voltar para o início
        </Link>

        <p className="mt-24 max-w-lg text-muted-foreground text-sm">
          Se você chegou até aqui por um link antigo ou compartilhado, é só voltar para o início e fazer um novo
          cálculo.
        </p>
      </main>
      <Footer />
    </>
  )
}
