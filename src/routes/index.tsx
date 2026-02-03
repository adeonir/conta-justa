import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { Form } from '~/components/app/form'
import { Hero } from '~/components/app/hero'
import { Footer, Header, PageLayout } from '~/components/layout'
import { AriaLiveRegion } from '~/components/ui'
import { getMinimumWage } from '~/server/get-minimum-wage'
import { useMinimumWage, useSetMinimumWage } from '~/stores/expense-store'

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => ({
    meta: [
      { title: 'Conta Justa - Divisão de Despesas para Casais' },
      {
        name: 'description',
        content:
          'Calculadora que divide despesas de forma justa entre casais, considerando renda e trabalho doméstico. Descubra quanto cada pessoa deve contribuir.',
      },
      { property: 'og:title', content: 'Conta Justa - Divisão de Despesas para Casais' },
      {
        property: 'og:description',
        content: 'Calcule a divisão justa das despesas do casal considerando renda e trabalho doméstico.',
      },
    ],
  }),
  loader: async () => {
    const minimumWage = await getMinimumWage()
    return { minimumWage }
  },
})

function HomePage() {
  const { minimumWage: loaderWage } = Route.useLoaderData()

  const storedWage = useMinimumWage()
  const setMinimumWage = useSetMinimumWage()

  useEffect(() => {
    if (!storedWage && loaderWage) {
      setMinimumWage(loaderWage * 100)
    }
  }, [storedWage, loaderWage, setMinimumWage])

  return (
    <>
      <Header />
      <PageLayout>
        <Hero className="max-md:text-center">
          <h1 className="mb-5 font-black text-[52px] leading-none tracking-tighter max-md:text-4xl">
            Compare modelos de divisão{' '}
            <em className="relative text-primary not-italic">
              justa
              <span className="absolute right-0 bottom-1 left-0 h-1 rounded-sm bg-primary" />
            </em>{' '}
            das contas do casal
          </h1>
          <div className="my-8 h-0.75 w-15 rounded-sm bg-primary max-md:mx-auto" />
          <p className="max-w-100 text-lg text-muted-foreground leading-relaxed max-md:mx-auto">
            Veja como diferentes formas de dividir despesas impactam cada pessoa — considerando renda e trabalho
            doméstico
          </p>
        </Hero>
        <Form />
      </PageLayout>
      <Footer />
      <AriaLiveRegion>{/* Form validation errors announced here for screen readers */}</AriaLiveRegion>
    </>
  )
}
