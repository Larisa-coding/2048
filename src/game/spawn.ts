import { getEmptyCells } from './board'
import { nextFloat, nextInt, type RngState } from './rng'
import type { BoardState, Tile } from './types'

export const pickSpawnValue = (
  rng: RngState,
): { value: number; state: RngState } => {
  const { value: roll, state } = nextFloat(rng)
  return { value: roll < 0.9 ? 2 : 4, state }
}

export const spawnTile = (
  board: BoardState,
  rng: RngState,
): { board: BoardState; rng: RngState } | null => {
  const empty = getEmptyCells(board)
  if (empty.length === 0) return null

  const { value: cellIndex, state: afterPick } = nextInt(rng, empty.length)
  const cell = empty[cellIndex]
  const { value, state: afterValue } = pickSpawnValue(afterPick)

  const tile: Tile = {
    id: board.nextId,
    value,
    row: cell.row,
    col: cell.col,
    isNew: true,
  }

  return {
    board: {
      ...board,
      nextId: board.nextId + 1,
      tiles: [...board.tiles, tile],
    },
    rng: afterValue,
  }
}

export const spawnInitialTiles = (
  board: BoardState,
  rng: RngState,
): { board: BoardState; rng: RngState } => {
  let nextBoard = board
  let nextRng = rng
  for (let i = 0; i < 2; i += 1) {
    const spawned = spawnTile(nextBoard, nextRng)
    if (!spawned) break
    nextBoard = spawned.board
    nextRng = spawned.rng
  }
  return { board: nextBoard, rng: nextRng }
}
