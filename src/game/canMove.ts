import { getEmptyCells, getTileAt } from './board'
import type { BoardState, Direction } from './types'
import { applyMove } from './move'

export const canMoveInDirection = (board: BoardState, direction: Direction): boolean =>
  applyMove(board, direction).moved

export const hasAnyMove = (board: BoardState): boolean => {
  if (getEmptyCells(board).length > 0) return true

  const { size } = board
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const tile = getTileAt(board, row, col)
      if (!tile) continue
      const right = getTileAt(board, row, col + 1)
      const down = getTileAt(board, row + 1, col)
      if (right && right.value === tile.value) return true
      if (down && down.value === tile.value) return true
    }
  }
  return false
}
