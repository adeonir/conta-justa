import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { Form } from '~/components/app/form'
import { Hero } from '~/components/app/hero'
import { Footer, Header, PageLayout } from '~/components/layout'
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
        <Hero />
        <Form />
      </PageLayout>
      <Footer />
    </>
  )
}
