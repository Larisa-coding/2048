import { useEffect, useRef } from 'react'
import type { Direction } from '../game/types'

interface UseKeyboardOptions {
  onMove: (direction: Direction) => void
  onUndo: () => void
  onNewGame: () => void
  enabled?: boolean
}

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
}

export const useKeyboard = ({
  onMove,
  onUndo,
  onNewGame,
  enabled = true,
}: UseKeyboardOptions): void => {
  const refs = useRef({ onMove, onUndo, onNewGame })

  useEffect(() => {
    refs.current = { onMove, onUndo, onNewGame }
  }, [onMove, onUndo, onNewGame])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }

      if (event.key in KEY_MAP) {
        event.preventDefault()
        refs.current.onMove(KEY_MAP[event.key])
        return
      }

      if (event.key === 'z' || event.key === 'Z') {
        event.preventDefault()
        refs.current.onUndo()
        return
      }

      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault()
        refs.current.onNewGame()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}
