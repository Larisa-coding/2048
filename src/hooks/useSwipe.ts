import { useEffect, useRef, type RefObject } from 'react'
import type { Direction } from '../game/types'

const THRESHOLD = 28

interface UseSwipeOptions {
  onSwipe: (direction: Direction) => void
  enabled?: boolean
}

export const useSwipe = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  { onSwipe, enabled = true }: UseSwipeOptions,
): void => {
  const start = useRef<{ x: number; y: number } | null>(null)
  const onSwipeRef = useRef(onSwipe)

  useEffect(() => {
    onSwipeRef.current = onSwipe
  }, [onSwipe])

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    const handleStart = (clientX: number, clientY: number) => {
      start.current = { x: clientX, y: clientY }
    }

    const handleEnd = (clientX: number, clientY: number) => {
      if (!start.current) return
      const dx = clientX - start.current.x
      const dy = clientY - start.current.y
      start.current = null

      const absX = Math.abs(dx)
      const absY = Math.abs(dy)
      if (Math.max(absX, absY) < THRESHOLD) return

      if (absX > absY) {
        onSwipeRef.current(dx > 0 ? 'right' : 'left')
      } else {
        onSwipeRef.current(dy > 0 ? 'down' : 'up')
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      handleStart(e.touches[0].clientX, e.touches[0].clientY)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!start.current) return
      e.preventDefault()
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!start.current || e.changedTouches.length === 0) return
      handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
    }

    const onTouchCancel = () => {
      start.current = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchCancel)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchCancel)
    }
  }, [ref, enabled])
}
