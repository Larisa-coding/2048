import { clearTransientFlags, cloneBoard, createEmptyBoard, getMaxTileValue } from './board'
import { hasAnyMove } from './canMove'
import { getLocalDateKey, seedFromDate } from './daily'
import { applyMove } from './move'
import { createRngState, randomSeed } from './rng'
import { spawnInitialTiles, spawnTile } from './spawn'
import type {
  Direction,
  GameMode,
  GameState,
  GameStatus,
  MoveResult,
  UndoSnapshot,
} from './types'

export interface PlayMoveResult {
  state: GameState
  move: MoveResult
  spawned: boolean
  reached2048: boolean
  becameLost: boolean
  snapshot: UndoSnapshot
}

export const createGameState = (
  mode: GameMode,
  bestScore = 0,
  options?: { seed?: number; dailyDate?: string },
): GameState => {
  let seed: number
  let dailyDate: string | undefined

  if (mode === 'daily') {
    dailyDate = options?.dailyDate ?? getLocalDateKey()
    seed = options?.seed ?? seedFromDate(dailyDate)
  } else {
    seed = options?.seed ?? randomSeed()
  }

  const { board, rng } = spawnInitialTiles(createEmptyBoard(), createRngState(seed))

  return {
    board,
    score: 0,
    bestScore,
    status: 'playing',
    mode,
    moves: 0,
    maxTile: getMaxTileValue(board),
    merges: 0,
    wonOnce: false,
    dailyDate,
    rngSeed: rng.seed,
  }
}

export const snapshotFromState = (state: GameState): UndoSnapshot => ({
  board: clearTransientFlags(cloneBoard(state.board)),
  score: state.score,
  status: state.status,
  moves: state.moves,
  maxTile: state.maxTile,
  merges: state.merges,
  wonOnce: state.wonOnce,
  rngSeed: state.rngSeed,
})

export const restoreSnapshot = (
  state: GameState,
  snapshot: UndoSnapshot,
): GameState => ({
  ...state,
  board: cloneBoard(snapshot.board),
  score: snapshot.score,
  status: snapshot.status,
  moves: snapshot.moves,
  maxTile: snapshot.maxTile,
  merges: snapshot.merges,
  wonOnce: snapshot.wonOnce,
  rngSeed: snapshot.rngSeed,
})

export const playMove = (state: GameState, direction: Direction): PlayMoveResult | null => {
  if (state.status === 'lost') return null

  const snapshot = snapshotFromState(state)
  const move = applyMove(state.board, direction)
  if (!move.moved) return null

  const spawned = spawnTile(move.board, createRngState(state.rngSeed))
  const board = spawned?.board ?? move.board
  const nextSeed = spawned?.rng.seed ?? state.rngSeed

  const score = state.score + move.scoreGained
  const maxTile = Math.max(state.maxTile, getMaxTileValue(board))
  const merges = state.merges + move.mergedValues.length
  const moves = state.moves + 1

  let status: GameStatus = state.status
  let wonOnce = state.wonOnce
  let reached2048 = false
  let becameLost = false

  const hit2048 =
    state.mode === 'classic' &&
    !wonOnce &&
    (move.mergedValues.includes(2048) || maxTile >= 2048)

  if (hit2048) {
    status = 'won'
    wonOnce = true
    reached2048 = true
  }

  if (!hasAnyMove(board)) {
    status = 'lost'
    becameLost = true
  }

  const nextState: GameState = {
    ...state,
    board,
    score,
    bestScore: Math.max(state.bestScore, score),
    status,
    moves,
    maxTile,
    merges,
    wonOnce,
    rngSeed: nextSeed,
  }

  return {
    state: nextState,
    move,
    spawned: Boolean(spawned),
    reached2048,
    becameLost,
    snapshot,
  }
}

export const continueAfterWin = (state: GameState): GameState => {
  if (state.status !== 'won') return state
  if (!hasAnyMove(state.board)) {
    return { ...state, status: 'lost' }
  }
  return { ...state, status: 'continued' }
}

export const restartGame = (
  mode: GameMode,
  bestScore: number,
  options?: { seed?: number; dailyDate?: string },
): GameState => createGameState(mode, bestScore, options)
