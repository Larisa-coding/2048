import type { GameMode } from '../game/types'
import { Modal } from './Modal'

interface SettingsModalProps {
  theme: 'light' | 'dark'
  soundEnabled: boolean
  mode: GameMode
  onTheme: (theme: 'light' | 'dark') => void
  onSound: (enabled: boolean) => void
  onMode: (mode: GameMode) => void
  onResetRequest: () => void
  onClose: () => void
}

const MODES: Array<{ id: GameMode; title: string; desc: string }> = [
  {
    id: 'classic',
    title: 'Классический',
    desc: 'Цель — собрать плитку 2048',
  },
  {
    id: 'endless',
    title: 'Бесконечный',
    desc: 'Играйте до исчерпания ходов',
  },
  {
    id: 'daily',
    title: 'Ежедневное испытание',
    desc: 'Одинаковый старт для всех сегодня',
  },
]

export const SettingsModal = ({
  theme,
  soundEnabled,
  mode,
  onTheme,
  onSound,
  onMode,
  onResetRequest,
  onClose,
}: SettingsModalProps) => (
  <Modal title="Настройки" onClose={onClose}>
    <div className="settings-row">
      <label id="theme-label">Тема</label>
      <div className="segmented" role="group" aria-labelledby="theme-label">
        <button
          type="button"
          aria-pressed={theme === 'light'}
          onClick={() => onTheme('light')}
        >
          Светлая
        </button>
        <button
          type="button"
          aria-pressed={theme === 'dark'}
          onClick={() => onTheme('dark')}
        >
          Тёмная
        </button>
      </div>
    </div>

    <div className="settings-row">
      <label id="sound-label">Звук</label>
      <div className="segmented" role="group" aria-labelledby="sound-label">
        <button
          type="button"
          aria-pressed={soundEnabled}
          onClick={() => onSound(true)}
        >
          Вкл
        </button>
        <button
          type="button"
          aria-pressed={!soundEnabled}
          onClick={() => onSound(false)}
        >
          Выкл
        </button>
      </div>
    </div>

    <p style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text)' }}>
      Режим игры
    </p>
    <p style={{ fontSize: '0.85rem' }}>Смена режима начинает новую партию.</p>
    <div className="mode-list" role="group" aria-label="Режим игры">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          className="mode-option"
          aria-pressed={mode === m.id}
          onClick={() => onMode(m.id)}
        >
          <strong>{m.title}</strong>
          <span>{m.desc}</span>
        </button>
      ))}
    </div>

    <div className="modal-actions">
      <button type="button" className="btn btn-secondary" onClick={onResetRequest}>
        Сбросить статистику и рекорды
      </button>
    </div>
  </Modal>
)
