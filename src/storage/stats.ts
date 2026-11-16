import type { GameMode, GameState, StatsState } from '../game/types'
import { defaultModeStats, defaultStats } from './storage'

export const recordGameEnd = (
  stats: StatsState,
  state: GameState,
  isWin: boolean,
): StatsState => {
  const next = structuredClone(stats)

  if (state.mode === 'daily') {
    next.daily.gamesPlayed += 1
    next.daily.bestScore = Math.max(next.daily.bestScore, state.score)
    next.daily.maxTile = Math.max(next.daily.maxTile, state.maxTile)
    next.daily.lastDate = state.dailyDate
    return next
  }

  const key: 'classic' | 'endless' = state.mode
  const bucket = next[key]
  bucket.gamesPlayed += 1
  if (isWin) bucket.wins += 1
  bucket.bestScore = Math.max(bucket.bestScore, state.score)
  bucket.maxTile = Math.max(bucket.maxTile, state.maxTile)
  bucket.totalMerges += state.merges
  return next
}

export const updateLiveStats = (stats: StatsState, state: GameState): StatsState => {
  const next = structuredClone(stats)
  if (state.mode === 'daily') {
    next.daily.bestScore = Math.max(next.daily.bestScore, state.score)
    next.daily.maxTile = Math.max(next.daily.maxTile, state.maxTile)
    next.daily.lastDate = state.dailyDate
    return next
  }
  const key: 'classic' | 'endless' = state.mode
  next[key].bestScore = Math.max(next[key].bestScore, state.score)
  next[key].maxTile = Math.max(next[key].maxTile, state.maxTile)
  return next
}

export const resetStats = (): StatsState => defaultStats()

export const bestForMode = (stats: StatsState, mode: GameMode): number => {
  if (mode === 'daily') return stats.daily.bestScore
  return stats[mode].bestScore
}

export { defaultModeStats, defaultStats }
