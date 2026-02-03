import { toPng } from 'html-to-image'
import { useCallback, useRef, useState } from 'react'
import { toast } from '~/components/ui'
import { buildShareUrl } from '~/lib/share-url'
import { useData } from '~/stores/expense-store'
import { trackEvent } from './use-track-event'

const siteUrl = import.meta.env.VITE_SITE_URL as string

export function useShare() {
  const [isCopied, setIsCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)

  const data = useData()

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
        toast.success('Link copiado!')
        setTimeout(() => setIsCopied(false), 2000) // 2s - quick visual feedback without disrupting navigation flow
      } catch {
        toast.error('Erro ao copiar link')
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
    if (!shareCardRef.current || isDownloading) return

    setIsDownloading(true)
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = 'conta-justa.png'
      link.href = dataUrl
      link.click()
      trackEvent('result_shared', { channel: 'image_download' })
      toast.success('Imagem salva!')
    } catch {
      toast.error('Erro ao gerar imagem')
    } finally {
      setIsDownloading(false)
    }
  }, [isDownloading])

  return {
    copyLink,
    shareResult,
    downloadImage,
    isCopied,
    isDownloading,
    shareCardRef,
  }
}
