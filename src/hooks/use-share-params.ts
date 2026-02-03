import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useEffect, useMemo, useRef } from 'react'

import { shareParamsSchema } from '~/schemas/share-params'
import { useData, useSetData } from '~/stores/expense-store'

const shareParamsParsers = {
  a: parseAsString,
  ra: parseAsInteger,
  b: parseAsString,
  rb: parseAsInteger,
  e: parseAsInteger,
  ha: parseAsInteger,
  hb: parseAsInteger,
}

export function useShareParams(): { isFromShareLink: boolean; hasInvalidShareParams: boolean } {
  const [params] = useQueryStates(shareParamsParsers)
  const hasProcessed = useRef(false)

  const data = useData()
  const setData = useSetData()

  const hasAnyShareParam =
    params.a !== null || params.ra !== null || params.b !== null || params.rb !== null || params.e !== null
  const hasRequiredParams = Boolean(params.a && params.ra && params.b && params.rb && params.e)

  const validatedData = useMemo(() => {
    if (!hasRequiredParams) return null

    const result = shareParamsSchema.safeParse({
      a: params.a,
      ra: params.ra,
      b: params.b,
      rb: params.rb,
      e: params.e,
      ha: params.ha ?? 0,
      hb: params.hb ?? 0,
    })

    return result.success ? result.data : null
  }, [params, hasRequiredParams])

  useEffect(() => {
    // Only process if:
    // 1. Not already processed
    // 2. Has valid data from URL
    // 3. Store doesn't already have data (prevents overwriting user's form data)
    if (hasProcessed.current || !validatedData || data) return

    setData(validatedData)
    hasProcessed.current = true
    window.history.replaceState(null, '', '/results')
  }, [validatedData, setData, data])

  const isFromShareLink = hasProcessed.current || validatedData !== null
  const hasInvalidShareParams = hasAnyShareParam && !isFromShareLink

  return { isFromShareLink, hasInvalidShareParams }
}
