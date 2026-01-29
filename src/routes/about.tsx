import { createFileRoute } from '@tanstack/react-router'

import { Footer } from '~/components/layout/footer'
import { Header } from '~/components/layout/header'

export const Route = createFileRoute('/about')({
  component: AboutPage,
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
