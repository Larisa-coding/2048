import { useRef } from 'react'
import { GRID_SIZE } from '../game/board'
import type { Tile } from '../game/types'
import { useSwipe } from '../hooks/useSwipe'
import type { Direction } from '../game/types'

const GAP_PCT = 3.2
const CELL_PCT = (100 - GAP_PCT * 3) / 4

const tileClass = (value: number): string => {
  if (value <= 2048) return `tile-${value}`
  return 'tile-super'
}

interface BoardProps {
  tiles: Tile[]
  onMove: (direction: Direction) => void
  disabled?: boolean
}

export const Board = ({ tiles, onMove, disabled }: BoardProps) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  useSwipe(wrapRef, { onSwipe: onMove, enabled: !disabled })

  return (
    <div className="board-wrap" ref={wrapRef} aria-label="Игровое поле 2048">
      <div className="board" role="grid" aria-rowcount={GRID_SIZE} aria-colcount={GRID_SIZE}>
        <div className="board-grid">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => (
            <div className="cell" key={i} role="presentation" />
          ))}
        </div>
        <div className="tiles-layer">
          {tiles.map((t) => {
            const left = t.col * (CELL_PCT + GAP_PCT)
            const top = t.row * (CELL_PCT + GAP_PCT)
            const classes = [
              'tile',
              tileClass(t.value),
              t.isNew ? 'tile-new' : '',
              t.isMerged ? 'tile-merged' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <div
                key={t.id}
                className={classes}
                style={{ left: `${left}%`, top: `${top}%` }}
                role="gridcell"
                aria-label={`Плитка ${t.value}`}
              >
                <span>{t.value}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
