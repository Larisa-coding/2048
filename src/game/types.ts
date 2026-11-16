export type Direction = 'up' | 'down' | 'left' | 'right'

export type GameMode = 'classic' | 'endless' | 'daily'

export type GameStatus = 'playing' | 'won' | 'continued' | 'lost'

export interface Tile {
  id: number
  value: number
  row: number
  col: number
  /** True for one render cycle after spawn */
  isNew?: boolean
  /** True for one render cycle after merge */
  isMerged?: boolean
  /** Ids of tiles this one merged from (animation helper) */
  mergedFrom?: [number, number]
}

export interface BoardState {
  tiles: Tile[]
  size: number
  nextId: number
}

export interface MoveResult {
  board: BoardState
  scoreGained: number
  moved: boolean
  merged: boolean
  mergedValues: number[]
}

export interface GameState {
  board: BoardState
  score: number
  bestScore: number
  status: GameStatus
  mode: GameMode
  moves: number
  maxTile: number
  merges: number
  /** Whether classic win modal was already shown this session */
  wonOnce: boolean
  dailyDate?: string
  /** Current Mulberry32 internal seed */
  rngSeed: number
}

export interface UndoSnapshot {
  board: BoardState
  score: number
  status: GameStatus
  moves: number
  maxTile: number
  merges: number
  wonOnce: boolean
  rngSeed: number
}

export interface ModeStats {
  gamesPlayed: number
  wins: number
  bestScore: number
  maxTile: number
  totalMerges: number
}

export interface DailyStats {
  gamesPlayed: number
  bestScore: number
  maxTile: number
  lastDate?: string
}

export interface StatsState {
  classic: ModeStats
  endless: ModeStats
  daily: DailyStats
}

export interface SettingsState {
  theme: 'light' | 'dark'
  soundEnabled: boolean
  mode: GameMode
}
