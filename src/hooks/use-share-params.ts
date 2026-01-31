import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useEffect, useMemo, useRef } from 'react'

import { shareParamsSchema } from '~/schemas/share-params'
import { useSetData } from '~/stores/expense-store'

const shareParamsParsers = {
  a: parseAsString,
  ra: parseAsInteger,
  b: parseAsString,
  rb: parseAsInteger,
  e: parseAsInteger,
  ha: parseAsInteger,
  hb: parseAsInteger,
}

export function useShareParams(): { isFromShareLink: boolean } {
  const [params] = useQueryStates(shareParamsParsers)
  const hasProcessed = useRef(false)

  const setData = useSetData()

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
    if (hasProcessed.current || !validatedData) return
    setData(validatedData)
    hasProcessed.current = true
  }, [validatedData, setData])

  return { isFromShareLink: validatedData !== null }
}
