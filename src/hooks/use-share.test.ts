import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useShare } from './use-share'

const mockData = {
  nameA: 'Maria',
  incomeA: 450000,
  nameB: 'João',
  incomeB: 300000,
  expenses: 200000,
  houseworkA: 10,
  houseworkB: 5,
}

const mockTrackEvent = vi.fn()
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

vi.mock('~/stores/expense-store', () => ({
  useData: () => mockData,
}))

vi.mock('./use-track-event', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}))

const mockToPng = vi.fn()

vi.mock('html-to-image', () => ({
  toPng: (...args: unknown[]) => mockToPng(...args),
}))

vi.mock('~/lib/toast', () => ({
  toast: Object.assign(vi.fn(), {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
    info: vi.fn(),
    dismiss: vi.fn(),
    dismissAll: vi.fn(),
  }),
  subscribe: vi.fn(),
  getToasts: vi.fn(() => []),
}))

const mockClipboardWriteText = vi.fn().mockResolvedValue(undefined)

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockClipboardWriteText },
  writable: true,
  configurable: true,
})

describe('useShare', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    // @ts-expect-error -- resetting share for test isolation
    navigator.share = undefined
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the expected interface', () => {
    const { result } = renderHook(() => useShare())

    expect(result.current.copyLink).toBeTypeOf('function')
    expect(result.current.shareResult).toBeTypeOf('function')
    expect(result.current.downloadImage).toBeTypeOf('function')
    expect(result.current.isCopied).toBe(false)
    expect(result.current.isDownloading).toBe(false)
    expect(result.current.shareCardRef).toEqual({ current: null })
  })

  describe('copyLink', () => {
    it('copies the share URL to clipboard', async () => {
      const { result } = renderHook(() => useShare())

      await act(async () => {
        await result.current.copyLink()
      })

      expect(mockClipboardWriteText).toHaveBeenCalledTimes(1)
      expect(mockClipboardWriteText.mock.calls[0][0]).toContain('/results?')
      expect(mockClipboardWriteText.mock.calls[0][0]).toContain('a=Maria')
      expect(mockClipboardWriteText.mock.calls[0][0]).toContain('ra=450000')
    })

    it('shows success toast after copying link', async () => {
      const { result } = renderHook(() => useShare())

      await act(async () => {
        await result.current.copyLink()
      })

      expect(mockToastSuccess).toHaveBeenCalledWith('Link copiado!')
    })

    it('sets isCopied to true then resets after 2 seconds', async () => {
      const { result } = renderHook(() => useShare())

      await act(async () => {
        await result.current.copyLink()
      })

      expect(result.current.isCopied).toBe(true)

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(result.current.isCopied).toBe(false)
    })

    it('tracks result_shared event with channel copy_link', async () => {
      const { result } = renderHook(() => useShare())

      await act(async () => {
        await result.current.copyLink()
      })

      expect(mockTrackEvent).toHaveBeenCalledWith('result_shared', { channel: 'copy_link' })
    })

    it('handles clipboard write failure gracefully', async () => {
      mockClipboardWriteText.mockRejectedValueOnce(new Error('Not allowed'))

      const { result } = renderHook(() => useShare())

      await act(async () => {
        await result.current.copyLink()
      })

      expect(result.current.isCopied).toBe(false)
      expect(mockTrackEvent).not.toHaveBeenCalled()
      expect(mockToastError).toHaveBeenCalledWith('Erro ao copiar link')
    })
  })

  describe('shareResult', () => {
    it('falls back to clipboard when Web Share API is not available', async () => {
      const { result } = renderHook(() => useShare())

      await act(async () => {
        await result.current.shareResult()
      })

      expect(mockClipboardWriteText).toHaveBeenCalledTimes(1)
      expect(mockTrackEvent).toHaveBeenCalledWith('result_shared', { channel: 'copy_link' })
    })

    it('uses Web Share API when available', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined)
      navigator.share = mockShare

      const { result } = renderHook(() => useShare())

      await act(async () => {
        await result.current.shareResult()
      })

      expect(mockShare).toHaveBeenCalledWith({
        title: 'Conta Justa - Divisão de despesas',
        url: expect.stringContaining('/results?'),
      })
      expect(mockTrackEvent).toHaveBeenCalledWith('result_shared', { channel: 'share_api' })
    })

    it('does nothing when user cancels the share dialog', async () => {
      const abortError = new DOMException('User cancelled', 'AbortError')
      navigator.share = vi.fn().mockRejectedValue(abortError)

      const { result } = renderHook(() => useShare())

      await act(async () => {
        await result.current.shareResult()
      })

      expect(mockClipboardWriteText).not.toHaveBeenCalled()
      expect(mockTrackEvent).not.toHaveBeenCalled()
    })

    it('falls back to clipboard when Web Share API throws non-abort error', async () => {
      navigator.share = vi.fn().mockRejectedValue(new TypeError('Not supported'))

      const { result } = renderHook(() => useShare())

      await act(async () => {
        await result.current.shareResult()
      })

      expect(mockClipboardWriteText).toHaveBeenCalledTimes(1)
      expect(mockTrackEvent).toHaveBeenCalledWith('result_shared', { channel: 'copy_link' })
    })
  })

  describe('downloadImage', () => {
    it('does nothing when shareCardRef is null', async () => {
      const { result } = renderHook(() => useShare())

      await act(async () => {
        await result.current.downloadImage()
      })

      expect(result.current.isDownloading).toBe(false)
      expect(mockToastSuccess).not.toHaveBeenCalled()
      expect(mockToastError).not.toHaveBeenCalled()
    })

    it('shows success toast after downloading image', async () => {
      mockToPng.mockResolvedValueOnce('data:image/png;base64,abc')
      const mockClick = vi.fn()

      const { result } = renderHook(() => useShare())
      result.current.shareCardRef.current = document.createElement('div')

      vi.spyOn(document, 'createElement').mockReturnValueOnce({
        set download(_v: string) {},
        set href(_v: string) {},
        click: mockClick,
      } as unknown as HTMLAnchorElement)

      await act(async () => {
        await result.current.downloadImage()
      })

      expect(mockToastSuccess).toHaveBeenCalledWith('Imagem salva!')
    })

    it('shows error toast when image download fails', async () => {
      mockToPng.mockRejectedValueOnce(new Error('Canvas error'))

      const { result } = renderHook(() => useShare())
      result.current.shareCardRef.current = document.createElement('div')

      await act(async () => {
        await result.current.downloadImage()
      })

      expect(mockToastError).toHaveBeenCalledWith('Erro ao gerar imagem')
    })
  })
})
