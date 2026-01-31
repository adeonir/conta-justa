import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Hero } from '~/components/app/hero'
import { Actions, Card, Comparison, Explanation, Summary } from '~/components/app/results'
import { Footer, Header, PageLayout } from '~/components/layout'
import { useShareParams } from '~/hooks/use-share-params'
import { useTrackEvent } from '~/hooks/use-track-event'
import { getMinimumWage } from '~/server/get-minimum-wage'
import { useData, useMinimumWage, useSetMinimumWage } from '~/stores/expense-store'

const siteUrl = import.meta.env.VITE_SITE_URL

export const Route = createFileRoute('/results')({
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search } }) => ({
    shareParams: search as Record<string, string>,
    minimumWage: await getMinimumWage(),
  }),
  head: ({ loaderData }) => {
    const params = new URLSearchParams(loaderData?.shareParams)
    const hasShareParams = params.has('a') && params.has('ra') && params.has('e')

    const baseMeta = [
      { title: 'Resultados - Conta Justa' },
      {
        name: 'description',
        content:
          'Veja como dividir as despesas de forma justa entre o casal, com base na renda e no trabalho doméstico.',
      },
    ]

    if (hasShareParams) {
      const nameA = params.get('a')
      const nameB = params.get('b')
      const ogImageUrl = `${siteUrl}/api/og?${params.toString()}`

      return {
        meta: [
          ...baseMeta,
          {
            property: 'og:title',
            content: `Divisao de despesas de ${nameA} e ${nameB} - Conta Justa`,
          },
          {
            property: 'og:description',
            content: 'Veja como dividir as despesas de forma justa entre o casal.',
          },
          { property: 'og:image', content: ogImageUrl },
          { name: 'twitter:image', content: ogImageUrl },
        ],
      }
    }

    return {
      meta: [
        ...baseMeta,
        { property: 'og:title', content: 'Resultados - Conta Justa' },
        {
          property: 'og:description',
          content:
            'Veja como dividir as despesas de forma justa entre o casal, com base na renda e no trabalho doméstico.',
        },
      ],
    }
  },
  component: ResultsPage,
})

function ResultsPage() {
  const navigate = useNavigate()
  const { minimumWage: loaderWage } = Route.useLoaderData()

  const [mounted, setMounted] = useState(false)

  const data = useData()
  const minimumWage = useMinimumWage()
  const setMinimumWage = useSetMinimumWage()

  const { isFromShareLink } = useShareParams()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!minimumWage && loaderWage) {
      setMinimumWage(loaderWage * 100)
    }
  }, [minimumWage, loaderWage, setMinimumWage])

  useEffect(() => {
    if (mounted && !data && !isFromShareLink) {
      navigate({ to: '/' })
    }
  }, [mounted, data, isFromShareLink, navigate])

  const hasHousework = data ? data.houseworkA > 0 || data.houseworkB > 0 : false
  useTrackEvent(
    isFromShareLink ? 'shared_link_opened' : 'calculation_completed',
    data
      ? isFromShareLink
        ? { has_housework: hasHousework }
        : { method: hasHousework ? 'adjusted' : 'proportional', has_housework: hasHousework }
      : null,
    mounted && !!data,
  )

  if (!mounted || !data || !minimumWage) {
    return null
  }

  return (
    <>
      <Header />
      <PageLayout>
        <Hero>
          <Summary />
        </Hero>

        <div className="flex flex-col gap-8">
          <Card />
          <Comparison />
          <Actions />
          <Explanation />
        </div>
      </PageLayout>
      <Footer />
    </>
  )
}
