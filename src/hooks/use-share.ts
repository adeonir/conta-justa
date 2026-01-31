import { useCallback, useRef, useState } from 'react'

import { buildShareUrl } from '~/lib/share-url'
import { useData } from '~/stores/expense-store'
import { trackEvent } from './use-track-event'

const siteUrl = import.meta.env.VITE_SITE_URL as string

export function useShare() {
  const data = useData()
  const [isCopied, setIsCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)

  const getShareUrl = useCallback(() => {
    if (!data) return ''
    return buildShareUrl(data, siteUrl)
  }, [data])

  const copyToClipboard = useCallback(
    async (channel: 'copy_link' | 'share_api') => {
      const url = getShareUrl()
      if (!url) return

      try {
        await navigator.clipboard.writeText(url)
        setIsCopied(true)
        trackEvent('result_shared', { channel })
        setTimeout(() => setIsCopied(false), 2000)
      } catch (error) {
        console.warn('Clipboard write failed:', error)
      }
    },
    [getShareUrl],
  )

  const copyLink = useCallback(async () => {
    await copyToClipboard('copy_link')
  }, [copyToClipboard])

  const shareResult = useCallback(async () => {
    const url = getShareUrl()
    if (!url) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Conta Justa - Divisão de despesas',
          url,
        })
        trackEvent('result_shared', { channel: 'share_api' })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        await copyToClipboard('copy_link')
      }
    } else {
      await copyToClipboard('copy_link')
    }
  }, [getShareUrl, copyToClipboard])

  const downloadImage = useCallback(async () => {
    // Stub for Phase 2 (T009)
    setIsDownloading(false)
  }, [])

  return {
    copyLink,
    shareResult,
    downloadImage,
    isCopied,
    isDownloading,
    shareCardRef,
  }
}
