import { renderHook } from '@testing-library/react'
import posthog from 'posthog-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTrackEvent } from './use-track-event'

vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
  },
}))

describe('useTrackEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should capture event when isReady is true and properties are provided', () => {
    const eventName = 'test_event'
    const properties = { key: 'value' }

    renderHook(() => useTrackEvent(eventName, properties, true))

    expect(posthog.capture).toHaveBeenCalledTimes(1)
    expect(posthog.capture).toHaveBeenCalledWith(eventName, properties)
  })

  it('should not capture event when isReady is false', () => {
    const eventName = 'test_event'
    const properties = { key: 'value' }

    renderHook(() => useTrackEvent(eventName, properties, false))

    expect(posthog.capture).not.toHaveBeenCalled()
  })

  it('should not capture event when properties is null', () => {
    const eventName = 'test_event'

    renderHook(() => useTrackEvent(eventName, null, true))

    expect(posthog.capture).not.toHaveBeenCalled()
  })

  it('should capture event only once even after re-renders', () => {
    const eventName = 'test_event'
    const properties = { key: 'value' }

    const { rerender } = renderHook(
      ({ isReady }) => useTrackEvent(eventName, properties, isReady),
      { initialProps: { isReady: true } }
    )

    expect(posthog.capture).toHaveBeenCalledTimes(1)

    rerender({ isReady: true })
    rerender({ isReady: true })

    expect(posthog.capture).toHaveBeenCalledTimes(1)
  })

  it('should not capture event if initially not ready then becomes ready after first track', () => {
    const eventName = 'test_event'
    const properties = { key: 'value' }

    const { rerender } = renderHook(
      ({ isReady }) => useTrackEvent(eventName, properties, isReady),
      { initialProps: { isReady: false } }
    )

    expect(posthog.capture).not.toHaveBeenCalled()

    rerender({ isReady: true })

    expect(posthog.capture).toHaveBeenCalledTimes(1)
    expect(posthog.capture).toHaveBeenCalledWith(eventName, properties)
  })

  it('should not capture event again after properties change', () => {
    const eventName = 'test_event'
    const initialProperties = { key: 'initial' }
    const updatedProperties = { key: 'updated' }

    const { rerender } = renderHook(
      ({ properties }) => useTrackEvent(eventName, properties, true),
      { initialProps: { properties: initialProperties } }
    )

    expect(posthog.capture).toHaveBeenCalledTimes(1)
    expect(posthog.capture).toHaveBeenCalledWith(eventName, initialProperties)

    rerender({ properties: updatedProperties })

    expect(posthog.capture).toHaveBeenCalledTimes(1)
  })
})
