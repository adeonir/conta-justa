import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { Form } from '~/components/app/form'
import { Hero } from '~/components/app/hero'
import { Footer } from '~/components/layout/footer'
import { Header } from '~/components/layout/header'
import { getMinimumWage } from '~/server/get-minimum-wage'
import { useExpenseStore } from '~/stores/expense-store'

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async () => {
    const minimumWage = await getMinimumWage()
    return { minimumWage }
  },
})

function HomePage() {
  const { minimumWage: loaderWage } = Route.useLoaderData()
  const { minimumWage: storedWage, setMinimumWage } = useExpenseStore(
    useShallow((s) => ({ minimumWage: s.minimumWage, setMinimumWage: s.setMinimumWage })),
  )

  useEffect(() => {
    if (!storedWage && loaderWage) {
      setMinimumWage(loaderWage * 100) // Convert to cents
    }
  }, [storedWage, loaderWage, setMinimumWage])

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-275 flex-1 grid-cols-[1fr_1.2fr] items-start gap-20 px-6 py-20 max-md:max-w-140 max-md:grid-cols-1 max-md:gap-12 max-md:py-12">
        <Hero />
        <Form />
      </main>
      <Footer />
    </>
  )
}
