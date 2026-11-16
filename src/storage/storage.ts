import type {
  GameMode,
  GameState,
  SettingsState,
  StatsState,
  UndoSnapshot,
} from '../game/types'

export const STORAGE_KEY = 'game2048'
export const SCHEMA_VERSION = 1

export interface PersistedPayload {
  version: number
  settings: SettingsState
  stats: StatsState
  bestByMode: Record<GameMode, number>
  activeGame: GameState | null
  undo: UndoSnapshot | null
}

export const defaultModeStats = () => ({
  gamesPlayed: 0,
  wins: 0,
  bestScore: 0,
  maxTile: 0,
  totalMerges: 0,
})

export const defaultStats = (): StatsState => ({
  classic: defaultModeStats(),
  endless: defaultModeStats(),
  daily: {
    gamesPlayed: 0,
    bestScore: 0,
    maxTile: 0,
  },
})

export const defaultSettings = (): SettingsState => ({
  theme: 'light',
  soundEnabled: true,
  mode: 'classic',
})

export const defaultPayload = (): PersistedPayload => ({
  version: SCHEMA_VERSION,
  settings: defaultSettings(),
  stats: defaultStats(),
  bestByMode: { classic: 0, endless: 0, daily: 0 },
  activeGame: null,
  undo: null,
})

export type StorageAvailability = 'ok' | 'unavailable' | 'corrupt'

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const isGameMode = (v: unknown): v is GameMode =>
  v === 'classic' || v === 'endless' || v === 'daily'

const sanitizeSettings = (raw: unknown): SettingsState => {
  const base = defaultSettings()
  if (!isObject(raw)) return base
  return {
    theme: raw.theme === 'dark' ? 'dark' : 'light',
    soundEnabled: typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : base.soundEnabled,
    mode: isGameMode(raw.mode) ? raw.mode : base.mode,
  }
}

const sanitizeModeStats = (raw: unknown) => {
  const base = defaultModeStats()
  if (!isObject(raw)) return base
  return {
    gamesPlayed: Number(raw.gamesPlayed) || 0,
    wins: Number(raw.wins) || 0,
    bestScore: Number(raw.bestScore) || 0,
    maxTile: Number(raw.maxTile) || 0,
    totalMerges: Number(raw.totalMerges) || 0,
  }
}

const sanitizeStats = (raw: unknown): StatsState => {
  const base = defaultStats()
  if (!isObject(raw)) return base
  const dailyRaw = isObject(raw.daily) ? raw.daily : {}
  return {
    classic: sanitizeModeStats(raw.classic),
    endless: sanitizeModeStats(raw.endless),
    daily: {
      gamesPlayed: Number(dailyRaw.gamesPlayed) || 0,
      bestScore: Number(dailyRaw.bestScore) || 0,
      maxTile: Number(dailyRaw.maxTile) || 0,
      lastDate: typeof dailyRaw.lastDate === 'string' ? dailyRaw.lastDate : undefined,
    },
  }
}

const sanitizeBest = (raw: unknown): Record<GameMode, number> => {
  const base = { classic: 0, endless: 0, daily: 0 }
  if (!isObject(raw)) return base
  return {
    classic: Number(raw.classic) || 0,
    endless: Number(raw.endless) || 0,
    daily: Number(raw.daily) || 0,
  }
}

/** Lightweight validation — drop active game if structurally broken */
const sanitizeActiveGame = (raw: unknown): GameState | null => {
  if (!isObject(raw)) return null
  if (!isObject(raw.board) || !Array.isArray(raw.board.tiles)) return null
  if (!isGameMode(raw.mode)) return null
  if (typeof raw.score !== 'number' || typeof raw.rngSeed !== 'number') return null

  return {
    board: {
      size: Number(raw.board.size) || 4,
      nextId: Number(raw.board.nextId) || 1,
      tiles: raw.board.tiles
        .filter(isObject)
        .map((t) => ({
          id: Number(t.id),
          value: Number(t.value),
          row: Number(t.row),
          col: Number(t.col),
        }))
        .filter((t) => t.id > 0 && t.value > 0),
    },
    score: Number(raw.score) || 0,
    bestScore: Number(raw.bestScore) || 0,
    status:
      raw.status === 'won' ||
      raw.status === 'continued' ||
      raw.status === 'lost' ||
      raw.status === 'playing'
        ? raw.status
        : 'playing',
    mode: raw.mode,
    moves: Number(raw.moves) || 0,
    maxTile: Number(raw.maxTile) || 0,
    merges: Number(raw.merges) || 0,
    wonOnce: Boolean(raw.wonOnce),
    dailyDate: typeof raw.dailyDate === 'string' ? raw.dailyDate : undefined,
    rngSeed: Number(raw.rngSeed) || 0,
  }
}

const sanitizeUndo = (raw: unknown): UndoSnapshot | null => {
  if (!isObject(raw) || !isObject(raw.board) || !Array.isArray(raw.board.tiles)) return null
  return {
    board: {
      size: Number(raw.board.size) || 4,
      nextId: Number(raw.board.nextId) || 1,
      tiles: raw.board.tiles
        .filter(isObject)
        .map((t) => ({
          id: Number(t.id),
          value: Number(t.value),
          row: Number(t.row),
          col: Number(t.col),
        }))
        .filter((t) => t.id > 0 && t.value > 0),
    },
    score: Number(raw.score) || 0,
    status:
      raw.status === 'won' ||
      raw.status === 'continued' ||
      raw.status === 'lost' ||
      raw.status === 'playing'
        ? raw.status
        : 'playing',
    moves: Number(raw.moves) || 0,
    maxTile: Number(raw.maxTile) || 0,
    merges: Number(raw.merges) || 0,
    wonOnce: Boolean(raw.wonOnce),
    rngSeed: Number(raw.rngSeed) || 0,
  }
}

export const parsePayload = (
  raw: string | null,
): { payload: PersistedPayload; status: StorageAvailability } => {
  if (raw == null) return { payload: defaultPayload(), status: 'ok' }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isObject(parsed)) {
      return { payload: defaultPayload(), status: 'corrupt' }
    }

    // Future migrations would branch on parsed.version
    const payload: PersistedPayload = {
      version: SCHEMA_VERSION,
      settings: sanitizeSettings(parsed.settings),
      stats: sanitizeStats(parsed.stats),
      bestByMode: sanitizeBest(parsed.bestByMode),
      activeGame: sanitizeActiveGame(parsed.activeGame),
      undo: sanitizeUndo(parsed.undo),
    }
    return { payload, status: 'ok' }
  } catch {
    return { payload: defaultPayload(), status: 'corrupt' }
  }
}

export const loadPersisted = (): {
  payload: PersistedPayload
  status: StorageAvailability
} => {
  try {
    if (typeof localStorage === 'undefined') {
      return { payload: defaultPayload(), status: 'unavailable' }
    }
    return parsePayload(localStorage.getItem(STORAGE_KEY))
  } catch {
    return { payload: defaultPayload(), status: 'unavailable' }
  }
}

export const savePersisted = (payload: PersistedPayload): StorageAvailability => {
  try {
    if (typeof localStorage === 'undefined') return 'unavailable'
    const toSave: PersistedPayload = {
      ...payload,
      version: SCHEMA_VERSION,
      // Never persist animation flags
      activeGame: payload.activeGame
        ? {
            ...payload.activeGame,
            board: {
              ...payload.activeGame.board,
              tiles: payload.activeGame.board.tiles.map(
                ({ isNew: _n, isMerged: _m, mergedFrom: _f, ...rest }) => rest,
              ),
            },
          }
        : null,
      undo: payload.undo
        ? {
            ...payload.undo,
            board: {
              ...payload.undo.board,
              tiles: payload.undo.board.tiles.map(
                ({ isNew: _n, isMerged: _m, mergedFrom: _f, ...rest }) => rest,
              ),
            },
          }
        : null,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    return 'ok'
  } catch {
    return 'unavailable'
  }
}

export const clearPersisted = (): StorageAvailability => {
  try {
    if (typeof localStorage === 'undefined') return 'unavailable'
    localStorage.removeItem(STORAGE_KEY)
    return 'ok'
  } catch {
    return 'unavailable'
  }
}
