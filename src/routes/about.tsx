import { createFileRoute } from '@tanstack/react-router'

import { Footer, Header } from '~/components/layout'

export const Route = createFileRoute('/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: 'Sobre - Conta Justa' },
      {
        name: 'description',
        content: 'Saiba mais sobre o Conta Justa, uma calculadora de divisão justa de despesas para casais.',
      },
      { property: 'og:title', content: 'Sobre - Conta Justa' },
      {
        property: 'og:description',
        content: 'Saiba mais sobre o Conta Justa, uma calculadora de divisão justa de despesas para casais.',
      },
    ],
  }),
})

function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-275 flex-1 flex-col px-6 py-20">
        <h1 className="font-bold text-2xl">Sobre</h1>
      </main>
      <Footer />
    </>
  )
}
