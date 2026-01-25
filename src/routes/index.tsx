import { createFileRoute } from '@tanstack/react-router'

import { Form } from '~/components/app/form'
import { Hero } from '~/components/app/hero'
import { Footer } from '~/components/layout/footer'
import { Header } from '~/components/layout/header'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-275 grid-cols-2 items-start gap-20 px-6 py-20 max-md:max-w-140 max-md:grid-cols-1 max-md:gap-12 max-md:py-12">
        <Hero />
        <Form />
      </main>
      <Footer />
    </>
  )
}
