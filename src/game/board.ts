import type { BoardState, Tile } from './types'

export const GRID_SIZE = 4

export const createEmptyBoard = (size = GRID_SIZE, nextId = 1): BoardState => ({
  tiles: [],
  size,
  nextId,
})

export const cloneBoard = (board: BoardState): BoardState => ({
  size: board.size,
  nextId: board.nextId,
  tiles: board.tiles.map((t) => ({ ...t })),
})

export const getTileAt = (
  board: BoardState,
  row: number,
  col: number,
): Tile | undefined => board.tiles.find((t) => t.row === row && t.col === col)

export const getEmptyCells = (board: BoardState): Array<{ row: number; col: number }> => {
  const occupied = new Set(board.tiles.map((t) => `${t.row},${t.col}`))
  const empty: Array<{ row: number; col: number }> = []
  for (let row = 0; row < board.size; row += 1) {
    for (let col = 0; col < board.size; col += 1) {
      if (!occupied.has(`${row},${col}`)) empty.push({ row, col })
    }
  }
  return empty
}

export const clearTransientFlags = (board: BoardState): BoardState => ({
  ...board,
  tiles: board.tiles.map((tile) => ({
    id: tile.id,
    value: tile.value,
    row: tile.row,
    col: tile.col,
  })),
})

export const getMaxTileValue = (board: BoardState): number => {
  if (board.tiles.length === 0) return 0
  return Math.max(...board.tiles.map((t) => t.value))
}

export const boardToMatrix = (board: BoardState): number[][] => {
  const matrix = Array.from({ length: board.size }, () =>
    Array.from({ length: board.size }, () => 0),
  )
  for (const tile of board.tiles) {
    matrix[tile.row][tile.col] = tile.value
  }
  return matrix
}
