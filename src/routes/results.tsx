import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { Actions, Card, Comparison, Explanation, Summary } from '~/components/app/results'
import { Footer } from '~/components/layout/footer'
import { Header } from '~/components/layout/header'
import { useExpenseStore } from '~/stores/expense-store'

export const Route = createFileRoute('/results')({
  component: ResultsPage,
})

function ResultsPage() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const { formData, minimumWage } = useExpenseStore(
    useShallow((s) => ({
      formData: s.formData,
      minimumWage: s.minimumWage,
    })),
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !formData) {
      navigate({ to: '/' })
    }
  }, [mounted, formData, navigate])

  if (!mounted || !formData || !minimumWage) {
    return null
  }

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-275 flex-1 grid-cols-[1fr_1.2fr] items-start gap-20 px-6 py-20 max-md:max-w-140 max-md:grid-cols-1 max-md:gap-12 max-md:py-12">
        <Summary />

        <div className="flex flex-col gap-8">
          <Card />
          <Comparison />
          <Explanation />
          <Actions />
        </div>
      </main>
      <Footer />
    </>
  )
}
