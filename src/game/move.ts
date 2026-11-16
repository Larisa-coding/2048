import { clearTransientFlags, cloneBoard } from './board'
import type { BoardState, Direction, MoveResult, Tile } from './types'

interface LineCell {
  tile: Tile
  index: number
}

const getLineIndices = (
  size: number,
  direction: Direction,
  line: number,
): Array<{ row: number; col: number }> => {
  const cells: Array<{ row: number; col: number }> = []
  for (let i = 0; i < size; i += 1) {
    switch (direction) {
      case 'left':
        cells.push({ row: line, col: i })
        break
      case 'right':
        cells.push({ row: line, col: size - 1 - i })
        break
      case 'up':
        cells.push({ row: i, col: line })
        break
      case 'down':
        cells.push({ row: size - 1 - i, col: line })
        break
    }
  }
  return cells
}

const slideAndMergeLine = (
  tiles: Tile[],
  nextIdStart: number,
): { tiles: Tile[]; scoreGained: number; nextId: number; mergedValues: number[] } => {
  if (tiles.length === 0) {
    return { tiles: [], scoreGained: 0, nextId: nextIdStart, mergedValues: [] }
  }

  const result: Tile[] = []
  const mergedValues: number[] = []
  let scoreGained = 0
  let nextId = nextIdStart
  let i = 0

  while (i < tiles.length) {
    const current = tiles[i]
    const next = tiles[i + 1]

    if (next && current.value === next.value) {
      const mergedValue = current.value * 2
      const merged: Tile = {
        id: nextId,
        value: mergedValue,
        row: current.row,
        col: current.col,
        isMerged: true,
        mergedFrom: [current.id, next.id],
      }
      nextId += 1
      result.push(merged)
      scoreGained += mergedValue
      mergedValues.push(mergedValue)
      i += 2
    } else {
      result.push({ ...current })
      i += 1
    }
  }

  return { tiles: result, scoreGained, nextId, mergedValues }
}

export const applyMove = (board: BoardState, direction: Direction): MoveResult => {
  const cleaned = clearTransientFlags(board)
  const working = cloneBoard(cleaned)
  const size = working.size
  const byPos = new Map<string, Tile>()
  for (const tile of working.tiles) {
    byPos.set(`${tile.row},${tile.col}`, tile)
  }

  let nextId = working.nextId
  let scoreGained = 0
  let moved = false
  let merged = false
  const allMergedValues: number[] = []
  const newTiles: Tile[] = []

  for (let line = 0; line < size; line += 1) {
    const positions = getLineIndices(size, direction, line)
    const lineTiles: LineCell[] = []

    for (let index = 0; index < positions.length; index += 1) {
      const pos = positions[index]
      const tile = byPos.get(`${pos.row},${pos.col}`)
      if (tile) lineTiles.push({ tile, index })
    }

    const ordered = lineTiles.map((c) => c.tile)
    const {
      tiles: slid,
      scoreGained: gained,
      nextId: idAfter,
      mergedValues,
    } = slideAndMergeLine(ordered, nextId)

    nextId = idAfter
    scoreGained += gained
    if (mergedValues.length > 0) {
      merged = true
      allMergedValues.push(...mergedValues)
    }

    for (let i = 0; i < slid.length; i += 1) {
      const target = positions[i]
      const tile = slid[i]
      if (tile.row !== target.row || tile.col !== target.col) {
        moved = true
      }
      newTiles.push({
        ...tile,
        row: target.row,
        col: target.col,
      })
    }

    // Detect merges as movement even if positions of survivors match (rare edge)
    if (ordered.length !== slid.length) moved = true
  }

  if (!moved) {
    return {
      board: cleaned,
      scoreGained: 0,
      moved: false,
      merged: false,
      mergedValues: [],
    }
  }

  return {
    board: {
      size,
      nextId,
      tiles: newTiles,
    },
    scoreGained,
    moved: true,
    merged,
    mergedValues: allMergedValues,
  }
}
