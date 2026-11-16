import { formatDailyDateRu } from './game/daily'
import { Board } from './components/Board'
import { ConfirmModal } from './components/ConfirmModal'
import { GameOverModal } from './components/GameOverModal'
import { SettingsIcon, ThemeIcon } from './components/Icons'
import { RulesModal } from './components/RulesModal'
import { ScoreBoard } from './components/ScoreBoard'
import { SettingsModal } from './components/SettingsModal'
import { StatsModal } from './components/StatsModal'
import { WinModal } from './components/WinModal'
import { useGame } from './hooks/useGame'
import { useKeyboard } from './hooks/useKeyboard'

const MODE_LABELS = {
  classic: 'Классический',
  endless: 'Бесконечный',
  daily: 'Ежедневное испытание',
} as const

const App = () => {
  const game = useGame()
  const {
    state,
    undo,
    settings,
    stats,
    bestByMode,
    scoreDelta,
    showNewRecord,
    modal,
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
    storageBannerVisible,
    dismissStorageBanner,
  } = game

  useKeyboard({
    onMove: handleMove,
    onUndo: handleUndo,
    onNewGame: requestNewGame,
    enabled: modal !== 'settings' && modal !== 'rules' && modal !== 'stats',
  })

  const best = Math.max(state.bestScore, bestByMode[state.mode], state.score)
  const isNewRecordOnOver = state.score >= best && state.score > 0

  return (
    <div className="app">
      {storageBannerVisible ? (
        <div className="banner" role="status">
          <span>
            {game.storageStatus === 'unavailable'
              ? 'Сохранение недоступно — прогресс только в этой сессии.'
              : 'Данные сохранения повреждены и были сброшены.'}
          </span>
          <button type="button" onClick={dismissStorageBanner} aria-label="Скрыть уведомление">
            OK
          </button>
        </div>
      ) : null}

      <header className="header">
        <div className="brand">
          <h1>2048</h1>
          <p>Числовая головоломка</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label={settings.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            onClick={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
          >
            <ThemeIcon dark={settings.theme === 'dark'} />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Настройки"
            onClick={() => openModal('settings')}
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      <div className="mode-chip" aria-label="Текущий режим">
        {MODE_LABELS[state.mode]}
      </div>

      <ScoreBoard score={state.score} best={best} scoreDelta={scoreDelta} />

      {showNewRecord ? (
        <div className="record-toast" role="status">
          Новый рекорд!
        </div>
      ) : null}

      {state.mode === 'daily' && state.dailyDate ? (
        <div className="daily-meta" aria-label="Ежедневное испытание">
          <span>
            Дата: <strong>{formatDailyDateRu(state.dailyDate)}</strong>
          </span>
          <span>
            Ходы: <strong>{state.moves}</strong>
          </span>
          <span>
            Рекорд daily: <strong>{stats.daily.bestScore}</strong>
          </span>
        </div>
      ) : null}

      <Board
        tiles={state.board.tiles}
        onMove={handleMove}
        disabled={state.status === 'lost' || modal === 'win' || modal === 'gameover'}
      />

      <p className="hint">Соединяй одинаковые числа, чтобы получить 2048</p>

      <div className="controls">
        <button type="button" className="btn btn-primary btn-wide" onClick={requestNewGame}>
          Новая игра
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleUndo}
          disabled={!undo || state.status === 'lost'}
          aria-label="Отменить ход"
        >
          Отменить ход
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => openModal('rules')}
        >
          Правила
        </button>
      </div>

      <div className="footer-links">
        <button type="button" onClick={() => openModal('stats')}>
          Статистика
        </button>
        <button type="button" onClick={() => openModal('settings')}>
          Режимы и настройки
        </button>
      </div>

      <p className="hint" style={{ fontSize: '0.8rem' }}>
        Объединяй числа. Думай на несколько ходов вперёд.
      </p>

      {modal === 'rules' ? <RulesModal onClose={cancelModal} /> : null}
      {modal === 'stats' ? <StatsModal stats={stats} onClose={cancelModal} /> : null}
      {modal === 'settings' ? (
        <SettingsModal
          theme={settings.theme}
          soundEnabled={settings.soundEnabled}
          mode={settings.mode}
          onTheme={setTheme}
          onSound={setSoundEnabled}
          onMode={setMode}
          onResetRequest={() => openModal('confirmReset')}
          onClose={cancelModal}
        />
      ) : null}
      {modal === 'win' ? (
        <WinModal
          score={state.score}
          onContinue={handleContinue}
          onNewGame={confirmNewGame}
        />
      ) : null}
      {modal === 'gameover' ? (
        <GameOverModal
          score={state.score}
          best={best}
          maxTile={state.maxTile}
          isNewRecord={isNewRecordOnOver}
          onRetry={confirmNewGame}
          onHome={confirmNewGame}
        />
      ) : null}
      {modal === 'confirmNew' ? (
        <ConfirmModal
          title="Новая игра?"
          message="Текущая партия будет завершена. Продолжить?"
          confirmLabel="Начать заново"
          onConfirm={confirmNewGame}
          onCancel={cancelModal}
        />
      ) : null}
      {modal === 'confirmReset' ? (
        <ConfirmModal
          title="Сбросить данные?"
          message="Статистика, рекорды и сохранённая партия будут удалены."
          confirmLabel="Сбросить"
          danger
          onConfirm={handleResetStats}
          onCancel={() => openModal('settings')}
        />
      ) : null}
    </div>
  )
}

export default App
