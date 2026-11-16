import { useCallback, useEffect, useRef, useState } from 'react'
import { playSound, unlockAudio } from '../audio/sounds'
import { getLocalDateKey } from '../game/daily'
import {
  continueAfterWin,
  createGameState,
  playMove,
  restartGame,
  restoreSnapshot,
} from '../game/game'
import type { Direction, GameMode, GameState, UndoSnapshot } from '../game/types'
import { bestForMode, recordGameEnd, resetStats, updateLiveStats } from '../storage/stats'
import {
  clearPersisted,
  defaultPayload,
  loadPersisted,
  savePersisted,
  type PersistedPayload,
  type StorageAvailability,
} from '../storage/storage'

export type ModalKind =
  | null
  | 'rules'
  | 'settings'
  | 'stats'
  | 'win'
  | 'gameover'
  | 'confirmNew'
  | 'confirmReset'

export interface GameController {
  state: GameState
  undo: UndoSnapshot | null
  settings: PersistedPayload['settings']
  stats: PersistedPayload['stats']
  bestByMode: PersistedPayload['bestByMode']
  storageStatus: StorageAvailability
  scoreDelta: number
  showNewRecord: boolean
  modal: ModalKind
  moveLocked: boolean
  handleMove: (direction: Direction) => void
  handleUndo: () => void
  requestNewGame: () => void
  confirmNewGame: () => void
  cancelModal: () => void
  openModal: (kind: Exclude<ModalKind, null | 'win' | 'gameover'>) => void
  handleContinue: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setSoundEnabled: (enabled: boolean) => void
  setMode: (mode: GameMode) => void
  handleResetStats: () => void
  dismissStorageBanner: () => void
  storageBannerVisible: boolean
}

const shouldRestoreGame = (game: GameState | null, mode: GameMode): game is GameState => {
  if (!game) return false
  if (game.mode !== mode) return false
  if (game.status === 'lost') return false
  if (mode === 'daily' && game.dailyDate !== getLocalDateKey()) return false
  return true
}

const boot = loadPersisted()

const createInitialState = (): GameState => {
  const p = boot.payload
  if (shouldRestoreGame(p.activeGame, p.settings.mode)) {
    return {
      ...p.activeGame,
      bestScore: Math.max(
        p.activeGame.bestScore,
        bestForMode(p.stats, p.activeGame.mode),
        p.bestByMode[p.activeGame.mode],
      ),
    }
  }
  const mode = p.settings.mode
  const best = Math.max(bestForMode(p.stats, mode), p.bestByMode[mode])
  return createGameState(mode, best)
}

export const useGame = (): GameController => {
  const payloadRef = useRef(boot.payload)
  const stateRef = useRef<GameState | null>(null)
  const undoRef = useRef<UndoSnapshot | null>(null)
  const settingsRef = useRef(boot.payload.settings)
  const statsRef = useRef(boot.payload.stats)
  const bestRef = useRef(boot.payload.bestByMode)
  const moveLockedRef = useRef(false)
  const modalRef = useRef<ModalKind>(null)
  const recordedEnd = useRef(false)
  const bumpTimer = useRef<number | null>(null)
  const recordTimer = useRef<number | null>(null)
  const lockTimer = useRef<number | null>(null)

  const [storageStatus] = useState(boot.status)
  const [storageBannerVisible, setStorageBannerVisible] = useState(boot.status !== 'ok')
  const [settings, setSettings] = useState(boot.payload.settings)
  const [stats, setStats] = useState(boot.payload.stats)
  const [bestByMode, setBestByMode] = useState(boot.payload.bestByMode)

  const [state, setState] = useState<GameState>(createInitialState)

  const [undo, setUndo] = useState<UndoSnapshot | null>(() => {
    const p = boot.payload
    if (shouldRestoreGame(p.activeGame, p.settings.mode)) return p.undo
    return null
  })

  const [modal, setModal] = useState<ModalKind>(null)
  const [scoreDelta, setScoreDelta] = useState(0)
  const [showNewRecord, setShowNewRecord] = useState(false)
  const [moveLocked, setMoveLocked] = useState(false)

  useEffect(() => {
    stateRef.current = state
    undoRef.current = undo
    settingsRef.current = settings
    statsRef.current = stats
    bestRef.current = bestByMode
    moveLockedRef.current = moveLocked
    modalRef.current = modal
  }, [state, undo, settings, stats, bestByMode, moveLocked, modal])

  const persist = useCallback((patch: Partial<PersistedPayload>) => {
    payloadRef.current = { ...payloadRef.current, ...patch }
    savePersisted(payloadRef.current)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', settings.theme === 'dark' ? '#1A1917' : '#FAF8F4')
    }
  }, [settings.theme])

  useEffect(() => {
    persist({
      activeGame: state.status === 'lost' ? null : state,
      undo: state.status === 'lost' ? null : undo,
      settings,
      stats,
      bestByMode,
    })
  }, [state, undo, settings, stats, bestByMode, persist])

  const flashDelta = (gained: number) => {
    setScoreDelta(gained)
    if (bumpTimer.current) window.clearTimeout(bumpTimer.current)
    bumpTimer.current = window.setTimeout(() => setScoreDelta(0), 700)
  }

  const flashRecord = () => {
    setShowNewRecord(true)
    if (recordTimer.current) window.clearTimeout(recordTimer.current)
    recordTimer.current = window.setTimeout(() => setShowNewRecord(false), 1800)
  }

  const lockMovesBriefly = () => {
    setMoveLocked(true)
    if (lockTimer.current) window.clearTimeout(lockTimer.current)
    lockTimer.current = window.setTimeout(() => setMoveLocked(false), 150)
  }

  const handleMove = useCallback((direction: Direction) => {
    const current = stateRef.current
    if (!current) return
    if (moveLockedRef.current) return
    const openModalKind = modalRef.current
    if (openModalKind === 'win' || openModalKind === 'gameover' || openModalKind === 'confirmNew') {
      return
    }

    void unlockAudio()

    const result = playMove(current, direction)
    if (!result) return

    lockMovesBriefly()
    setUndo(result.snapshot)

    if (result.move.scoreGained > 0) flashDelta(result.move.scoreGained)

    const prevBest = Math.max(
      bestRef.current[result.state.mode],
      bestForMode(statsRef.current, result.state.mode),
    )
    const isNewRecord = result.state.score > prevBest && result.state.score > current.score
    const soundOn = settingsRef.current.soundEnabled

    if (isNewRecord) {
      flashRecord()
      playSound('record', soundOn)
      setBestByMode((b) => ({ ...b, [result.state.mode]: result.state.score }))
    } else if (result.move.merged) {
      playSound('merge', soundOn)
    } else {
      playSound('move', soundOn)
    }

    setStats((s) => updateLiveStats(s, result.state))

    if (result.reached2048 && result.state.mode === 'classic') {
      playSound('win', soundOn)
      setModal('win')
    }

    if (result.becameLost) {
      playSound('gameover', soundOn)
      if (!recordedEnd.current) {
        recordedEnd.current = true
        const isWin = result.state.wonOnce || result.state.maxTile >= 2048
        setStats((s) => recordGameEnd(s, result.state, isWin))
      }
      setModal('gameover')
      setUndo(null)
    }

    setState({
      ...result.state,
      bestScore: Math.max(result.state.bestScore, prevBest, result.state.score),
    })
  }, [])

  const handleUndo = useCallback(() => {
    const snapshot = undoRef.current
    const current = stateRef.current
    if (!snapshot || !current || moveLockedRef.current) return
    const restored = restoreSnapshot(current, snapshot)
    setState({
      ...restored,
      bestScore: Math.max(restored.bestScore, bestRef.current[restored.mode]),
    })
    setUndo(null)
    setModal(null)
    recordedEnd.current = false
  }, [])

  const startFresh = useCallback((mode: GameMode = settingsRef.current.mode) => {
    const best = Math.max(bestForMode(statsRef.current, mode), bestRef.current[mode])
    setState(restartGame(mode, best))
    setUndo(null)
    setModal(null)
    setScoreDelta(0)
    recordedEnd.current = false
  }, [])

  const requestNewGame = useCallback(() => {
    const current = stateRef.current
    if (!current) return
    if (current.moves > 0 && current.status !== 'lost') {
      setModal('confirmNew')
      return
    }
    startFresh()
  }, [startFresh])

  const confirmNewGame = useCallback(() => {
    const current = stateRef.current
    if (current && current.status !== 'lost' && current.moves > 0 && !recordedEnd.current) {
      const isWin = current.wonOnce || current.maxTile >= 2048
      setStats((s) => recordGameEnd(s, current, isWin))
      recordedEnd.current = true
    }
    startFresh()
  }, [startFresh])

  const cancelModal = useCallback(() => {
    if (modalRef.current === 'win' || modalRef.current === 'gameover') return
    setModal(null)
  }, [])

  const openModal = useCallback((kind: Exclude<ModalKind, null | 'win' | 'gameover'>) => {
    setModal(kind)
  }, [])

  const handleContinue = useCallback(() => {
    setState((s) => continueAfterWin(s))
    setModal(null)
  }, [])

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setSettings((s) => ({ ...s, theme }))
  }, [])

  const setSoundEnabled = useCallback((soundEnabled: boolean) => {
    void unlockAudio()
    setSettings((s) => ({ ...s, soundEnabled }))
  }, [])

  const setMode = useCallback((mode: GameMode) => {
    setSettings((s) => ({ ...s, mode }))
    const best = Math.max(bestForMode(statsRef.current, mode), bestRef.current[mode])
    setState(createGameState(mode, best))
    setUndo(null)
    setModal(null)
    recordedEnd.current = false
  }, [])

  const handleResetStats = useCallback(() => {
    setStats(resetStats())
    setBestByMode({ classic: 0, endless: 0, daily: 0 })
    clearPersisted()
    const next = defaultPayload()
    next.settings = { ...settingsRef.current }
    payloadRef.current = next
    savePersisted({
      ...next,
      settings: settingsRef.current,
      activeGame: null,
      undo: null,
    })
    startFresh(settingsRef.current.mode)
    setModal('settings')
  }, [startFresh])

  return {
    state,
    undo,
    settings,
    stats,
    bestByMode,
    storageStatus,
    scoreDelta,
    showNewRecord,
    modal,
    moveLocked,
    handleMove,
    handleUndo,
    requestNewGame,
    confirmNewGame,
    cancelModal,
    openModal,
    handleContinue,
    setTheme,
    setSoundEnabled,
    setMode,
    handleResetStats,
    dismissStorageBanner: () => setStorageBannerVisible(false),
    storageBannerVisible,
  }
}
