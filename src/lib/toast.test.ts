import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getToasts, subscribe, toast } from './toast'

beforeEach(() => {
  toast.dismissAll()
})

describe('toast.success', () => {
  it('adds a toast with variant success and 3000ms duration', () => {
    toast.success('Link copiado!')

    const toasts = getToasts()
    expect(toasts).toHaveLength(1)
    expect(toasts[0]).toMatchObject({
      message: 'Link copiado!',
      variant: 'success',
      duration: 3000,
    })
  })
})

describe('toast.error', () => {
  it('adds a toast with variant error and 5000ms duration', () => {
    toast.error('Erro ao gerar imagem')

    const toasts = getToasts()
    expect(toasts).toHaveLength(1)
    expect(toasts[0]).toMatchObject({
      message: 'Erro ao gerar imagem',
      variant: 'error',
      duration: 5000,
    })
  })
})

describe('toast.info', () => {
  it('adds a toast with variant info and 5000ms duration', () => {
    toast.info('Link de compartilhamento inválido')

    const toasts = getToasts()
    expect(toasts).toHaveLength(1)
    expect(toasts[0]).toMatchObject({
      message: 'Link de compartilhamento inválido',
      variant: 'info',
      duration: 5000,
    })
  })
})

describe('toast base function', () => {
  it('defaults to info variant when no variant specified', () => {
    toast('Mensagem genérica')

    const toasts = getToasts()
    expect(toasts[0]).toMatchObject({
      variant: 'info',
      duration: 5000,
    })
  })

  it('accepts custom duration that overrides default', () => {
    toast.success('Rápido', 1000)

    const toasts = getToasts()
    expect(toasts[0].duration).toBe(1000)
  })
})

describe('toast.dismiss', () => {
  it('removes a specific toast by ID', () => {
    const id1 = toast.success('Primeiro')
    toast.success('Segundo')

    toast.dismiss(id1)

    const toasts = getToasts()
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('Segundo')
  })

  it('does nothing when ID does not exist', () => {
    toast.success('Existente')

    toast.dismiss(999)

    expect(getToasts()).toHaveLength(1)
  })
})

describe('toast.dismissAll', () => {
  it('clears all toasts', () => {
    toast.success('Primeiro')
    toast.error('Segundo')
    toast.info('Terceiro')

    toast.dismissAll()

    expect(getToasts()).toHaveLength(0)
  })
})

describe('subscribe', () => {
  it('fires callback with current toasts array on add', () => {
    const callback = vi.fn()
    subscribe(callback)

    toast.success('Nova')

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ message: 'Nova' })]))
  })

  it('fires callback on dismiss', () => {
    const callback = vi.fn()
    const id = toast.success('Para remover')
    subscribe(callback)

    toast.dismiss(id)

    expect(callback).toHaveBeenCalledWith([])
  })

  it('returns unsubscribe function that stops notifications', () => {
    const callback = vi.fn()
    const unsubscribe = subscribe(callback)

    toast.success('Antes')
    expect(callback).toHaveBeenCalledTimes(1)

    unsubscribe()

    toast.success('Depois')
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('isolates subscriber failures from other subscribers', () => {
    const badCallback = vi.fn(() => {
      throw new Error('Subscriber error')
    })
    const goodCallback = vi.fn()

    subscribe(badCallback)
    subscribe(goodCallback)

    toast.success('Teste')

    expect(badCallback).toHaveBeenCalledTimes(1)
    expect(goodCallback).toHaveBeenCalledTimes(1)
  })
})

describe('IDs', () => {
  it('auto-increments IDs across sequential calls', () => {
    const id1 = toast.success('Primeiro')
    const id2 = toast.error('Segundo')
    const id3 = toast.info('Terceiro')

    expect(id2).toBe(id1 + 1)
    expect(id3).toBe(id2 + 1)
  })

  it('returns the toast ID from variant helpers', () => {
    const id = toast.success('Teste')

    expect(typeof id).toBe('number')
    expect(getToasts()[0].id).toBe(id)
  })
})

describe('getToasts', () => {
  it('returns a snapshot copy, not a reference', () => {
    toast.success('Teste')

    const snapshot1 = getToasts()
    const snapshot2 = getToasts()

    expect(snapshot1).toEqual(snapshot2)
    expect(snapshot1).not.toBe(snapshot2)
  })

  it('returns empty array when no toasts exist', () => {
    expect(getToasts()).toEqual([])
  })
})
